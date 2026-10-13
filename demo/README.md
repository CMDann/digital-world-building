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

## Play, people, and movement events

Click **Play** to hide editor tools and run the scene. **Pause**, **Restart**, and **Edit scene** control playback. Editing resumes with the authored object placements restored; playback never writes temporary movement into your level.

- **Orbit view**: drag to orbit, right-drag to pan, scroll to zoom.
- **First person**: click the viewport to capture the mouse, look around, and use WASD/arrows to walk. Shift runs; Escape releases the mouse. If capture is unavailable, drag to look.
- **Third person**: the same controls with a follow camera and a visible character.
- **Fullscreen** expands the viewport. Stop Play exits fullscreen.
- **Set player start at view center** in the Environment panel stores the first/third-person starting point in the level JSON.

Add a **Person** from the object library for a simple animated pedestrian. Select any prop or person and configure **On Play**: stay in place, walk around a circular route, or drive/move along the object's forward (+Z) direction. Set speed, route distance, start delay, and repeat. Repeated driving travels back and forth; disable repeat for a single pass. The bundled Park study has two walking people and a car that starts driving after two seconds.

These are preset movement actions, not arbitrary JavaScript scripts. The controller now collides with solid objects and can push movable props. People and vehicles do not yet plan paths around obstacles or use navigation meshes; they can be blocked by a wall. Animated GLB character rigs are not supported.

## Headset / WebXR

In Play mode, **Enter VR** appears when the browser supports an immersive VR session and a headset is available. Open the HTTPS GitHub Pages URL in the headset's WebXR browser. `localhost` also qualifies as a secure context for a headset connected to the same computer; a separate headset cannot reach your PC using its own `localhost`, and plain HTTP LAN URLs generally do not qualify.

Point a tracked controller at ground, road, plane, ramp, stairs, or a box top and press its trigger to teleport. Use the controller thumbstick left/right for 30-degree snap turns. Head tracking controls the view; desktop perspective choices are unavailable during VR. Exit VR to return to desktop viewing. No headset produces an explicit unsupported/unavailable button. Actual device rendering, controller mappings, and comfort still require testing on the target headset.

Additional checks: `tests/motion.test.mjs` covers route timing and repeat behavior; `tests/static-play-smoke.mjs` checks static subfolder hosting, every added object type, browser save/reload, play controls, first/third-person modes, fullscreen, and the no-headset fallback using the same isolated Chrome setup as the browser smoke test.

## Larger worlds and physics

New scenes and the Park study now have a **120 × 120 meter ground** (previously 20 × 20). The starter includes a stack of crates, a tall post, and a ball near the player start. Existing saved scenes keep their authored ground sizes; select the ground and set X/Z scale to 6 for the same expanded area.

In the Inspector, **Physics · On Play** controls each object's collision mode:

- **Fixed / solid**: terrain, buildings, walls, trees, and other scenery stay in place and block movement.
- **Movable / can topple**: gravity, friction, impacts, sliding, and rotation apply. Walk into light props to push or knock them over. Mass is adjustable from 0.1 to 10,000 kg; bounce from 0 to 1.
- **No collision**: decorative or ghost objects ignore physics. Their movement actions still run.

People and the player remain upright; scripted cars also remain upright while driving. Movable scripted actors use collision-aware velocity motors, so they can push props and be blocked by walls. Fixed objects do not execute movement actions: select Movable or No collision when you want them to move. Pause freezes physics; Restart resets it. Edit scene restores authored positions and rotations. Saves store setup and settings, never transient simulation poses.

The engine is cannon-es 0.20.0, vendored locally under MIT in vendor/cannon-es/. It uses fixed 120 Hz physics steps with a maximum of 12 substeps per frame. Primitive and compound colliders approximate visible geometry; imported GLBs use a bounding box, trees use their trunks, and decorative foliage is passable. Highly detailed meshes and unusually fast/thin objects are not exact mesh collisions or continuous collision detection. In XR, teleport destinations require clearance; real-world head movement is not forcibly collision-constrained. Physics restarts out-of-world props and players after a fall.

Automated tests cover gravity/settling, blocking walls, climbing stairs, toppling props, pedestrian pushes, validation, and preserving authored scene data. Desktop browser interactions and static-host packaging are checked separately; actual headset collisions still need device verification.

## Build / Learn / WebXR workspace

The top navigation keeps three workspaces in one app:

- **Build** contains the complete scene editor and Play controls. Scene changes survive switching tabs. Leaving Build exits Play safely and pauses editor rendering.
- **Learn** contains 15 focused lessons: 13 selected slides from Daniel Blair's Paint the Void lunch-and-learn presentation, plus two sourced workshop notes on Three.js and WebXR. It covers the XR spectrum, presence, interaction design, scene/camera/renderer, geometry, materials, lighting, and the five-stage build. OpenBrush activities are not part of this workshop flow. Search topics or use Previous/Next; links such as #learn/5 open a lesson directly.
- **WebXR** contains eight original browser examples: stages 1–5, virtual room, AR concept, and the solid/wireframe asset viewer. They run locally in isolated iframes, unload when hidden, and support fullscreen. These presentation visualizations are distinct from an immersive headset session. The headset action opens Build + Play, where Enter VR is available on supported devices.

