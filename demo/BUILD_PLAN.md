# Build Plan — Aurora Station Demo

Build milestones **in order**. Do not start a milestone until the previous one meets its
acceptance criteria and has been checked in a browser. After each milestone, update the
status table and stop for review unless told to continue.

| # | Milestone | Status |
|---|---|---|
| M0 | Scaffold & offline boot | ☐ |
| M1 | world.json + schema + loader | ☐ |
| M2 | Greybox world from data | ☐ |
| M3 | Navigation (desktop, mobile, VR) | ☐ |
| M4 | Build Stages 1–5 | ☐ |
| M5 | Scope Overlay | ☐ |
| M6 | Life layer: POIs, lore cards, triggers, audio, aurora | ☐ |
| M7 | Map view + Performance HUD | ☐ |
| M8 | Polish pass & budgets | ☐ |
| M9 | Live-zone workflow & presenter kit | ☐ |
| M10 | Verification & rehearsal | ☐ |

---

### M0 — Scaffold & offline boot
- Create the folder structure in SCOPE.md §7.
- Vendor a pinned A-Frame build into `vendor/`; `index.html` loads it locally.
- Add `ASSETS.md` (licence ledger), `OPEN_QUESTIONS.md`, and a short `README` section on how to run.

**Accept when:** with Wi-Fi off, `npx serve .` (or `python -m http.server`) serves a page showing an empty A-Frame scene with no console errors.

### M1 — world.json, schema & loader
- Write `world/world.schema.json` (JSON Schema) covering: meta, palette, budgets, spawn, zones, paths, entities (props, landmarks, POIs, lights), audio, sky/aurora, triggers, and per-entity `stages` and `scopeRef`.
- Write `world/world.json` for Aurora Station, derived **only** from the brief. Anything the brief doesn't specify: choose a sensible value and log it in `OPEN_QUESTIONS.md` as an assumption.
- `world-loader.js` loads and validates; on error, show a readable on-screen message naming the bad field.
- Add `world/examples/zone-template.json`.

**Accept when:** every entity has a `scopeRef` that exists in the brief (write a small check that runs in the browser console or via `node scripts/check-refs.mjs`); breaking the JSON shows a clear error, not a blank screen.

### M2 — Greybox world from data
- Builders create terrain, lake plane, zone footprints, paths, landmark (12 m tower), hut, dock, trees, lanterns — as grey primitives at true scale.
- Use instancing for repeated items (trees, lanterns).

**Accept when:** layout matches the brief's spatial plan [SP1–SP3]; the tower is visible from the dock spawn; a 1.6 m eye height looks right next to a 2.1 m door.

### M3 — Navigation
- Desktop WASD + pointer-lock mouse look; mobile touch controls; VR teleport + snap turn.
- Spawn on the dock facing the tower. Keep the visitor on walkable ground.

**Accept when:** the full route dock → hut → trail → lookout top can be walked on desktop, and teleported in WebXR (test with the WebXR emulator if no headset).

### M4 — Build Stages
- A `stages` system switches all entities between stages 1–5 via keys and on-screen buttons, instantly, with no reload.
- Stage label shows name + one-sentence rationale.

**Accept when:** stepping 1→5→1 repeatedly causes no errors, leaks or frame drops; each stage is visibly distinct and matches SCOPE.md F3.

### M5 — Scope Overlay
- `S` toggles. Hover/click shows entity name, `scopeRef`, exact brief text for that ID (parsed from the brief file at load or compiled into a lookup), and zone.

**Accept when:** clicking the tower, any lantern, the hut and each POI shows the correct brief line; overlay is readable from the back of a classroom on a projector.

### M6 — Life layer
- POIs [L1–L5] glow on hover and open/close lore cards [I1].
- Lookout trigger ramps aurora and music [I2]; hut trigger fades in interior light and fire audio [I3].
- Aurora as an animated shader or layered animated ribbons in the brief's colours.
- Audio starts on first user gesture; volume sensible; mute key `N`.

**Accept when:** all interactions work by mouse, touch and VR controller; no information is sound-only.

### M7 — Map view & Performance HUD
- `M` toggles a top-down map with zones, paths, POIs, landmark and visitor marker.
- `P` toggles a HUD: fps, draw calls, triangles, textures vs budgets from `world.json`; red when over.

**Accept when:** HUD numbers match `renderer.info`; map positions match the world.

### M8 — Polish pass & budgets
- Fog, snow particles, chimney smoke, lantern glow, final lighting [LS3].
- Optional CC0 GLB models swapped in for primitives at Stage 3+, each logged in `ASSETS.md`.
- `prefers-reduced-motion` support.

**Accept when:** Stage 5 meets every budget in [CB2]/[CB3] on the presenter laptop; the world still looks complete if `assets/models` is empty.

### M9 — Live-zone workflow & presenter kit
- New zones added to `world.json` appear on reload and connect to the path network.
- Build `world/examples/backup-zone.json` (a finished extra zone, e.g. "Supply Shed") as the live-demo fallback.
- `PRESENTER.md`: key cheat sheet, the 3-minute Module 0 reveal script, the live-build prompt to use in Module 3, and a recovery checklist.
- `H` help overlay, `R` reset, `T` tour.

**Accept when:** a facilitator, following PRESENTER.md only, can add the backup zone in under 2 minutes; a new zone written from the template by Claude Code from a 10-line brief works first time.

### M10 — Verification & rehearsal
- Walk every item in SCOPE.md §2 and tick it.
- Test: Chrome + Edge desktop, a phone, Quest 3 browser (via GitHub Pages HTTPS), offline laptop.
- Run the ref check; zero orphan entities, zero unused brief IDs except [OQ*] and [OS*].
- List known issues in OPEN_QUESTIONS.md.

**Accept when:** all success criteria pass and Dann has rehearsed the reveal and live build once.
