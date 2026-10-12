# World Seed — Three.js Scene Editor

A local-first scene editor for the Digital World Building workshop. This editor direction supersedes the earlier Aurora Station milestone plan; the old scope and brief are retained as workshop reference material.

## Run locally

Requires Node.js 20+ (Node 24 recommended). No installation or build step:

```sh
cd demo
node server.mjs
```

Open http://127.0.0.1:8080. The local-only server saves JSON directly into `demo/levels/`. Start with the bundled **Park study**, or click **New**. The previous `python -m http.server` / `npx serve` commands also display the editor, but use browser storage instead of writing to the project folder.

## Edit a scene

- Add primitives, building pieces, trees, cars, benches, rocks, bushes, streetlamps, and lights from the object library.
- Click an object in the viewport or object list. Use **W / E / R** for move / rotate / scale handles, or enter exact inspector values. Units are meters; rotation fields use degrees.
- Drag the background to orbit, right-drag to pan, and scroll to zoom. **F** focuses the selection; **Frame all** shows the scene.
- Change colors, visibility, light intensity, background, or ambient light. Sun lights aim toward the world origin. Streetlamps include a fixed warm bulb; use a separate point light when you need adjustable intensity.
- **Ctrl/Cmd D** duplicates; **Delete** removes; **Ctrl/Cmd Z** undoes; **Ctrl/Cmd Shift Z** redoes. History retains up to 35 scene snapshots in memory.
- **Ctrl/Cmd S** saves. **Open** lists saved scenes. **Export JSON** downloads a portable copy; the Open dialog can import one. Unsaved edits prompt before closing or replacing the scene. Saves with the same filename ask before replacing.

## Your own models

Click **Import GLB model** or drop a `.glb` onto the viewport. Use self-contained, uncompressed GLB 2.0 files with embedded textures (20 MB maximum per model). Draco, Meshopt, KTX2, external textures, OBJ, and FBX are not currently supported. Model animation is not played. Import preserves authored units and materials; use scale controls if necessary.

Imported GLBs are embedded into saved JSON, so scene files can be reopened without the source model. Scenes support up to 1,000 objects and 40 MB of JSON. Large models and undo history consume memory; small optimized assets work best. Confirm that you have rights to share any models before committing scenes to a public repository.

## GitHub Pages

The repository workflow `.github/workflows/pages.yml` publishes this editor as the site's root. In the GitHub repository, select **Settings → Pages → Source → GitHub Actions**, then push the changes to `master`/`main` or run **Deploy scene editor to GitHub Pages** in Actions. No secrets, API keys, or backend are needed. The workflow packages only the editor and its bundled levels, not the workshop handouts or local server.

All application URLs are relative, supporting `https://<owner>.github.io/<repository>/` and custom domains. The engine and controls are vendored; the editor makes no third-party runtime requests.

On GitHub Pages:

- **Save scene** stores scenes in IndexedDB in the current browser and site origin. These are private to that browser profile; they do not write to GitHub or sync to other devices.
- **Export JSON** creates a backup or a file you can share. Clearing site data removes browser saves. Import a JSON copy to restore it.
- To publish a shared starter scene, export its JSON, place it in `demo/levels/`, and commit it. The deployment script automatically lists the levels in `levels/index.json`.
- If you publish manually, run `node scripts/package-pages.mjs` and deploy the contents of `demo/dist-pages/`.

## Verify

```sh
npm test
node scripts/package-pages.mjs
```

`tests/browser-smoke.mjs` runs editor integration checks against an isolated Chrome debugging session on port 9223 and the local editor on port 8080. It writes a screenshot and a small GLB fixture under `tests/`, then saves and removes a temporary level. It requires Node 24's built-in WebSocket. Test coverage includes editor startup, transformations, duplicate/delete, undo/redo, GLB import, folder save/reopen, and API validation.

Libraries: Three.js 0.180.0 and its official addons, MIT license in `vendor/three/LICENSE`. The previous A-Frame bundle is retained but is no longer loaded.
