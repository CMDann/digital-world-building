# World Building Scoping Toolkit
### Participant handout — Digital World Building, RRC Polytech

---

## Part 1 — The ten considerations (checklist)

Answer each in one line before you design anything.

- [ ] **Purpose** — Why does this world exist? What should someone feel, learn or do?
- [ ] **Audience** — Who is it for? Age, experience, accessibility needs.
- [ ] **Platform** — Browser, phone, VR headset, PC/console? Seated or standing?
- [ ] **Core experience** — What are the verbs? What does a visitor do in the first 60 seconds?
- [ ] **Space** — How big? What zones? What's the landmark you can see from everywhere?
- [ ] **Story** — What happened here before the visitor arrived?
- [ ] **Rules** — What's true here (time, weather, physics, economy)?
- [ ] **Look & sound** — Three words for the mood. Five colours. One reference image.
- [ ] **Comfort & access** — How do we avoid motion sickness, exclude no one, support captions and contrast?
- [ ] **Culture & ethics** — Whose stories, places or symbols appear? Do we have permission? Who should we consult?
- [ ] **Constraints** — Time, skills, budget, hardware. What will we *not* build?

---

## Part 2 — World Brief template (one page)

```
WORLD NAME:
ONE-LINE PITCH:            "A ___ where you ___ in order to ___."
PURPOSE:
AUDIENCE:
PLATFORM & INPUT:

DESIGN PILLARS (3):        The rules every decision must serve.
  1.
  2.
  3.

CORE EXPERIENCE:           First 60 seconds:
                           Core loop:
                           End / payoff:

ZONES (3–5):               Name — purpose — landmark — mood
  1.
  2.
  3.

KEY INTERACTIONS (≤5):     Trigger → response
  1.
  2.

LORE IN 3 SENTENCES:

LOOK & SOUND:              Mood words:        Palette:        Audio:

COMFORT & ACCESSIBILITY:

CULTURE & ETHICS NOTES:

CONSTRAINTS & BUDGETS:     Time:    Team:    Perf target (fps / triangles / draw calls):

OUT OF SCOPE:              We are NOT building:

OPEN QUESTIONS:
```

---

## Part 3 — The manual path

1. **Diverge (5 min):** Everyone writes ideas on sticky notes, one idea per note, no judging.
2. **Cluster (3 min):** Group notes into zones, story, look, interactions.
3. **Pillars (3 min):** Pick three pillars. Cut every note that doesn't serve one.
4. **Sketch the map (5 min):** Top-down sketch. Mark paths, edges, zones, nodes and the landmark.
5. **Fill the brief (10 min):** Complete the template. Anything you can't answer goes in Open Questions.

---

## Part 4 — The AI path (4 Ds)

| D | What you do | What good looks like |
|---|---|---|
| **Direction** | Decide the goal, audience and constraints *before* you prompt | You can say what success is in one sentence |
| **Description** | Give context, constraints and the format you want; work in a chain, not one mega-prompt | Each output feeds the next prompt |
| **Discernment** | Read critically: generic? contradictory? culturally careless? too big? | You cut or fix at least a third of what AI gave you |
| **Delegation** | Decide what AI drafts and what humans own | Humans own pillars, culture, and final taste |

### Prompt chain (copy-paste, fill the brackets)

**Prompt 1 — Interview me**
```
I'm designing a digital world. Purpose: [purpose]. Audience: [audience]. Platform: [platform].
Before writing anything, interview me with 8 short questions, one at a time, that will most
improve the design. Cover space, story, core experience, look, comfort, and constraints.
```

**Prompt 2 — Draft the brief**
```
Using my answers, fill in this World Brief template exactly. Keep it to one page. Where you
are guessing rather than using my answers, mark the line [ASSUMPTION].
[paste the template]
```

**Prompt 3 — Critique it (Discernment)**
```
Act as a senior world designer reviewing this brief. List:
1. Contradictions between pillars, zones and interactions
2. Anything generic or clichéd, with a more specific alternative
3. Scope risks — what would take longest to build, and what to cut first
4. Cultural, ethical or accessibility concerns
5. The three questions the team must answer before building
Do not rewrite the brief.
```

**Prompt 4 — Spatial plan**
```
From the brief, produce a spatial plan: zones with approximate sizes in metres, how they
connect, the main path, the landmark and where it's visible from, and sightlines between
zones. Then draw it as a simple ASCII top-down map. Use 1 unit = 1 metre.
```

**Prompt 5 — Asset list with budgets**
```
Produce an asset list as a table: asset, zone, purpose, priority (must/should/could),
source (build / CC0 library / AI-generated / commission), and a triangle budget. Total
triangle budget for the whole scene is [e.g. 150,000]. Flag anything over budget.
```

**Prompt 6 — Build spec for an AI coding agent**
```
Turn this brief, spatial plan and asset list into a build spec for an AI coding agent.
Include: goal, non-goals, tech stack, data structure for the world, milestones in order
each with acceptance criteria, performance budgets, and rules the agent must follow
(e.g. "every object must reference the scope line it comes from"). Use Markdown.
```

---

## Part 5 — Discernment checklist (use on every AI output)

- [ ] Does it serve the three pillars, or just sound cool?
- [ ] Is anything stated as fact about a real place, culture or people that we haven't verified?
- [ ] Is it the most generic version of this idea? What's the specific one?
- [ ] Can we build it in the time we have?
- [ ] Does it work for someone seated, someone new to games, someone with low vision?
- [ ] Did we keep every [ASSUMPTION] visible until a human confirmed it?

---

## Part 6 — Build best practices (one-glance)

Greybox first · 1 unit = 1 metre · Landmark visible from everywhere · Modular pieces ·
One art style · Set performance budgets up front and measure them · Name things consistently ·
Log every third-party asset's licence · Commit small · Playtest with someone who didn't build it ·
The scope doc is the source of truth.
