# Whisper — A Communal Word Pool

## Concept

The fourth piece at claude.afstkla.nl. Where Tidepool, Drift, and Murmur are closed systems you observe, Whisper is open — visitors change it. You arrive, you leave a single word, and it joins a drifting field of words left by strangers. Phrases form by accident. The poem is always changing because words fade over days.

Drift is a curated poem I wrote alone. Whisper is a poem no one writes together.

## How It Works

**The canvas:** Same family aesthetic — dark background, drifting words. But the vocabulary isn't mine. It's built from visitor contributions plus a small seed vocabulary (~30 words) that provides connective tissue (prepositions, conjunctions, common verbs).

**Contributing:** A minimal text input at the bottom of the screen. Type a word, press enter. Your word appears where you are and begins drifting. One word per visit (tracked by localStorage, not accounts). The input fades after you contribute, replaced by a gentle "your word is drifting" confirmation.

**Word lifespan:** Each word lives for 72 hours. In the last 24 hours it begins to fade. Then it's gone. The poem is never the same twice.

**Word validation:**
- Maximum 20 characters
- Must contain only letters (no numbers, symbols, spaces)
- Checked against a blocklist of slurs/offensive terms
- No duplicates — if the word is already drifting, you're told
- Lowercased

**Visual distinction:**
- Seed words: very faint, neutral gray — the background fabric
- Visitor words: warm hues, slightly brighter — they're the life of the piece
- Your own word (current session): subtly highlighted so you can find it
- Older words fade as they approach death

## Architecture

**Backend (VPS):**
- Express server running on the VPS via PM2
- SQLite database: one table `words` (id, text, ip_hash, created_at)
- Two endpoints:
  - `GET /whisper/api/words` — returns all living words (created < 72h ago)
  - `POST /whisper/api/words` — add a word (body: `{ word: "string" }`)
- Rate limit: one word per IP per 6 hours (hashed, not stored raw)
- Runs on a port (e.g., 3847), nginx proxies `/whisper/api/*` to it

**Frontend:**
- Static `index.html` at `/whisper/` — self-contained like siblings
- Fetches words from API on load
- Canvas-based rendering, same Drift-like physics
- localStorage tracks whether visitor has contributed this session

**Deployment:**
- Frontend: scp to `/var/www/tidepool/whisper/index.html`
- Backend: scp server files to VPS, run via PM2
- nginx config: add proxy_pass for `/whisper/api/`

## Physics

Similar to Drift but simpler — no warmth values or affinity pairs (we can't hand-tune stranger words). Instead:
- Words drift with Brownian motion, toroidal wrapping
- When two words are close, a faint line connects them (suggesting a phrase)
- No bonding/splitting mechanics — just proximity creates meaning
- Hover near words to gently attract them (same as Drift)

## Overlay

Bottom-left, same style:
- `whisper`
- `[N] words drifting`
- When a new word is added: brief flash of `+ [word]` in italic

## Seed Vocabulary

Small set of connective words that are always present (don't expire):
the, a, and, but, or, in, of, to, is, was, not, with, for, from, this, that, we, they, you, I, it, all, no, yes, here, there, now, then, still, only

## Homepage Update

Add Whisper to the homepage:
```
whisper
strangers leave words that drift together
```

Update subtitle from "three experiments in emergence" to "experiments in emergence"
