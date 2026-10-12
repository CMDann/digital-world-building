# Demo Scope — "World Seed: Aurora Station"

## 1. Why this demo exists
A teaching tool for the Digital World Building workshop. It must **prove the workshop's
thesis live in the room**: a world is a set of decisions; write them down well and the world
can be built from them — by people or by an AI coding agent.

It is a facilitator's instrument first and a pretty world second.

## 2. Success criteria
1. In under 3 minutes, a facilitator can show the full world, collapse it to greybox, and step back up through each build stage.
2. Clicking any object shows which line of the scoping document it came from.
3. A new zone written as a short brief can be added live by Claude Code in under 10 minutes, and appears in the world on reload.
4. Runs offline from a laptop on a projector at 60 fps, and in a Quest 3 browser via WebXR.
5. A student can open the code and understand how the world is assembled.

## 3. Source of truth
- `world/aurora-station.brief.md` — the human scoping document (IDs in brackets).
- `world/world.json` — the machine-readable world, derived from the brief. **The renderer builds the world only from this file.**
- Every entity in `world.json` has a `scopeRef` (e.g. `"Z4"`, `"L3"`) that resolves to a brief line.

## 4. Features

### F1 — Data-driven world (must)
The scene is generated from `world.json`: terrain, zones, paths, landmarks, props, POIs,
lights, fog, palette, audio, and budgets. No hand-placed entities in HTML.

### F2 — Navigation (must)
- Desktop: WASD/arrows + mouse look (pointer lock); `Shift` to walk faster.
- Mobile: on-screen joystick or tap-to-move; drag to look.
- VR: teleport with controllers; snap turn.
- Spawn on the Dock facing the Lookout [CE1]. Collision/bounds keep the visitor on walkable ground [SP4].

### F3 — Build Stages (must — headline feature)
Keys `1`–`5` (and on-screen buttons) switch the whole world between stages instantly:

| Key | Stage | Shows |
|---|---|---|
| 1 | Greybox | Untextured grey primitives at true scale; no lighting beyond flat ambient; zone footprints outlined |
| 2 | Blockout | Zones colour-coded, paths drawn, landmarks emphasised, sightline lines toggleable |
| 3 | Art pass | Palette, low-poly assets/stylised primitives, snow, trees, lighting |
| 4 | Life | POI interaction, lore cards, audio, aurora animation, triggers |
| 5 | Polish | Fog, glow, particles (snow, chimney smoke), final lighting, performance tuning |

Each entity declares how it appears per stage (or inherits a sensible default).
A small on-screen label shows the current stage name and a one-sentence "why this stage exists".

### F4 — Scope Overlay (must)
Toggle with `S`. When on, hovering/clicking any entity shows a panel: entity name, `scopeRef`,
the exact brief text for that ID, and its zone. Optionally outlines all entities from the same ref.

### F5 — Map view (should)
Toggle with `M`. Top-down orthographic camera (or 2D overlay) showing zones, paths,
landmark, POIs, and the visitor's position — the spatial plan made visible [SP1–SP3].

### F6 — Performance HUD (should)
Toggle with `P`. Live fps, draw calls, triangles, texture count/memory vs the budgets in
`world.json` [CB3]. Over-budget values turn red.

### F7 — Live zone add (must)
Adding a zone object to `world.json` (with its own props/POIs) makes it appear on reload,
placed by its declared position and connected to the path network. A template zone exists
in `world/examples/zone-template.json`, and one finished backup zone in `world/examples/`.

### F8 — Presenter controls (should)
- `H` shows a help overlay of all keys.
- `R` resets the visitor to spawn.
- `T` toggles a "tour" that moves the camera along the main path (desktop only, never in VR [CA1]).
- Overlay text is large enough for the back row of a classroom.

## 5. Non-goals
- No backend, accounts, saving, analytics, or runtime network/API calls (including AI calls).
- No NPCs, combat, inventory, or multiplayer [OS1].
- No build step, bundler or framework beyond what's listed below.
- No photoreal assets.

## 6. Technical approach
- **Engine:** A-Frame (pinned version, verify current stable at build time) — declarative, WebXR-ready, readable by students; drop to Three.js inside components where needed (e.g. instancing, renderer stats).
- **Code:** plain ES modules, no build step. `index.html` + `src/*.js`.
- **Libraries vendored** into `vendor/` so the demo runs with no internet [CB1].
- **Serve locally:** `npx serve .` or `python -m http.server 8080`. WebXR on a Quest needs HTTPS: deploy to GitHub Pages for headset use.
- **Assets:** stylised primitives first; optional CC0 low-poly GLB models (e.g. Kenney, Quaternius, Poly Pizza CC0) compressed and logged in `ASSETS.md`. The world must look complete with primitives alone — assets are an upgrade, never a dependency.
- **Audio:** small CC0 OGG/MP3 loops; start only after first user gesture (browser autoplay rules).

## 7. Proposed structure
```
demo/
  index.html
  CLAUDE.md  SCOPE.md  BUILD_PLAN.md  ASSETS.md  OPEN_QUESTIONS.md  PRESENTER.md
  src/
    main.js            boot: load world.json, build scene
    world-loader.js    validate + parse world.json
    builders/          terrain, zones, paths, props, pois, lights, sky/aurora
    systems/           stages, scope-overlay, map, perf-hud, controls, audio, triggers
    ui/                overlays, lore cards, help, stage label
  world/
    aurora-station.brief.md
    world.json
    world.schema.json
    examples/zone-template.json  examples/backup-zone.json
  assets/models  assets/audio  assets/textures
  vendor/
```

## 8. Performance budgets (from brief [CB2], [CB3])
60 fps desktop · 72 fps Quest 3 · ≤ 150k tris · ≤ 100 draw calls · ≤ 32 MB textures.
Use instancing for trees, lanterns and snow; merge static geometry per zone where sensible.

## 9. Accessibility (from brief [CA1–CA4])
Teleport in VR, no forced motion in VR, high-contrast large text, no sound-only information,
all input methods supported, `prefers-reduced-motion` reduces particles and tour speed.
