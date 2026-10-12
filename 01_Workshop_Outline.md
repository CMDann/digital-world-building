# Digital World Building: From Idea to Explorable World
### Workshop Outline — Red River College Polytechnic (in person)

**Format:** ~3 hours 10 min, two parts: Foundations (talk) then Workshop (hands-on, groups of 3)
**Audience:** Students and staff; no coding or 3D experience required
**Facilitator:** Dann Blair
**Framework:** Consider → Scope → Build, with the 4 Ds (Direction, Description, Discernment, Delegation) guiding AI use
**Slides:** "Digital World Building — RRC Polytech" deck (36 slides, speaker notes on every slide)

> Runs about 3h10. To fit 3 hours: cut the BSD XR case studies to the gallery slide (−5 min) and
> trim the Seed activity to 5 min. To fit 2 hours: Foundations 25 min, run the Module 2 activity
> AI-only, and make Module 4 a 10-minute gallery walk.

---

## Learning outcomes

By the end, participants can:
1. Name the core considerations behind a coherent digital world (purpose, space, story, systems, look, comfort, culture, constraints).
2. Produce a one-page **World Brief** — manually, with AI, and know the difference.
3. Turn a brief into build-ready scope: spatial plan, asset list, interaction spec, budgets.
4. Apply build best practices: greybox first, real-world scale, modular assets, performance budgets, playtest early.
5. Explain how a scoping document becomes instructions an AI coding agent can build from.

---

## Run of show

| # | Module | Slides | Time | Running clock |
|---|---|---|---|---|
| P1 | Opening: who I am, today's plan | 1–3 | 5 min | 0:05 |
| P1 | Foundations: digital worlds, the metaverse, storytelling, identity & ownership | 4–17 | 35 min | 0:40 |
| P1 | BSD XR: my career and the worlds we build | 18–23 | 10 min | 0:50 |
| 0 | Hook: walk Aurora Station, then collapse it to greybox | 24 | 5 min | 0:55 |
| 1 | Consider: ten questions + World Seed activity | 25–26 | 25 min | 1:20 |
| 2 | Scope: the scoping stack, two paths, Brief it twice | 27–29 | 40 min | 2:00 |
| — | Break | 30 | 10 min | 2:10 |
| 3 | Build: stages, habits, live Claude Code build | 31–33 | 40 min | 2:50 |
| 4 | Playtest & critique | 34 | 15 min | 3:05 |
| 5 | Wrap & thanks | 35–36 | 5 min | 3:10 |

---

## Part 1 — Foundations (50 min, slides 1–23)

**Opening (slides 1–3).** Who I am (BSD XR, RRC Polytech, New Media Manitoba), and the two-part plan.

**What are digital worlds? (4–6).** Working definition: a space you can be *in*, with its own rules,
story and reason to exist. The kinds of world (games, social spaces, training sims, digital twins,
museums, spatial web), each shown with a BSD XR project. Five shared ingredients: space, presence,
rules, story, purpose. Ask the room: what world have you spent real time in?

**The metaverse (7–9).** Timeline: *Snow Crash* (1992) → Second Life (2003) → Roblox (2006) →
Fortnite (2017) → Facebook becomes Meta (2021) → Apple Vision Pro and "spatial computing" (2024).
Matthew Ball's properties: persistent, real-time 3D, shared, present, interoperable, continuous —
the last two remain mostly unsolved. Reality check: what was hyped vs what stuck.

**Digital storytelling (10–13).** "In a world, the space is the story." Jenkins' four narrative types
(evoked, enacted, embedded, emergent). Cases: *Reclaim! Azhe-giiwewining* (story through mechanics),
CN Rail *Near Miss* (story through consequence).

**Digital identity & ownership (14–17).** Avatar, presence, persistence; the Proteus effect. What you
"own" vs what you usually have (licences, platform terms, likeness, behavioural data); the NFT
cycle and the still-open portability question. Ownership of knowledge: OCAP® principles, with the
Myera Farms digital twin. Five questions every builder should answer — these feed the brief's
culture & ethics section.

**BSD XR (18–23).** Studio overview and clients; my path (build, found, share, teach; the 4 Ds);
gallery of worlds; cases: The Grid (modular kits), CEDF Northern Museum (capture + design),
VWS Amphitheater and Hawaiian Cultural Worlds (gathering and belonging).

