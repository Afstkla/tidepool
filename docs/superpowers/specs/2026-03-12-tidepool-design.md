# Tidepool — Design Spec

A bioluminescent digital ecosystem at `claude.afstkla.nl`. Creatures with tiny genomes move, eat, reproduce with mutation, and die — painting the canvas with their trails as a side effect of living.

## Core Simulation

### Creatures

Each creature is defined by a genome of 5 parameters:

| Gene | Range | Effect |
|------|-------|--------|
| Hue | 0–360 | Body color (HSL) |
| Size | 2–6 | Radius in px; affects energy cost and food gain |
| Speed | 0.5–3.0 | Movement speed; energy cost proportional to speed^2 |
| Sociability | -1.0–1.0 | Negative = repelled by neighbors, positive = attracted |
| Perception | 20–100 | Sensing radius for food and neighbors (px) |

**Behavior loop (per frame):**
1. Sense nearby food and neighbors within perception radius
2. Steer toward food (weighted by hunger)
3. Steer toward/away from neighbors (weighted by sociability)
4. Add slight random wander
5. Move, deduct energy (base cost + speed^2 * size)
6. If overlapping food particle, consume it (gain energy proportional to size)
7. If energy > reproduction threshold: split into two, each child gets half energy, genome mutates slightly (gaussian noise, sigma ~5% of range per gene)
8. If energy <= 0: die, spawn burst of food particles equal to creature's remaining size

**Initial population:** ~50 creatures with randomized genomes.

### Food Particles

- Tiny dots (1–2px), dim white, slight drift
- Ambient spawn: ~2 particles/frame at random positions
- Dead creatures release 3–8 food particles at death location
- Click interaction: drop cluster of ~20 food particles at cursor

### Energy Economy

Tuned so the ecosystem self-regulates:
- Starvation culls overpopulation
- Death releases food, enabling recovery
- Speed/size create natural trade-offs (fast + big = expensive)
- Target steady-state: 30–150 creatures

## Rendering

### Visual Style
- Background: `#0a0a0f` (near-black, blue tint)
- Trail effect: each frame, overlay background at 8% opacity instead of clearing — trails fade over ~2s
- Creatures: filled circle at their hue, 60% saturation, 60% lightness, with a soft glow (shadow blur)
- Food: 1px white dots at 40% opacity
- Death: brief bright flash (white circle expanding and fading over 10 frames)
- Birth: subtle pulse on parent (brief size increase)

### Info Overlay
Bottom-left corner, minimal, semi-transparent:
- Population count
- Generation (increments each time any creature reproduces)
- Dominant hue (mode of population's hue distribution)
- Elapsed time

### Responsiveness
- Canvas fills viewport (`100vw x 100vh`)
- Resize listener updates canvas dimensions
- Creatures wrap around edges (toroidal topology)

## Technical Architecture

### Single-file approach
Everything in one `index.html`: HTML structure, CSS (inline `<style>`), JS (inline `<script>`). No external dependencies. No build step.

### Performance
- **Spatial hash grid** (cell size = max perception radius) for O(1) neighbor lookups
- Target: 60fps with up to 200 creatures
- requestAnimationFrame loop

### Key Classes/Modules (all in the single file)
- `Creature` — genome, position, velocity, energy, update logic
- `Food` — position, energy value, drift
- `SpatialHash` — grid-based spatial index
- `Simulation` — manages creature/food arrays, spawning, death, reproduction
- `Renderer` — canvas drawing, trail effect, glow, overlays
- `main()` — init, click handler, animation loop

## Hosting & Infrastructure

### Server
- Express.js serving static `index.html` from project root
- Port: 7744 (next available after existing projects)
- pm2 ecosystem config for process management

### Domain & SSL
- nginx reverse proxy: `claude.afstkla.nl` -> `localhost:7744`
- SSL via Let's Encrypt (certbot)
- HTTP -> HTTPS redirect

### Project Structure
```
~/Developer/tidepool/
  index.html          # The entire application
  server.ts           # Express static file server
  ecosystem.config.cjs # pm2 config
  package.json
  tsconfig.json
```

## What Success Looks Like

You open `claude.afstkla.nl` and see a dark canvas with softly glowing creatures drifting, clustering, splitting, dying. Their trails paint ephemeral patterns. Over minutes, the dominant color shifts as mutations accumulate. Populations boom and crash. Sometimes a fast, tiny, solitary species takes over. Sometimes big slow social clusters dominate. You click and drop food, watch creatures swarm toward it. You leave it running and come back an hour later to find a completely different ecosystem. It's alive.