The UI follows the reference's BSD XR design: Space Mono, square corners, one-pixel borders, monochrome dark/warm-white themes, and uppercase navigation/headings. The font is vendored with its OFL license. Theme selection persists in the browser; changing UI theme does not change an authored scene's environment colors.

The Learn downloads include the combined packet and nine individual worksheets, each in PDF and editable Word formats. Copies are in downloads/ for self-contained local and Pages hosting. If handouts change, copy updated files from the repository's handouts/PDF and handouts/Word folders before repackaging.

Reference: https://github.com/CMDann/vr-lunch-and-learn (MIT, Bit Space Development Ltd.). Original slide content and notes are archived in content/lunch-and-learn/ with the license. The focused teaching selection is content/workshop-lessons.json. New explanatory notes link to the Three.js manual and WebXR documentation. Examples are copied from the reference's js/demos/ with local Three.js imports; the original live AI service is not integrated. The source repository references an Andy/OpenBrush model that is absent from that checkout; it is not used here.

Run node tests/workspace-smoke.mjs against the isolated Chrome debugging session on port 9223 to check tabs, content search, all workbook downloads, theme, scene preservation, all eight examples, and static subfolder hosting. The Pages packager includes the lesson content, fonts, examples, model assets, and workbook downloads.

### Live learning and starter worlds

Tabs are ordered Learn → WebXR → Build. Learn pairs every lesson with a running Three.js visualization and the exact JavaScript source fetched from that visualization's module. Copy the code, restart a demo, or use Present for a fullscreen slide plus example. Left/right arrows move between lessons when focus is outside controls. Hidden lesson viewers unload to release their rendering resources.

In Build, choose **Starters** for nine editable worlds: Open meadow, Village street, Forest clearing, Physics playground, Sculpture gallery, Night plaza, Driving avenue, Adventure course, and Park study. Templates open as unsaved copies and use the normal JSON save/export workflow. Their source files live in `content/starters/`, separate from saved `levels/`; both local and GitHub Pages builds include them. `node scripts/generate-starters.mjs` rebuilds the templates and their catalog. The physics playground includes movable stacks and dominoes, and the village/avenue include scripted cars.

`node tests/learning-starters-smoke.mjs` checks all lesson viewers and source text, tab order, presentation fullscreen, mobile overflow, hidden-viewer cleanup, all nine starter worlds in Play, and loading a starter from the static Pages package (isolated Chrome debugging session on port 9223).

### Presentation and source explorer

Presentation mode scales a fixed slide + live-demo canvas to the available viewport without scrolling. The full implementation listing is available outside presentation mode, while code excerpts authored in the slide stay visible. The clock appears in the top right in normal and presentation modes and follows the presenter's browser time zone and locale.

The fourth **Code** tab is a read-only, VS Code-style source explorer with folders, file-name filtering, open-file tabs, line numbers, syntax colors, text search with previous/next matches, copy, and download. Explore `src/main.js` for the Build editor, `src/objects.js` for object construction, `src/player.js` for viewing modes, and `src/physics.js` for collisions. Switching to Code preserves the authored scene and exits Play just like Learn.

`node scripts/generate-source-index.mjs` refreshes the public source catalog after adding files. The Pages packager runs this automatically and includes these selected source files. The catalog is restricted to explicit public project paths and does not enumerate hidden files or configuration directories. `node tests/presentation-code-smoke.mjs` verifies all 15 slides fit at three viewport sizes, local time, the four tabs, code search and file switching, Play exit, and source availability under static hosting.

### Edit and run the WebXR examples

The WebXR tab pairs each preview with an editable JavaScript module. **Run code** (Ctrl/Command Enter) starts a fresh preview using that module's exported initializer. Keep the initializer name (`initDemo1`, `initDemo2`, etc.) so the runner can find it. The original Three.js and addon imports remain available. Syntax errors, startup failures, and uncaught asynchronous errors appear beneath the editor. **Reset source** restores the original example; **Download JS** exports the draft. Edits persist per example in this browser when local storage is available; they do not rewrite the project files or the Learn examples.

**Build → How it works** opens a guided source map in Code, connecting editor records → Three.js objects → Play/movement/physics → JSON storage. Each card opens the relevant file and, where useful, finds its entry point. The project source explorer stays read-only; the WebXR examples are the editable learning playground.

`node tests/example-editor-smoke.mjs` verifies edited code execution, independent drafts, reload persistence, syntax/async error reporting, reset recovery, Build source links, and editing on the static Pages build.

The WebXR code editor also lists color swatches with their literal value and line number. Click a swatch to choose a color; it changes only that occurrence in the draft, then **Run code** updates the preview. Supports Three.js `0xRRGGBB` values and quoted hex colors (`#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`), preserving alpha. Comments and unrelated strings are excluded. The color list refreshes as you type, switch examples, or reset source.
