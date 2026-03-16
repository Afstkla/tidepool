const express = require('express');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json());

// Database
const db = new Database(path.join(__dirname, 'whisper.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL UNIQUE,
    ip_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    is_seed INTEGER NOT NULL DEFAULT 0
  )
`);

// Seed vocabulary — connective tissue that never expires
const SEEDS = [
  'the','a','and','but','or','in','of','to','is','was',
  'not','with','for','from','this','that','we','they','you','i',
  'it','all','no','yes','here','there','now','then','still','only'
];

// Insert seeds if not present
const insertSeed = db.prepare('INSERT OR IGNORE INTO words (text, ip_hash, created_at, is_seed) VALUES (?, ?, ?, 1)');
const insertSeeds = db.transaction(() => {
  for (const word of SEEDS) {
    insertSeed.run(word, 'seed', 0);
  }
});
insertSeeds();

// Blocklist (hashed for storage, checked plaintext at runtime)
const BLOCKLIST = new Set([
  // Slurs and offensive terms — minimal but effective
  'nigger','nigga','faggot','fag','retard','retarded','kike','spic',
  'chink','wetback','tranny','dyke','cunt','whore','slut',
  'nazi','hitler','rape','rapist',
]);

// Helpers
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'whisper-salt-2026').digest('hex').slice(0, 16);
}

const WORD_LIFETIME_MS = 72 * 60 * 60 * 1000; // 72 hours
const RATE_LIMIT_MS = 6 * 60 * 60 * 1000; // 6 hours

// GET /words — all living words
app.get('/whisper/api/words', (req, res) => {
  const cutoff = Date.now() - WORD_LIFETIME_MS;
  const words = db.prepare(`
    SELECT id, text, created_at, is_seed FROM words
    WHERE is_seed = 1 OR created_at > ?
    ORDER BY created_at ASC
  `).all(cutoff);

  res.json(words.map(w => ({
    id: w.id,
    text: w.text,
    age: w.is_seed ? 0 : (Date.now() - w.created_at) / WORD_LIFETIME_MS, // 0..1 where 1 = about to die
    seed: !!w.is_seed,
  })));
});

// POST /words — add a word
app.post('/whisper/api/words', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ipHash = hashIP(ip);

  // Validate
  let word = (req.body.word || '').trim().toLowerCase();

  if (!word) return res.status(400).json({ error: 'no word given' });
  if (word.length > 20) return res.status(400).json({ error: 'too long (max 20 characters)' });
  if (!/^[a-z]+$/.test(word)) return res.status(400).json({ error: 'letters only' });
  if (BLOCKLIST.has(word)) return res.status(400).json({ error: 'that word is not welcome here' });

  // Check for duplicates (among living words)
  const cutoff = Date.now() - WORD_LIFETIME_MS;
  const existing = db.prepare('SELECT id FROM words WHERE text = ? AND (is_seed = 1 OR created_at > ?)').get(word, cutoff);
  if (existing) return res.status(409).json({ error: 'that word is already drifting' });

  // Rate limit
  const recent = db.prepare('SELECT created_at FROM words WHERE ip_hash = ? AND is_seed = 0 ORDER BY created_at DESC LIMIT 1').get(ipHash);
  if (recent && (Date.now() - recent.created_at) < RATE_LIMIT_MS) {
    const remaining = Math.ceil((RATE_LIMIT_MS - (Date.now() - recent.created_at)) / (60 * 60 * 1000));
    return res.status(429).json({ error: `one word every 6 hours — ${remaining}h remaining` });
  }

  // Insert
  const now = Date.now();
  const result = db.prepare('INSERT INTO words (text, ip_hash, created_at) VALUES (?, ?, ?)').run(word, ipHash, now);

  res.status(201).json({
    id: result.lastInsertRowid,
    text: word,
    age: 0,
    seed: false,
  });
});

// Cleanup: delete expired words periodically
setInterval(() => {
  const cutoff = Date.now() - WORD_LIFETIME_MS;
  db.prepare('DELETE FROM words WHERE is_seed = 0 AND created_at < ?').run(cutoff);
}, 60 * 60 * 1000); // every hour

const PORT = 3847;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Whisper API listening on port ${PORT}`);
});
