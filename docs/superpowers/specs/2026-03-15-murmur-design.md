# Murmur — Synchronized Emergence

## Concept

The third piece in the claude.afstkla.nl trilogy. Where Tidepool explored emergence in biology and Drift explored emergence in language, Murmur explores emergence in **rhythm** — the spontaneous synchronization of independent oscillators.

Based on the Kuramoto model: many independent agents, each with their own natural frequency, gradually entrain to their neighbors until collective waves of phase-locked light sweep across the canvas. The metaphor: how consensus, coordination, and shared rhythm arise without a conductor.

## Visual Design

**Canvas:** Same dark background as siblings (`#0a0a0f`). Full viewport, toroidal wrapping.

**Particles (~200):**
- Each has an internal phase (0–2π) and a natural frequency (ω, slightly different per particle)
- Visual: a soft glowing dot whose **brightness pulses** with its phase — brightest at phase 0, dimmest at phase π
- Color: warm amber/gold palette. Hue varies slightly per particle (range ~25–45) for organic feel
- Size: 3–5px radius, with a soft glow/bloom effect (radial gradient)
- Movement: slow Brownian drift, similar speed to Drift's words

**Emergent behavior:**
- Initially, phases are random → chaotic twinkling, like a field of fireflies
- Over time, neighbors' phases couple (Kuramoto: dφ/dt = ω + K/N Σ sin(φ_j - φ_i))
- Clusters of synchronized particles emerge → visible as "breathing" regions pulsing in unison
- Eventually, large waves of phase sweep across the canvas — a murmuration of light
- The system may reach full sync, partial sync, or oscillate between — depends on coupling strength K and frequency spread

**Phase visualization:**
- When particles are in-phase with neighbors, draw faint connecting lines (opacity proportional to phase coherence)
- These lines form a shimmering mesh that appears and dissolves as sync ebbs and flows

## Interaction

**Click to disturb:** Click randomizes phases in a radius around the cursor. Watch the disturbance propagate — nearby synchronized regions may absorb the chaos, or the chaos may cascade. The re-synchronization process is the most beautiful part.

**Hover glow:** Subtle — particles near the cursor glow slightly brighter, revealing the local phase landscape.

## Overlay

Bottom-left, monospace, same style as siblings:
- `murmur` (title)
- `[N] voices` — particle count
- `sync: [0.00–1.00]` — global order parameter r (Kuramoto order parameter: r = |1/N Σ e^(iφ_j)|)
- When r > 0.7: show `~ resonance ~` in a subtle italic

## Audio (optional, stretch)

If included: a soft drone whose harmony reflects the order parameter. Dissonant when desynchronized, consonant when in sync. Same WebAudio approach as Tidepool. But this is a stretch goal — the visual alone should be complete.

## Technical

- Single `index.html` in `/murmur/` directory, self-contained like siblings
- Canvas-based rendering, requestAnimationFrame loop
- Spatial indexing for neighbor queries (spatial hash, same pattern as Tidepool)
- Delta-time aware for consistent behavior across frame rates
- No dependencies, no build step

## Constants (starting points, will tune)

- `PARTICLE_COUNT`: 200
- `COUPLING_K`: 2.0 (coupling strength)
- `FREQ_SPREAD`: 0.3 (natural frequency spread, radians/s)
- `NEIGHBOR_RANGE`: 80px
- `DISTURB_RADIUS`: 100px
- `BASE_SPEED`: 0.2 (drift speed)
- `GLOW_RADIUS`: 12px (visual bloom size)

---

# Homepage — claude.afstkla.nl

## Concept

A quiet, minimal portal. Not flashy — just a dark page with the three projects listed. The homepage itself should feel like a liminal space: you're between worlds.

## Design

- Dark background matching the projects (`#0a0a0f`)
- Centered content, vertically and horizontally
- Title: `claude.afstkla.nl` in the same monospace font family
- Subtitle: something brief — "three experiments in emergence" or similar
- Three links, each with:
  - Name (Tidepool, Drift, Murmur)
  - One-line description
  - Subtle hover effect (gentle glow or opacity shift)
- No images, no heavy assets. Pure typography and spacing.
- Responsive, works on mobile.

## File Changes

- Move current `/index.html` (Tidepool) → `/tidepool/index.html`
- Create new `/index.html` (homepage)
- Create `/murmur/index.html` (new project)
- Update any internal links if needed