---

## Module 0 — Hook (5 min, slide 24)

- Projector: open the demo world **Aurora Station** at full polish. Walk it for 60 seconds — dock, trail, lookout, frozen lake under aurora.
- Press `1`: the world collapses to grey boxes. "This is what it looked like on day one."
- Press `S` and click the lookout tower: the overlay shows the exact line in the scoping document that put it there.
- Framing line: *A world is a set of decisions. Today you learn which decisions, how to write them down, and how to build from them.*

**Facilitator note:** This 3-minute reveal is the thesis of the whole session. Rehearse it.

---

## Module 1 — Considerations (25 min, slides 25–26)

Teach as ten questions every world must answer. Show each in the demo where possible.

| Consideration | Question it answers | Show in demo |
|---|---|---|
| **Purpose & audience** | Why does this world exist and who is it for? (game, training sim, learning space, story, brand) | Brief header |
| **Platform & constraints** | Where does it run — browser, phone, Quest, PC? What does that cost us? | Perf HUD (`P`) |
| **Experience & verbs** | What does the visitor *do*? Walk, look, collect, talk, build? What's the core loop? | Interactive POIs |
| **Space & wayfinding** | How big, how laid out, how do people find their way? (Lynch: paths, edges, districts, nodes, landmarks) | Map view (`M`) |
| **Story & lore** | What happened here? Environmental storytelling beats exposition. | Lore cards |
| **Rules & systems** | What's true in this world — physics, time, economy, day/night? | World rules in brief |
| **Look, sound & mood** | Palette, style, lighting, audio identity. Consistency beats fidelity. | Stage 3 vs 5 |
| **Comfort & accessibility** | Motion comfort in XR, seated play, captions, contrast, input alternatives | Teleport, captions |
| **Culture & ethics** | Whose places, symbols and stories are we using? With what permission? | Brief's culture section |
| **Scope & feasibility** | What can we actually build with our time, skills and budget? | Build plan |

**Discussion prompts (5 min):** Name a world you love. Which of the ten did it nail? Which did it ignore on purpose?

**Culture & ethics note:** In Manitoba especially, worlds that draw on land, northern life or Indigenous imagery need care: consult, credit, and don't invent sacred or cultural content. Make this a design requirement, not an afterthought.

**Activity — World Seed (10 min):** Groups draw a seed card (or invent one): *a training space for a dangerous job*, *a museum of a place that no longer exists*, *a cozy world for a 10-year-old*, *a campus orientation world*, *a city 200 years from now*. Each group answers the ten questions in one line each.

---

## Module 2 — Scoping (40 min, slides 27–29)

### 2a. The scoping stack (10 min)
A world is scoped in layers. Each layer is only as detailed as the build needs.

1. **World Brief** (1 page) — purpose, audience, platform, pillars, core experience, look, constraints
2. **World Bible** — lore, rules, characters, tone, naming
3. **Spatial Plan** — top-down map, zones, paths, landmarks, sightlines, scale
4. **Asset List** — every object, its zone, priority, source (build / buy / CC0 / AI), polygon and texture budget
5. **Interaction Spec** — what each interactive thing does, trigger → response
6. **Build Plan** — milestones, acceptance criteria, what "done" looks like

### 2b. Two paths, same destination (10 min)

| Step | Manual path | AI path (4 Ds) |
|---|---|---|
| Frame | Whiteboard the ten questions | **Direction:** set goal, audience, constraints before prompting |
| Generate | Sketch, sticky notes, mood board | **Description:** prompt chain — interview → brief → critique → spatial plan → assets |
| Judge | Group critique against pillars | **Discernment:** check for clichés, contradictions, cultural problems, scope creep |
| Hand off | Brief → team | **Delegation:** decide what AI builds, what humans own (lore, culture, final taste) |

Key message: AI is fast at volume and structure, weak at taste, truth and cultural judgment. Humans own the pillars; AI fills in under them.

### 2c. Activity — Brief it twice (25 min)
1. **Manual (10 min):** Each group fills the World Brief template (`02_Scoping_Toolkit.md`) by hand from their seed.
2. **AI (10 min):** Run prompts 1–3 from the toolkit with Claude using the manual brief as input.
3. **Compare (5 min):** What did AI add that was good? What did it add that was generic or wrong? What did it miss that only you knew?

