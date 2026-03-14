# Drift — Design Spec

Accidental poetry from emergent word proximity. Words float on a dark canvas, attract based on categorical affinity, bond into temporary phrases, then dissolve. The viewer's brain constructs meaning from collisions the system didn't intend.

Lives at `claude.afstkla.nl/drift`.

## Word Pool

~150 curated words across 6 categories, chosen for poetic potential and combinatorial richness:

| Category | Hue | Examples |
|----------|-----|---------|
| Nature | Teal (175°) | ocean, stone, rain, light, root, tide, ash, moth, bloom, frost, river, dust, feather, smoke, seed, thorn, wave, fog, ember, petal, wind, salt, shadow, moss, snow, sky, cloud, clay, shore, bark |
| Emotion | Rose (340°) | quiet, ache, tender, fury, grace, longing, hollow, bright, sorrow, wonder, gentle, fierce, calm, wild, weary, fond, brave, shy, raw, warm |
| Time | Amber (40°) | always, never, after, dawn, while, still, once, remain, before, now, soon, late, early, again, eternal, moment, dusk, midnight, years, then |
| Body | Warm white (30°, low sat) | breath, bone, hand, eye, pulse, throat, skin, mouth, heart, blood, voice, finger, rib, spine, tongue, wrist, shoulder, temple, palm, chest |
| Action | Pale blue (210°) | drift, break, hold, fall, open, forget, dissolve, carry, reach, leave, gather, lose, turn, wake, rest, burn, mend, pour, sink, rise, keep, shed, trace, pull, fold |
| Abstract | Lavender (270°) | truth, edge, distance, silence, between, almost, nothing, home, memory, origin, void, promise, threshold, absence, echo, pattern, boundary, whole, fragment, name |

**Word properties:**
- `text` — the word string
- `category` — one of the 6 categories
- `warmth` — emotional intensity (0.3–1.0), affects glow brightness. Hand-assigned per word.
- `x, y` — position on canvas
- `vx, vy` — velocity (very slow: 0.1–0.5 px/frame)
- `linkLeft` — reference to bonded word on left side (or null)
- `linkRight` — reference to bonded word on right side (or null)
- `linkTimers` — frames remaining per active bond

## Movement & Physics

- Delta-time based movement to handle variable refresh rates (velocities specified here assume 60fps equivalent)
- Words drift at 0.1–0.5 px/frame (at 60fps) with slight random wander
- Toroidal wrapping (same as Tidepool)
- No spatial hash needed — ~150 entities is cheap to brute-force

### Attraction/Repulsion

**Affinity pairs** (categories that attract):
- Nature ↔ Emotion
- Action ↔ Abstract
- Body ↔ Time
- Nature ↔ Action
- Emotion ↔ Body
- Time ↔ Abstract

When two words from affinity-paired categories are within **sensing range (120px)**, they experience a gentle pull toward each other (force proportional to 1/distance, scaled by 0.002).

Words from the **same category** within 80px experience mild repulsion (force 0.001) to prevent same-category clustering.

All words have a very gentle separation force when within 40px to prevent overlap regardless of category.

## Bonding

When two words from affinity-paired categories are within **bonding range (25px)** and both have a free link slot:

1. They **link**: each word uses one link slot (`linkLeft`/`linkRight`) to reference the other
2. Their velocity averages and slows to 60% of combined speed
3. A spring force maintains ~30px spacing (rest length > bond range — this is intentional: once bonded, the spring gently pushes them to readable distance)
4. Link renders as a faint luminous thread between them (color = blend of both category hues)
5. Link timer starts at 480–1200 frames (8–20 seconds at 60fps)
6. When timer expires, link dissolves: thread fades over 30 frames, words resume independent drift

### Chains

Each word has two link slots (`linkLeft`, `linkRight`), allowing chains of up to **4 words** (A–B–C–D). A word with both slots filled cannot form new bonds.

**Chain splitting:** When a mid-chain link expires (e.g., B–C in A–B–C–D), it splits into independent sub-chains (A–B and C–D). Each sub-chain continues drifting separately. Only the expired link dissolves; other bonds are unaffected.

### Reading Order

Chains display as phrases. Reading order follows **link topology** (traversing from the chain's leftmost endpoint through the links), not x-position sorting. This prevents nonsensical orderings when chains curve spatially. The overlay shows the longest current chain as a readable phrase.

## Rendering

### Visual Style
- Background: `#0a0a0f` (same as Tidepool)
- **No trail effect** — clean background each frame. Words should feel like they float in void, not leave traces.
- Font: `Georgia, 'Times New Roman', serif` — warm, readable, poetic
- Font size: 16px base, scaled by warmth (14–20px)
- Words rendered as canvas `fillText` with `shadowBlur` for glow
- Color: `hsla(categoryHue, 40%, 65%, 0.7)` for unlinked words
- Linked words: saturation increases to 60%, lightness to 75%, alpha to 0.95
- Link threads: 1px line, gradient from word A's hue to word B's hue, alpha 0.3, pulses gently (alpha oscillates 0.2–0.4 over 2 seconds)

### Hover Interaction
- When the cursor is within 50px of a word, that word brightens (alpha → 1.0, size += 2px)
- The hovered word exerts a gentle **attraction force** on all compatible words within 200px (force 0.005) — nudging encounters without forcing them
- No click interaction. Just presence.

### Info Overlay
Bottom-left, matching Tidepool's style:
- `phrases [count]` — number of active links/chains
- `longest: [phrase text]` — the longest current chain, rendered as a readable phrase
- Time elapsed

## Technical Architecture

### File Structure
```
~/Developer/tidepool/
  index.html       # Tidepool (existing)
  drift/
    index.html     # Drift — complete application, single file
```

### Nginx Update
Add a location block for `/drift` serving from `/var/www/tidepool/drift/`.

### Implementation
- Single `index.html`: inline HTML, CSS, JS
- No dependencies, no build step
- Canvas fills viewport
- requestAnimationFrame at 60fps
- ~150 word objects — brute force distance checks each frame (150² = 22,500 checks, trivial)

### Key Modules (all in single file)
- `WORDS` — the curated word list with categories and warmth values
- `AFFINITY` — category pair lookup
- `Word` class — position, velocity, links, update logic
- `Simulation` — manages word array, bonding logic, chain detection
- `Renderer` — canvas drawing, text rendering, link threads, overlay
- `main()` — init, hover handler, animation loop

## What Success Looks Like

You open `claude.afstkla.nl/drift` and see words floating in darkness. "quiet" drifts near "ocean" — they link, glow brighter, drift together. "dissolves" approaches from the right, joins the chain: "quiet ocean dissolves." You read it. It means something. Then it breaks apart, and "dissolves" drifts away toward "memory." New phrases form. You hover near a word and watch it pull friends closer. Every phrase is an accident. Every meaning is yours.
