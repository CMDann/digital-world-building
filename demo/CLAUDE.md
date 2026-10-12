# CLAUDE.md — Aurora Station Demo

You are building the interactive demonstration for **Digital World Building**, an in-person
workshop at Red River College Polytechnic run by Dann Blair (BSD XR). Students will watch this
built, read its code, and see you extend it live. Build it the way the workshop teaches.

## Read first, every session
1. `SCOPE.md` — what we're building and why
2. `BUILD_PLAN.md` — the milestone to work on and its acceptance criteria
3. `world/aurora-station.brief.md` — the world's scoping document (source of truth for content)
4. `OPEN_QUESTIONS.md` — assumptions and unresolved items, once it exists

## How to work
- Work **one milestone at a time**, in order. When its acceptance criteria are met, update the status table in BUILD_PLAN.md, summarise what changed, and stop for review.
- Before writing code for a milestone, state a short plan (files to touch, approach). Keep changes small.
- Verify in a real browser before calling anything done. Check the console for errors. If you can't run a browser, say so and list exactly what Dann should check.

## Rules of the world
- **The brief is the source of truth for content.** Don't invent lore, zones, characters or interactions it doesn't contain. If something is missing, choose a neutral default, and log it in `OPEN_QUESTIONS.md` as `[ASSUMPTION]`.
- **Every entity in `world.json` has a `scopeRef`** that matches an ID in the brief. No orphans.
- **The renderer builds the world only from `world.json`.** No hand-placed entities in `index.html`.
- **1 unit = 1 metre.** Eye height 1.6 m.
- **Culture:** never add Indigenous names, symbols, stories or sacred content, or mythology for the aurora [CU1, CU2].

## Rules of the code
- Plain ES modules, no build step, no framework beyond A-Frame (pinned, vendored in `vendor/`). Use Three.js through A-Frame where needed.
- **Ask before adding any dependency.** Vendor anything approved; the demo must run with no internet.
- No runtime network calls, analytics, or AI/API calls.
- Write for students: clear names, small files, and a short comment at the top of each builder/system explaining the **world-building concept** it implements (e.g. "Wayfinding: lanterns lead the eye to the landmark").
- Keep to the budgets in SCOPE.md §8. Prefer instancing and merged static geometry.
- Accessibility per SCOPE.md §9: teleport in VR, no forced motion in VR, large high-contrast text, no sound-only info.

## Assets
- Primitives first; the world must look complete with no external models.
- Only CC0 assets. Log every one in `ASSETS.md` (name, source URL, author, licence, file, triangles).
- Compress models (GLB; meshopt/Draco where supported). Keep textures small.

## Live workshop mode
When asked to add a zone from a participant brief during the workshop:
1. Read their brief; list any gaps in one short block and choose defaults — don't stall the room.
2. Add new brief IDs to a new section at the end of `world/aurora-station.brief.md` (e.g. `[G1-Z1]`).
3. Add the zone to `world.json` from `world/examples/zone-template.json`, connected to the path network, with `scopeRef`s.
4. Keep it under budget and explain the change in 3–5 plain sentences the room can follow.

## Don't
- Don't refactor working milestones while building a later one unless asked.
- Don't delete files; propose deletions instead.
- Don't mark a milestone complete without meeting every acceptance criterion.
