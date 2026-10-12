# World Brief — Aurora Station

> The demo world's scoping document. Every line has an ID in brackets. Every entity in the
> built world carries a `scopeRef` pointing to one of these IDs. If something in the world
> has no line here, it shouldn't exist — or this brief needs updating first.

**One-line pitch** [P0]: A small northern research outpost on a frozen boreal lake where you
walk from the dock to the lookout to witness the aurora, discovering what the last
researcher left behind.

## Purpose & audience
- [PA1] Purpose: teaching demonstration — show how a scoping document becomes an explorable world.
- [PA2] Audience: workshop participants watching on a projector; a few try it on laptops or a Meta Quest.
- [PA3] Platform: desktop browser (primary), mobile browser, WebXR headset (secondary).

## Design pillars
- [PL1] **Quiet wonder** — calm, unhurried, beauty over action.
- [PL2] **Readable at a glance** — anyone can tell where to go within 10 seconds.
- [PL3] **Every piece is traceable** — the world explains its own construction.

## Core experience
- [CE1] First 60 seconds: arrive on the dock at dusk; the lookout tower is visible across the trail; a lantern path leads toward it.
- [CE2] Core loop: walk → notice a glowing point of interest → open its lore card → move on.
- [CE3] Payoff: reach the lookout and the aurora intensifies over the frozen lake.

## World rules
- [WR1] Time is fixed at late dusk transitioning to night; no day/night cycle.
- [WR2] Winter: snow ground, frozen lake, bare and coniferous trees.
- [WR3] No enemies, no fail states, no timers.
- [WR4] Scale: 1 unit = 1 metre. Eye height 1.6 m.

## Zones
| ID | Zone | Purpose | Landmark | Approx. size | Mood |
|---|---|---|---|---|---|
| [Z1] | The Dock | Arrival and orientation | Lantern post + wooden sign | 12 × 8 m | Welcoming, warm light |
| [Z2] | Research Hut | Story hub; the researcher's notes | Lit window, chimney smoke | 20 × 20 m | Cozy, lived-in |
| [Z3] | Boreal Trail | Transition; wayfinding by lanterns | Lantern line through spruce | 60 × 10 m | Hushed, enclosed |
| [Z4] | Lookout Tower | Climax vantage point | 12 m wooden tower | 15 × 15 m | Open, elevated |
| [Z5] | Frozen Lake | Backdrop and payoff | Aurora overhead | 200 × 200 m (mostly unwalkable) | Vast, luminous |

## Spatial plan
- [SP1] Layout: Dock (south) → Hut (south-east) → Trail (heading north) → Lookout (north) — Lake fills the west.
- [SP2] Main path is a lantern line; lanterns every ~6 m.
- [SP3] The Lookout tower is visible from the Dock and from every point on the trail.
- [SP4] Soft boundaries: dense treeline east and north, the lake edge west; invisible walls only as last resort.

```
            N
   ~~~~~~~~ [Z4 Lookout] 
   ~ LAKE ~      |
   ~  Z5  ~   [Z3 Trail]
   ~~~~~~~~      |
   ~~~~~~~~ [Z1 Dock]--[Z2 Hut]
```

## Points of interest (lore)
| ID | Location | Object | Lore card text (draft) |
|---|---|---|---|
| [L1] | Z1 | Dock sign | "Aurora Station — Northern Sky Observatory. Est. 1987. Staff: 1." |
| [L2] | Z2 | Desk journal | "Day 212. The lights came early again. I've stopped writing the times down — they never match the forecast." |
| [L3] | Z2 | Old radio | "Last transmission logged: 'Going up to the tower. Leaving the lantern on.'" |
| [L4] | Z3 | Snowed-in camera tripod | "Film still loaded. 36 exposures, all of the same patch of sky." |
| [L5] | Z4 | Lookout bench | "Carved in the rail: 'Worth the climb.'" |

## Interactions
- [I1] Gaze/hover/point at a POI → it glows; click/tap/trigger → lore card opens; again → closes.
- [I2] Reaching the top of the Lookout → aurora intensity ramps up over 5 s; ambient music swells.
- [I3] Entering the Research Hut → interior light and fireplace crackle fade in.

## Look & sound
- [LS1] Style: stylized low-poly, flat shaded, no photoreal textures.
- [LS2] Palette: deep navy #0B1A2E, snow blue-white #DDE8F2, spruce #1F3B2D, lantern amber #FFB347, aurora green #5CFFB0, aurora violet #9B6BFF.
- [LS3] Lighting: cool ambient + warm point lights at lanterns and hut window; exponential fog.
- [LS4] Audio: wind bed (always), crackling fire (hut), soft synth pad at lookout.

## Comfort & accessibility
- [CA1] VR: teleport locomotion by default; no forced camera motion.
- [CA2] Lore cards: large high-contrast text, min 24 px on desktop; readable at 2 m in VR.
- [CA3] All audio is ambient; no information is conveyed by sound alone.
- [CA4] Keyboard, mouse, touch and VR controllers all supported.

## Culture & ethics
- [CU1] The setting is a fictional research outpost. No Indigenous names, symbols, stories or sacred content are used or invented.
- [CU2] Aurora is presented as natural phenomenon only; no cultural mythology attributed.

## Constraints & budgets
- [CB1] Must run offline from a laptop; no runtime network calls.
- [CB2] Performance targets: 60 fps desktop, 72 fps Quest 3 browser.
- [CB3] Budgets (whole scene, Stage 5): ≤ 150k triangles, ≤ 100 draw calls, ≤ 32 MB textures.
- [CB4] All third-party assets CC0 and logged in ASSETS.md.

## Out of scope
- [OS1] No characters/NPCs, combat, inventory, saving, multiplayer, accounts, or backend.

## Open questions
- [OQ1] Does the researcher ever appear? (Default: no — absence is the story.)
