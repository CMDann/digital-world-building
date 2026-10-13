# Asset Licence Ledger

Every third-party asset must be CC0 and listed here.

| Asset | File | Source URL | Author | Licence | Triangles / size | Used in |
|---|---|---|---|---|---|---|

## Scene editor (2026-10-12)
- Three.js 0.180.0 + OrbitControls, TransformControls, GLTFLoader, BufferGeometryUtils. MIT. Vendored from https://cdn.jsdelivr.net/npm/three@0.180.0/ into vendor/three/. License: vendor/three/LICENSE.
- Starter props are procedural geometry created in src/objects.js; no external model assets.


- Three.js 0.180.0 VRButton (MIT), vendor/three/VRButton.js. Procedural people and movement routes are authored locally.


- cannon-es 0.20.0 (MIT), vendored from https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/ into vendor/cannon-es/. License: vendor/cannon-es/LICENSE. Used for rigid-body collisions and gravity.

## BSD XR lunch-and-learn integration (2026-10-12)
- Reference slide content and demo source: CMDann/vr-lunch-and-learn, MIT, copyright 2026 Bit Space Development Ltd. License retained in content/lunch-and-learn/LICENSE.
- The reference's sword, shield, and feather GLBs are copied unchanged into examples/assets/ for its solid/wireframe teaching viewer. They are demonstration assets from the user-provided reference; they are not added to the world-building object library.
- Reference presentation images retained under content/lunch-and-learn/images/.
- Space Mono regular/bold from google/fonts/ofl/spacemono, SIL Open Font License; license in assets/fonts/OFL.txt.
- Additional official Three.js 0.180.0 postprocessing modules and shaders are vendored under vendor/three/addons/ for the original bloom example (MIT, existing Three.js license).