**Output:** one World Brief per group, revised. Collect them — one gets built live in Module 3.

---

## Break (10 min)
Facilitator: pick one group's brief for the live build. Pick a brief with a clear landmark and one interaction.

---

## Module 3 — Building & implementing (40 min, slides 31–33)

### 3a. Best practices (25 min) — demo each with build-stage keys `1`–`5`

1. **Greybox first** (`1`) — prove layout, scale and flow with boxes before any art. Cheap to change.
2. **Real-world scale** — 1 unit = 1 metre. Door 2.1 m, eye height 1.6 m. Wrong scale is the #1 immersion breaker.
3. **Blockout with intent** (`2`) — zones, paths, landmarks, sightlines. Every zone visible from at least one other.
4. **Wayfinding** — landmarks you can see from anywhere, light leading the eye, paths that read as paths.
5. **Modular kits** — build from reusable pieces with consistent pivots and grid snapping.
6. **Art pass with a style guide** (`3`) — palette from the brief, one art style, consistent texel density.
7. **Life layer** (`4`) — interaction, audio, narrative beats. Feedback for every action.
8. **Performance budgets** (`5` + `P`) — set them in the scope, measure constantly: draw calls, triangles, texture memory, frame rate (72–90 fps on Quest). Compress (GLB, Draco/meshopt, KTX2).
9. **Naming & structure** — folder conventions, asset naming, a licence ledger for every third-party asset.
10. **Version control & playtesting** — commit small, playtest early with someone who didn't build it.
11. **Scope doc is the source of truth** — when the world and the doc disagree, fix one deliberately.

### 3b. Live build with Claude Code (20 min)
- Show the `demo/` folder: `CLAUDE.md`, `SCOPE.md`, `BUILD_PLAN.md`, the brief. "This is the scoping stack, written for an AI teammate."
- Live: paste the chosen group's brief into a new zone request. Claude Code adds the zone to `world.json` and the world updates.
- Narrate the 4 Ds as it happens: we gave Direction (CLAUDE.md), Description (the brief), we apply Discernment (review the diff, walk it), we chose what to Delegate.
- Show what happens when the brief is vague — Claude asks or guesses. Lesson: the quality of the world is capped by the quality of the scope.

**Fallback:** If Wi-Fi or the live build fails, use the pre-built "Group zone" branch / backup zone in `world/examples/`.

### 3c. Implementation beyond the prototype (5 min)
Moving to Unity / Unreal / production WebXR: the same scope stack carries over. Discuss hosting, analytics, accessibility testing, and maintaining the world after launch.

---

## Module 4 — Playtest & critique (15 min, slide 34)

- Groups walk the live-built zone (and the full demo) on laptops or a Quest.
- Critique structure, 2 min per group: **one thing that reads, one thing that confuses, one thing to cut.**
- Tie back: which consideration from Module 1 explains each issue?

---

## Module 5 — Wrap (5 min, slides 35–36)

- Recap: Consider → Scope → Build. The scope doc is the product before the product.
- Take-home: Scoping Toolkit, link to the demo repo, the prompt chain.
- Next steps: RRC ACE Project Space, follow-up build sessions.

---

## Facilitator checklist

- [ ] Demo runs **offline** from laptop (libraries vendored locally)
- [ ] Projector tested at 1080p; text in overlays readable from back row
- [ ] Quest charged, demo URL bookmarked, guardian set (optional)
- [ ] Claude Code signed in and tested on the venue network; hotspot as backup
- [ ] Seed cards printed (one set per group)
- [ ] Toolkit printed or shared via QR
- [ ] Backup zone ready in case live build fails
- [ ] Rehearse the Module 0 reveal and the Module 3b live build twice

## Materials

- Laptop + projector + clicker; optional Meta Quest 3
- Printed World Brief templates and seed cards
- Participant access to Claude (or one shared station per group)
- Whiteboard / sticky notes for the manual path

## Open decisions

- Final length and date of the session
- Participant AI access: individual accounts, or one shared station per group
- Whether the demo is published (GitHub Pages) so participants can open it on their own devices
- Note: the earlier RRC workshop plan used Glitch for hosting; Glitch ended project hosting in 2025, so GitHub Pages (or local) is assumed here
