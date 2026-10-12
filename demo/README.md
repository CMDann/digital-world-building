# Aurora Station — World Seed Demo

Interactive demo for the Digital World Building workshop (Red River College Polytechnic).
See `CLAUDE.md`, `SCOPE.md`, `BUILD_PLAN.md` and `world/aurora-station.brief.md` for the full
build process and source-of-truth documents.

## Run it

No build step, no install. From this folder:

```
npx serve .
```

or

```
python -m http.server 8080
```

Then open the printed local URL (e.g. `http://localhost:8080`) in a browser. The page works
with Wi-Fi off — every library is vendored into `vendor/`, and the app makes no runtime
network calls.

For WebXR on a Quest 3, serve over HTTPS (e.g. GitHub Pages) — the headset browser requires
a secure context for WebXR.

## Vendored libraries

| Library | Version | File | Licence | Source |
|---|---|---|---|---|
| A-Frame | 1.8.0 | `vendor/aframe-1.8.0.min.js` | MIT | https://aframe.io/releases/1.8.0/aframe.min.js |

## Status

Building milestone by milestone per `BUILD_PLAN.md`. Current: **M0 — Scaffold & offline boot**.
