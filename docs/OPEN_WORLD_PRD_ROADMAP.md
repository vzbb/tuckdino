# Tuckdino Open-World Story Mode

## Product requirements document and model-agnostic implementation roadmap

Status: working master plan  
Roadmap size: 200 atomic tasks in 25 work packages  
Primary target: touch-first landscape tablet; desktop and keyboard/mouse secondary  
Current implementation baseline: Next.js 14, React 18, React Three Fiber, Three.js, Zustand, localStorage, Quaternius GLB assets

---

## 1. Purpose

This document turns the current ranch prototype into a coherent, child-friendly open-world creature-training RPG. It is written so that any capable coding agent, model, human developer, or test harness can complete one small task at a time without needing undocumented context.

The finished game should feel like a gentle mixture of creature collecting, creature raising, open-world exploration, light role-playing, and modern third-person movement. The player should always feel accompanied: by their baby dinosaur, by an ethereal spren-like guide, and by two persistent peer characters whose lives continue around the world.

The roadmap deliberately separates game rules from rendering, authored content from optional generative services, and deterministic simulation from presentation. No required feature may depend on one model vendor, browser automation tool, hosting provider, or agent harness.

---

## 2. Product vision

The player discovers a hidden nest with a friendly peer. Each child chooses an egg. A mischievous rival interrupts, grabs another egg, and runs away. That moment creates three parallel journeys:

1. The player and their chosen baby dinosaur grow together.
2. A friendly peer and their baby dinosaur explore, train, joke, compete, and help.
3. A rival and their baby dinosaur meddle, race ahead, trigger problems, and gradually reveal more sympathetic motivations.

The player can leave the safe starting ranch and roam through connected regions containing settlements, wilderness, secrets, wild creature encounters, vendors, simple NPCs, regional story arcs, and large boss-like creatures. Combat is exciting but nonlethal: creatures yield, retreat, calm down, or recognize the player's bond rather than die.

The world should feel alive even in a purely local single-player game. Peers and important NPCs follow schedules, move between known locations, sleep, work, and become temporarily unavailable. When offscreen, they are simulated cheaply from schedules and story state rather than rendered continuously.

---

## 3. Design pillars

### 3.1 Bond before power

Training, care, trust, and understanding are as important as damage. A well-cared-for dinosaur should behave more confidently and unlock cooperative moves.

### 3.2 A living but understandable world

The world has time, weather, schedules, ambient creatures, region changes, and consequences, but the child should always know what to do next.

### 3.3 Safe adventure with real excitement

Threats can look dramatic. Failure should be recoverable, clearly explained, and never cruel. No permanent creature death, inventory loss, predatory monetization, or hostile social chat belongs in the foundation.

### 3.4 Touch-first simplicity

Core actions use large targets, short choice lists, contextual prompts, forgiving timing, readable symbols, and optional voiced text. Advanced depth comes from combinations and progression, not complicated input.

### 3.5 Authored core, optional intelligence

Story progression, schedules, battles, saves, hints, and accessibility must work deterministically without network access or an AI key. AI may enrich companion reactions through a provider adapter, but it cannot own required game logic.

### 3.6 Every region has an identity

Each region needs its own silhouette, color script, traversal idea, safe area, ecology, ambient audio, quest problem, wild encounter family, and regional boss.

---

## 4. Audience, tone, and content boundaries

- Primary audience: children approximately 6–12 playing with or without an adult.
- Reading level: short sentences, concrete verbs, one idea per dialogue card.
- Tone: warm, adventurous, funny, occasionally mysterious, never cynical.
- Rival behavior: teasing, showing off, taking shortcuts, hiding harmless items, or causing manageable trouble; never abuse, hate speech, humiliation, or sustained cruelty.
- Battles: stylized contests and creature calming; no gore, dismemberment, realistic injury, or death.
- Economy: earned in-game currency only in the foundation; no purchases, loot boxes, ads, or scarcity pressure.
- Privacy: microphone and camera remain off by default. Required gameplay never needs them.
- Voice: prerecorded audio, browser speech, or a TTS adapter may deliver authored lines. Subtitles must always be available.

---

## 5. Foundation scope and explicit non-goals

### In scope

- One perceived open world composed of streamable regional cells.
- Six regions including the starting ranch basin.
- Safe hubs, wilderness areas, region gates, fast-travel discoveries, and portable camps.
- Player, baby dinosaur, friend peer, rival peer, their companion dinosaurs, functional NPCs, ambient creatures, wild opponents, and regional bosses.
- Authored story chapters, quests, dialogue, schedules, shops, training, inventory, simple crafting, battles, care, progression, and exploration rewards.
- Local-first save data with versioned migrations.
- Deterministic debug commands and state snapshots for any test harness.
- Optional voice and optional AI enrichment behind interfaces.

### Not in the foundation

- Real online multiplayer or shared-world synchronization.
- User-generated chat, trading, or public profiles.
- Infinite procedural terrain.
- Photorealism.
- Complex survival penalties.
- Breeding, permanent injury, creature death, or irreversible failure.
- Mandatory microphone, camera, account, cloud save, or AI service.
- Full physics simulation for every prop and creature.

The friend and rival are simulated peers in the initial product. Their architecture may later support real remote players, but no current task assumes networking.

---

## 6. Core player loops

### Minute-to-minute

Explore → notice a point of interest → move or interact → receive a reaction from the dinosaur/spren → collect, help, train, battle, or discover → choose the next nearby objective.

### Session loop

Check dinosaur needs → speak with a scheduled NPC → choose a quest or region goal → travel and complete encounters → return to a safe area or camp → spend rewards and save.

### Long-term loop

Build bond → unlock cooperative skills → resolve regional story arcs → earn crests → open new routes → change the friend/rival relationship → uncover why dinosaur eggs appeared.

---

## 7. Story and character foundation

### Opening scene requirement

The ally's opening voice line is an authored, subtitle-backed story beat:

> “Come, quick! Look what I found, oh gosh! I-I-I, I think it's a dinosaur nest, and these.. these are baby dino eggs! We can't just leave them here, they need help, we gotta find big dinos! Here; you pick one and I'll pick one.”

Sequence:

1. The ally calls the player into the nesting glade.
2. The nest and available eggs are revealed.
3. The player previews and selects one egg.
4. The ally selects a different remaining egg.
5. The rival runs in, delivers a short mean/show-off line, grabs a third egg, and flees.
6. The three eggs hatch in a controlled sequence.
7. The ally guides the player toward the ranch and the first care lesson.
8. The rival becomes a persistent scheduled world actor rather than disappearing from the game.

### Working character roles

Names are content-configurable. Existing “Pip” references may serve as the ally placeholder until names are finalized.

- Ally peer: empathetic, enthusiastic, occasionally scattered, supportive, and playfully competitive.
- Rival peer: bold, impatient, mischievous, sometimes a bully, but bounded and capable of growth.
- Dino Ranger: sells or teaches training upgrades, explains wild creatures, and anchors progression.
- Ranch shop owner: sells basic care goods and inventory upgrades.
- Traveling vendors: small rotating inventories, regional flavor, and reasons to revisit routes.
- Quest NPCs: short authored functions; they do not need deep autonomous simulation.
- Spren companion: an ethereal guide attracted by “the bond between a baby dino and a good boy”; it gives hints, interprets emotions, and helps the child recover when stuck. The address term must later be profile-configurable while retaining the requested default line.

---

## 8. World map

The world is seamless in fiction but may stream cells or use masked trail transitions on constrained devices.

| Region | Safe area | Distinct areas | Traversal identity | Encounter identity | Regional climax |
|---|---|---|---|---|---|
| Sunpatch Basin | Small Ranch | Nesting Glade, Training Ring, Market Trail, Meadow Gate | Walking, following, basic interaction | Gentle practice creatures | Mossback bond trial opens Fernwood |
| Fernwood Wilds | Lantern Hollow Ranger Camp | Whispering Grove, Mossy Steps, Singing Canopy, Rootbridge | Logs, stepping stones, hidden trails | Leaf, bug, and forest dinosaurs | Calm the Thornback guardian |
| Ambergrass Prairie | Windmill Rest | Tallgrass Maze, Thunder Flats, Sunstone Canyon, Herding Fields | Sprint lanes, wind lifts, herd routes | Fast pack and horned creatures | Outrun and befriend the Stormhorn |
| Moonwater Marsh | Reedlight Village | Mirror Pools, Glowreed Fen, Sinkroot Grove, Moonwell | Raft routes, shallow water, tide switches | Amphibious and nocturnal creatures | Restore the Moonwell and face Mirejaw |
| Emberpeak Range | Ranger Outpost | Ashwood Foothills, Lava Tubes, Obsidian Shelf, Crater Rim | Heat-safe paths, lifts, breakable rock | Armored and fire-adapted creatures | Stop the Ash Titan's panic |
| Starfall Coast | Beacon Harbor | Tide Pools, Fossil Cliffs, Storm Reef, Starfall Beach | Gliding currents, rope paths, raft travel | Coastal, flying, and ancient creatures | Final crest trial at the storm beacon |

Each safe area disables random hostile encounters, offers save/rest services, has at least one NPC schedule anchor, and provides a clear route back into the wilderness.

---

## 9. Technical direction

### 9.1 Layer boundaries

1. Domain: serializable rules, IDs, quests, schedules, battles, progression, time, and save migrations.
2. Content: typed region, creature, item, NPC, dialogue, quest, encounter, and shop manifests.
3. Simulation: deterministic reducers/services that advance world state.
4. Presentation: React UI, React Three Fiber scenes, animation, audio, particles, and camera.
5. Adapters: storage, TTS, optional AI, analytics, and harness integration.

Domain and simulation code must not import React, Three.js, browser speech, Gemini, Playwright, or Next.js.

### 9.2 World representation

- Stable string IDs for every region, cell, NPC, quest, creature archetype, item, and story flag.
- A world graph connects region cells through exits and prerequisites.
- Only nearby cells and visible actors render.
- Scheduled peers resolve their current activity from world time, story flags, and a deterministic seed.
- Encounter spawns use seeded rules and cooldowns.
- Important state is event-driven and serializable; transient animation state is not saved.

### 9.3 Provider interfaces

- SaveRepository: load, write, list, delete, and migrate saves.
- VoiceProvider: play an authored line and report started/completed/failed.
- HintProvider: return an authored hint; optional AI decorator may personalize wording.
- ClockProvider: supply real, simulated, or test time.
- RandomProvider: seeded random values.
- TelemetrySink: no-op by default.

### 9.4 Performance budget

- Tablet target: stable 30 FPS minimum, 45–60 FPS preferred on the agreed reference device.
- No more than the measured draw-call budget per loaded cell; the exact number is established in Task PERF-002.
- Avoid loading all region models on startup.
- Reuse GLTF data, pool common effects, instance repeated props, limit shadow casters, and reduce PIP render frequency.
- The game remains playable with voice, AI, and nonessential particles disabled.

### 9.5 Current-repo integration map

This is a migration map, not permission to rewrite everything at once.

| Current surface | Preserve | Gradual destination |
|---|---|---|
| src/GameApp.tsx | Dynamic canvas loading, save-slot entry, text snapshot hooks | Thin composition root plus adapter wiring |
| src/state/useGameStore.ts | Current save fields and working actions during migration | Facade composed from typed domain slices and pure commands |
| src/three/scenes/WorldScene.tsx | Lighting, camera lessons, movement feel, arena staging | World shell that mounts the active RegionCell |
| src/three/world/WorldProps.tsx | Ranch landmarks and stable procedural dressing | Ranch content module plus reusable scenery systems |
| src/three/characters/DinosaurModel.tsx | Species mapping, rig cloning, semantic animations | Shared dinosaur presentation driven by CompanionState |
| src/three/characters/BabyDino.tsx | Follow behavior, interaction reactions | Party-companion controller shared by all three peers |
| src/three/world/DinosaurArena.tsx | Model-backed arena and battle choreography | Generic encounter arena configured by battle presentation events |
| src/ui/HUD.tsx | Working training/battle controls | Mode-aware UI shell with focused feature panels |
| src/systems/ai/* | Optional personality enrichment and fallback lessons | Hint/voice/reaction adapters that cannot mutate core rules |
| app/api/* | Existing provider boundaries | Optional provider endpoints with typed request/response contracts |

Suggested target folders:

- src/domain — serializable types, invariants, pure reducers, commands, and selectors.
- src/content — validated manifests grouped by region and content type.
- src/simulation — schedules, encounters, quests, world time, and battle orchestration.
- src/presentation/three — world cells, actors, effects, cameras, and asset loaders.
- src/presentation/ui — HUD modes, map, journal, shops, dialogue, PIP, and settings.
- src/adapters — saves, clock, random, voice, optional AI, telemetry, and harness.
- src/testing — fixtures, deterministic scenarios, content audits, and save migrations.

---

## 10. Definition of done for every task

A task is complete only when:

1. Its listed dependencies are complete or an explicitly documented temporary stub exists.
2. The change is scoped to the task and does not silently redesign unrelated systems.
3. Types compile and the relevant automated checks pass.
4. A deterministic verification path exists: unit test, integration test, state snapshot, screenshot, or documented manual interaction.
5. Save compatibility is preserved or a migration is included.
6. Touch and keyboard/mouse paths are considered when the task affects input.
7. Loading, empty, fallback, and error behavior is defined when the task uses assets or adapters.
8. The checklist box is ticked and the evidence log records files changed and verification performed.

### Agent handoff protocol

1. Select exactly one unchecked task whose dependencies are satisfied.
2. Read this PRD plus the files named by that task.
3. State assumptions in the task evidence entry before coding.
4. Implement the smallest complete slice.
5. Run the task's acceptance check and relevant regression check.
6. Update only that task's checkbox and evidence entry.
7. If blocked, leave it unchecked and record the blocker; do not mark partial work complete.

---

## 11. Dependency and parallelization map

### Sequential critical path

ARCH → STATE → SAVE → WORLD → RANCH → QUEST → BATTLE → REGION-1 → PROGRESSION → RELEASE

### Parallel lanes

- Lane A — Core platform: ARCH, STATE, SAVE, HARNESS, WORLD, PERF.
- Lane B — Characters: INTRO, ALLY, RIVAL, NPC, DINO, SPREN.
- Lane C — Gameplay: CARE, ECON, QUEST, BATTLE, WILD, BOSS.
- Lane D — Content: RANCH, FERN, AMBER, MARSH, EMBER, COAST.
- Lane E — Experience: INPUT, UI, AUDIO, ACCESSIBILITY, QA.

After ARCH and STATE stabilize, HARNESS, SAVE, DINO materials, authored dialogue, audio asset preparation, and region concept/blockout work can proceed in parallel. Region production packages FERN through COAST can run in parallel only after the world-cell contract and content schemas are frozen. Final integration remains sequential.

### Milestone gates

| Milestone | Required packages | Exit condition |
|---|---|---|
| M0: Stable foundation | ARCH, STATE, SAVE, HARNESS | Versioned deterministic state can load, save, migrate, inspect, and reset |
| M1: Living ranch vertical slice | WORLD, INPUT, RANCH, INTRO, ALLY, RIVAL, DINO, CARE, SPREN | Opening through first ranch quest works with all three peers and companion feedback |
| M2: First complete adventure region | NPC, ECON, QUEST, BATTLE, WILD, BOSS, FERN | Ranch → Fernwood → boss → return loop is complete |
| M3: Full world alpha | AMBER, MARSH, EMBER, COAST | Every region is traversable and has a safe area, quest arc, encounters, and climax |
| M4: Child-ready release candidate | UI/A11Y/AUDIO, PERF/QA/RELEASE | Performance, accessibility, recovery, saves, and full story regression pass |

---

# 12. Atomic implementation checklist

Notation: dependencies use task IDs; “none” means the task can begin immediately. Evidence should be attached to the task row or the evidence log at the end.

## WP01 — Architecture and scope contracts (ARCH)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | ARCH-001 | Record the current runtime versions, scripts, asset folders, and build command in a machine-readable project manifest. | none | Manifest matches package files and production build command. |
| [ ] | ARCH-002 | Add a short architecture decision record defining local-first simulated peers instead of networked multiplayer. | none | ADR states rationale, extension seam, and non-goals. |
| [ ] | ARCH-003 | Add an architecture decision record separating domain, content, simulation, presentation, and adapters. | none | ADR includes allowed and forbidden imports per layer. |
| [ ] | ARCH-004 | Define stable ID naming rules for regions, cells, NPCs, creatures, quests, items, flags, and dialogue nodes. | ARCH-003 | Naming document includes valid and invalid examples. |
| [ ] | ARCH-005 | Define the product-wide nonlethal encounter vocabulary: challenge, yield, calm, retreat, bond, and recover. | none | Content guide bans death/gore language in child-facing battle text. |
| [ ] | ARCH-006 | Define feature flags for intro v2, scheduled peers, PIP, spren, regional streaming, shops, and boss encounters. | ARCH-003 | Flags have defaults and documented removal criteria. |
| [ ] | ARCH-007 | Document the offline-required path and the optional online enhancement path for voice and AI. | ARCH-003 | Every required feature has a deterministic offline provider. |
| [ ] | ARCH-008 | Add a decision log template for future agents to record scope changes without rewriting this PRD. | none | Template captures decision, alternatives, consequences, and affected task IDs. |

## WP02 — Domain state and simulation boundaries (STATE)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | STATE-001 | Split the monolithic game state type into serializable domain slices: profile, world, actors, dino, quests, inventory, battle, and settings. | ARCH-003, ARCH-004 | Type check passes; each slice has a documented owner. |
| [ ] | STATE-002 | Define WorldTime with day index, minute-of-day, time scale, and paused state. | STATE-001 | Unit tests cover dawn, midnight rollover, pause, and accelerated time. |
| [ ] | STATE-003 | Define ActorState for player, ally, rival, and functional NPCs using stable actor IDs and region/cell locations. | STATE-001 | Example serialized actors validate without Three.js objects. |
| [ ] | STATE-004 | Define CompanionState linking each peer actor to one dinosaur instance and one species definition. | STATE-003 | Player, ally, and rival can each reference a distinct egg/species. |
| [ ] | STATE-005 | Define WorldFlag and StoryFlag storage with typed helper functions for set, clear, and query. | STATE-001, ARCH-004 | Tests prove unknown flags fail validation in development. |
| [ ] | STATE-006 | Move transient animation, camera shake, hover, and particle state out of the persisted domain shape. | STATE-001 | Serialized snapshot contains no React refs, Three objects, or animation actions. |
| [ ] | STATE-007 | Add pure simulation commands for move, interact, care, accept quest, advance dialogue, buy, use item, and choose battle move. | STATE-001 | Commands run in a non-browser unit test. |
| [ ] | STATE-008 | Add domain invariant validation for impossible positions, negative currency, invalid quest states, orphan companions, and invalid health. | STATE-001, STATE-004 | Invalid fixture tests return actionable invariant errors. |

## WP03 — Typed content registries (CONTENT)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | CONTENT-001 | Define RegionDefinition and WorldCellDefinition schemas, including bounds, exits, safe status, asset bundle, ambience, and spawn groups. | ARCH-004, STATE-001 | One ranch cell fixture validates. |
| [ ] | CONTENT-002 | Define CreatureDefinition schema with species, role, stats, animations, palette slots, habitat tags, and encounter moves. | ARCH-004, STATE-004 | Existing six dinosaur models map to valid definitions. |
| [ ] | CONTENT-003 | Define NpcDefinition schema with role, model, dialogue set, schedule, shop/quest links, and companion link. | ARCH-004, STATE-003 | Ally, rival, ranger, and shopkeeper fixtures validate. |
| [ ] | CONTENT-004 | Define ItemDefinition and ShopDefinition schemas for care items, ingredients, quest items, upgrades, prices, and stock rules. | ARCH-004, STATE-001 | Sample ranch shop validates and rejects duplicate stock IDs. |
| [ ] | CONTENT-005 | Define QuestDefinition schema with prerequisites, objectives, transitions, rewards, failure policy, and story flags. | ARCH-004, STATE-005 | A three-objective ranch quest validates. |
| [ ] | CONTENT-006 | Define DialogueDefinition as authored nodes with speaker, text, voice key, choices, conditions, effects, and next node. | ARCH-004, STATE-005 | Opening conversation graph validates with no dangling node. |
| [ ] | CONTENT-007 | Define EncounterTable and BossDefinition schemas with habitat filters, level bands, cooldowns, rewards, phases, and nonlethal outcomes. | CONTENT-002 | Sample Fernwood encounter table and boss validate. |
| [ ] | CONTENT-008 | Add a content registry loader that validates all manifests at development startup and returns errors with file and ID context. | CONTENT-001 through CONTENT-007 | Broken fixture reports the exact invalid content path. |

## WP04 — Persistence, migration, and deterministic harness (SAVE/HARNESS)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | SAVE-001 | Add an explicit save schema version and generated-at timestamp to every slot. | STATE-001 | New save contains version and timestamp. |
| [ ] | SAVE-002 | Wrap localStorage behind a SaveRepository interface with load, write, list, delete, and export methods. | ARCH-003, SAVE-001 | Domain code can use an in-memory repository in tests. |
| [ ] | SAVE-003 | Create a migration from the existing save shape to the first versioned open-world shape. | SAVE-001, STATE-001 | Existing fixture loads without losing egg, stats, color, camp, or battle progress. |
| [ ] | SAVE-004 | Add atomic write recovery using a temporary save record and last-known-good record. | SAVE-002 | Interrupted-write test restores the last valid snapshot. |
| [ ] | SAVE-005 | Add seeded RandomProvider and store the world seed in the save. | ARCH-003, SAVE-001 | Same seed produces identical schedules and encounter rolls. |
| [ ] | SAVE-006 | Replace direct wall-clock reads in domain simulation with ClockProvider. | STATE-002, ARCH-003 | Fake clock deterministically advances a full day. |
| [ ] | SAVE-007 | Expand render_game_to_text into a versioned, JSON-safe snapshot of scene, cell, actors, quests, nearby interactables, encounter, and UI mode. | STATE-003, STATE-007 | Snapshot is stable across two identical seeded runs. |
| [ ] | SAVE-008 | Add a harness command dispatcher for new game, load, teleport, advance time, interact, battle move, set need, and inspect state. | SAVE-005 through SAVE-007 | Commands work without canvas coordinate clicks and return structured results. |

## WP05 — World graph, cell streaming, and discovery (WORLD)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | WORLD-001 | Author the six-region world graph with cell IDs, exits, gates, and safe-area markers. | CONTENT-001, ARCH-004 | Graph validator confirms all exits are reciprocal or intentionally one-way. |
| [ ] | WORLD-002 | Implement a pure route query that finds reachable cells given current story flags and traversal abilities. | WORLD-001, STATE-005 | Tests cover locked, unlocked, and one-way routes. |
| [ ] | WORLD-003 | Add activeCellId and discoveredCellIds to world state. | STATE-001, WORLD-001 | Save/load preserves current and discovered cells. |
| [ ] | WORLD-004 | Create a RegionCell renderer boundary that mounts one cell from a definition and displays a fallback on asset failure. | CONTENT-001 | Ranch cell mounts independently from WorldProps. |
| [ ] | WORLD-005 | Implement neighbor-cell prefetch and unload rules based on exits, distance, and memory pressure. | WORLD-004 | Instrumentation shows only current/neighbor bundles loaded. |
| [ ] | WORLD-006 | Implement cell transition volumes with debouncing, destination spawn anchors, and input lock during transfer. | WORLD-002, WORLD-004 | Repeated boundary contact triggers one transition and valid spawn. |
| [ ] | WORLD-007 | Add discovery events and map reveal state when the player enters a cell or finds a landmark. | WORLD-003, STATE-007 | First entry reveals once; revisits do not duplicate rewards. |
| [ ] | WORLD-008 | Add safe-area rules that suppress wild encounters, provide a return anchor, and expose rest/save services. | CONTENT-001, WORLD-003 | Every safe cell passes the same safe-area contract test. |

## WP06 — Traversal, camera, interaction, and input (INPUT)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | INPUT-001 | Extract tap-to-move into an input adapter that emits domain movement intents rather than mutating positions directly. | STATE-007 | Touch, mouse, and harness commands produce the same intent shape. |
| [ ] | INPUT-002 | Add walkable bounds and blocked-volume collision checks per cell. | CONTENT-001, INPUT-001 | Player cannot cross water/cliffs without a valid route. |
| [ ] | INPUT-003 | Add a context interaction query that ranks nearby NPCs, items, landmarks, and exits. | STATE-003, CONTENT-001 | Closest eligible target wins with stable tie-breaking. |
| [ ] | INPUT-004 | Add a single large contextual action button with icon, label, hold state, and disabled explanation. | INPUT-003 | Button is usable at tablet target size and keyboard focusable. |
| [ ] | INPUT-005 | Implement follow-distance and catch-up rules shared by player, ally, rival, and dinosaur companions. | STATE-003, STATE-004 | Followers neither overlap nor remain stranded after cell transitions. |
| [ ] | INPUT-006 | Add camera presets for explore, dialogue, care close-up, battle, landmark reveal, and boss introduction. | ARCH-006 | Each preset enters/exits without leaving controls locked. |
| [ ] | INPUT-007 | Add traversal ability checks for raft, heat protection, climbing assist, and glide currents. | WORLD-002, STATE-007 | Locked route explains the required ability; unlocked route works. |
| [ ] | INPUT-008 | Add stuck recovery that returns the party to the current cell's safe spawn without losing progress. | WORLD-008, INPUT-002 | Harness can force an invalid position and recover deterministically. |

## WP07 — Sunpatch Ranch and opening vertical slice (RANCH/INTRO)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | RANCH-001 | Convert the existing ranch, nest, training ring, market trail, and meadow gate into distinct world cells or cell subareas. | WORLD-004, CONTENT-001 | Each area has stable bounds, spawn anchor, and landmark ID. |
| [ ] | RANCH-002 | Preserve the permanent communal ranch fire while keeping the player's portable campsite as a separate inventory mechanic. | RANCH-001, ARCH-004 | Packing camp never removes or toggles the ranch fire. |
| [ ] | INTRO-001 | Author the complete opening dialogue graph including the exact required ally line and subtitles. | CONTENT-006 | Graph validates; exact line is present once. |
| [ ] | INTRO-002 | Add a VoiceProvider-backed playback cue for the ally's opening line with replay, skip, and failure fallback. | INTRO-001, ARCH-007 | Scene proceeds with audio success, failure, or muted settings. |
| [ ] | INTRO-003 | Stage the ally avatar running to the nest and facing the player before dialogue begins. | INPUT-006, STATE-003 | Camera and actor positions are deterministic in harness mode. |
| [ ] | INTRO-004 | Lock the ally's egg choice to a remaining species after the player's selection. | CONTENT-002, STATE-004 | Player and ally never receive the same egg instance. |
| [ ] | INTRO-005 | Stage the rival entrance, authored taunt, third egg selection, and exit route. | INTRO-004, CONTENT-006 | Rival claims a remaining egg and becomes scheduled actor state. |
| [ ] | INTRO-006 | Transition all three eggs through hatch state and place the player/ally at the ranch tutorial start. | INTRO-005, RANCH-001 | New-game flow ends with valid companions, flags, quest, and save checkpoint. |

## WP08 — Ally peer and companion (ALLY)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | ALLY-001 | Create the ally's typed content record, portrait/model reference, companion assignment, and personality tags. | CONTENT-003, INTRO-004 | Ally registry entry validates and companion link resolves. |
| [ ] | ALLY-002 | Define a seven-day repeating schedule with sleep, ranch help, training, exploring, shopping, and story overrides. | STATE-002, CONTENT-003 | Schedule query returns one valid activity for every minute. |
| [ ] | ALLY-003 | Implement offscreen ally simulation that resolves cell, activity, and companion presence from time and flags. | ALLY-002, SAVE-005 | Same seed/time/flags yields same location. |
| [ ] | ALLY-004 | Render the ally and their baby dinosaur only when their resolved activity is in the active cell. | ALLY-003, WORLD-004, INPUT-005 | Actor mounts/unmounts without duplicate instances. |
| [ ] | ALLY-005 | Add ally ambient behaviors: wave, call companion, inspect landmark, sit, and practice. | ALLY-004 | Behavior changes by schedule and remains non-blocking. |
| [ ] | ALLY-006 | Add context dialogue for greeting, current activity, current player quest, and recent regional victory. | CONTENT-006, ALLY-003 | At least four conditionally selected authored lines resolve. |
| [ ] | ALLY-007 | Add friendly competition events for training score, short races, and creature-spotting. | STATE-007, ALLY-004 | Each event has start, success, retry, and cancel states. |
| [ ] | ALLY-008 | Add ally relationship points and three relationship tiers without locking required story content. | STATE-001, ALLY-006 | Tier changes unlock flavor dialogue/cosmetics only. |

## WP09 — Rival peer and companion (RIVAL)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | RIVAL-001 | Create the rival's typed content record, model/portrait reference, stolen egg assignment, and bounded mischief tags. | CONTENT-003, INTRO-005 | Rival registry entry validates and uses a distinct companion. |
| [ ] | RIVAL-002 | Define the rival's repeating schedule with sleep, chores, solo training, vendor visits, shortcuts, and story overrides. | STATE-002, CONTENT-003 | Schedule covers every minute and includes unavailable periods. |
| [ ] | RIVAL-003 | Implement deterministic offscreen rival simulation using time, flags, and a separate seeded variation channel. | RIVAL-002, SAVE-005 | Rival path is repeatable without matching the ally's route. |
| [ ] | RIVAL-004 | Render the rival and their dinosaur when present in the active cell using shared follow and transition rules. | RIVAL-003, WORLD-004, INPUT-005 | Pair enters, roams, and exits without teleport artifacts. |
| [ ] | RIVAL-005 | Add safe mischief interactions: boast, harmless item hide, shortcut trigger, race challenge, and creature disturbance. | RIVAL-004, ARCH-005 | Every interaction has a reversible or recoverable outcome. |
| [ ] | RIVAL-006 | Add authored reaction sets for winning, losing, being helped, being confronted, and being ignored. | CONTENT-006, RIVAL-005 | Conditions select a valid line without blocking progression. |
| [ ] | RIVAL-007 | Add rival relationship state with wary, competitive, cooperative, and reconciled thresholds. | STATE-001, RIVAL-006 | Thresholds affect flavor and optional assists, not mandatory access. |
| [ ] | RIVAL-008 | Add one ranch rematch event proving the rival can initiate, complete, and leave a world activity. | BATTLE-004, RIVAL-004 | Event returns both actors to schedule state after success or cancel. |

## WP10 — Functional NPCs, schedules, and services (NPC)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | NPC-001 | Implement a generic schedule resolver for fixed anchors, cell patrols, sleep/unavailable states, and story overrides. | STATE-002, CONTENT-003, SAVE-005 | Fixture NPC resolves deterministically for a full week. |
| [ ] | NPC-002 | Implement generic NPC presence rendering with idle animation, facing, interaction radius, and fallback model. | NPC-001, WORLD-004, INPUT-003 | NPC mounts only in its resolved cell and remains interactable. |
| [ ] | NPC-003 | Add the Dino Ranger content record and ranch/region schedule. | CONTENT-003, NPC-001 | Ranger appears at the training ring and later outposts. |
| [ ] | NPC-004 | Add a ranger service interface for training lessons, skill unlocks, creature notes, and regional advice. | NPC-003, STATE-007 | Each service returns a typed result and child-readable explanation. |
| [ ] | NPC-005 | Add the ranch shop owner content record, counter anchor, greeting dialogue, and opening hours. | CONTENT-003, NPC-001 | Shop owner can be unavailable with a clear return-time hint. |
| [ ] | NPC-006 | Add a reusable quest-giver marker and dialogue state without forcing every NPC into a deep simulation. | CONTENT-005, CONTENT-006, NPC-002 | Marker reflects available, active, and turn-in quest states. |
| [ ] | NPC-007 | Add a traveling-vendor schedule template with region route, rest days, rotating stock seed, and fallback location. | NPC-001, CONTENT-004 | Vendor location and stock are deterministic for a given day. |
| [ ] | NPC-008 | Add a world directory query so map UI and spren hints can report where a known NPC is or when they return. | NPC-001, WORLD-002 | Query distinguishes present, elsewhere, asleep, and story-hidden. |

## WP11 — Inventory, shops, economy, and portable camp (ECON)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | ECON-001 | Add inventory state with item stacks, capacity, key-item separation, and typed add/remove/query operations. | CONTENT-004, STATE-001 | Tests cover stacking, full capacity, key items, and invalid removal. |
| [ ] | ECON-002 | Add a single soft currency with nonnegative balance and transaction history entries. | STATE-001 | Earn/spend/refund operations preserve balance invariants. |
| [ ] | ECON-003 | Implement the ranch shop transaction flow with stock, price, quantity, confirmation, and insufficient-funds feedback. | ECON-001, ECON-002, NPC-005 | Purchase updates inventory, balance, stock, and save exactly once. |
| [ ] | ECON-004 | Add regional vendor stock rules based on region, story chapter, day seed, and one guaranteed useful item. | NPC-007, ECON-003 | Same day/seed gives same stock and never an empty shop. |
| [ ] | ECON-005 | Define starter care items for food, cleaning, comfort, play, and temporary encounter support. | CONTENT-004, CARE-002 | Each item has one clear use, description, cap, and feedback event. |
| [ ] | ECON-006 | Convert portable camp into an inventory-backed place/pack action with valid-ground and safe-distance checks. | INPUT-002, ECON-001, RANCH-002 | Camp cannot overlap hazards/hubs and returns to inventory when packed. |
| [ ] | ECON-007 | Add camp rest, simple cooking, and party-needs recovery using a short touch-first menu. | ECON-005, ECON-006 | Rest advances time, applies bounded recovery, and autosaves. |
| [ ] | ECON-008 | Add a lightweight recipe system with two ingredients maximum for the foundation. | CONTENT-004, ECON-001 | Three starter recipes craft deterministically and explain missing items. |

## WP12 — Baby dinosaur models, palettes, and animation (DINO)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | DINO-001 | Inventory every current dinosaur GLB's meshes, material names, skeleton, animation clips, scale, and facing direction. | ARCH-001 | Machine-readable audit covers all six species and flags anomalies. |
| [ ] | DINO-002 | Define semantic palette slots such as body, belly, accent, markings, eyes, and glow independently of source material names. | CONTENT-002, DINO-001 | Every species maps source materials to supported slots or fallback. |
| [ ] | DINO-003 | Implement per-instance material cloning and palette application without mutating cached GLTF materials. | DINO-002 | Three same-species actors display different palettes simultaneously. |
| [ ] | DINO-004 | Author at least three colorful, high-contrast, child-friendly palettes per hatchable species. | DINO-002 | Palette gallery passes readability review in day and night lighting. |
| [ ] | DINO-005 | Store selected base palette and earned accent options in CompanionState and save data. | STATE-004, SAVE-001, DINO-004 | Palette persists across load and cell transition. |
| [ ] | DINO-006 | Normalize animation names into idle, walk, run, jump, attack, react, eat, sleep, and celebrate with fallbacks. | DINO-001 | Every species can request each semantic action without throwing. |
| [ ] | DINO-007 | Add animation transition policy for locomotion, interaction, battle, and scripted scenes. | DINO-006 | No frozen one-shot or abrupt loop remains after action completion. |
| [ ] | DINO-008 | Add distance-based detail settings for full rig, reduced updates, and hidden/offscreen simulation. | WORLD-005, DINO-006 | Instrumentation confirms distant dinosaurs stop unnecessary frame work. |

## WP13 — Needs, emotion, bonding, and face PIP (CARE)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | CARE-001 | Expand dinosaur needs into hunger, cleanliness, energy, happiness, trust, and comfort with bounded values. | STATE-004 | Invariant tests clamp all needs and serialize them. |
| [ ] | CARE-002 | Define slow, time-based need decay curves that pause during cutscenes and never create emergency failure. | CARE-001, STATE-002 | Simulated day produces expected bounded need changes. |
| [ ] | CARE-003 | Implement derived emotional states from needs, recent events, bond, location, and battle status. | CARE-001, STATE-007 | Fixtures resolve happy, curious, tired, dirty, worried, and proud. |
| [ ] | CARE-004 | Map emotional states to body animation, posture, eye direction, vocal cue, and UI expression. | CARE-003, DINO-006 | Each emotion has a visible fallback even without custom clips. |
| [ ] | CARE-005 | Add close-up care mode for pet, feed, clean, comfort, and play with a clear enter/exit camera transition. | INPUT-006, CARE-001 | Each action updates one need and returns control safely. |
| [ ] | CARE-006 | Create a face PIP state contract containing emotion, gaze target, dirt level, urgent need, activity, and speaking state. | CARE-003 | Contract can render without a second 3D camera. |
| [ ] | CARE-007 | Implement the PIP UI with a low-frequency live portrait renderer and a static animated fallback. | CARE-006, DINO-008 | PIP stays readable and within the performance budget on tablet. |
| [ ] | CARE-008 | Make PIP gaze look toward the player while idle and deliberately off-frame toward movement, objects, peers, or danger. | CARE-004, CARE-007 | Harness scenarios produce the expected named gaze target. |

## WP14 — Ethereal spren guide and hint system (SPREN)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | SPREN-001 | Define the spren's content identity, visual rules, voice key, personality, and accessibility-safe introduction text. | CONTENT-003, CONTENT-006 | Content record includes the requested bond phrase and configurable address token. |
| [ ] | SPREN-002 | Add a deterministic unlock quest shortly after the first ranch care lesson. | CONTENT-005, RANCH-001, CARE-005 | Quest starts, introduces the spren, and sets one permanent unlock flag. |
| [ ] | SPREN-003 | Build the spren visual as a pooled ethereal companion with hover, orbit, trail, and reduced-motion variants. | SPREN-001, INPUT-005 | Spren follows without clipping and disables expensive trail in low mode. |
| [ ] | SPREN-004 | Implement authored HintProvider rules using quest state, nearby targets, elapsed stuck time, and recent failures. | ARCH-007, STATE-007, INPUT-003 | Offline provider returns a relevant hint for defined test scenarios. |
| [ ] | SPREN-005 | Add a hint escalation ladder: subtle direction, named objective, map highlight, and optional guided arrow. | SPREN-004 | Repeated help requests escalate without repeating identical text. |
| [ ] | SPREN-006 | Add spren reactions to dinosaur emotion, new landmarks, ally/rival arrival, rare finds, and boss presence. | CARE-003, WORLD-007, STATE-003 | Reactions are rate-limited and do not interrupt critical dialogue. |
| [ ] | SPREN-007 | Add optional AI hint rephrasing behind an adapter that cannot change commands, rewards, flags, or target IDs. | SPREN-004, ARCH-007 | Offline and AI paths return the same structured hint intent. |
| [ ] | SPREN-008 | Add mute, hint frequency, voice, subtitle, and “ask for help” settings. | SPREN-004 | Settings persist and disabling hints suppresses unsolicited prompts. |

## WP15 — Quest, dialogue, and story-state framework (QUEST)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | QUEST-001 | Implement a pure quest reducer for unavailable, available, active, completed, failed-retryable, and turned-in states. | CONTENT-005, STATE-007 | Transition table tests reject illegal state changes. |
| [ ] | QUEST-002 | Implement objective evaluators for talk, reach, interact, collect, care, train, encounter, discover, escort, and return. | QUEST-001 | One fixture per objective advances only on matching events. |
| [ ] | QUEST-003 | Implement prerequisite evaluation for story flags, quests, items, abilities, relationship tiers, time windows, and regions. | STATE-005, ECON-001, QUEST-001 | Compound all/any/not conditions pass fixture tests. |
| [ ] | QUEST-004 | Implement dialogue runner with conditions, choices, effects, voice cues, skip, replay, and interruption recovery. | CONTENT-006, ARCH-007 | Dialogue resumes at a valid node after save/load. |
| [ ] | QUEST-005 | Add a story chapter controller for opening, ranch training, Fernwood, Ambergrass, Moonwater, Emberpeak, Starfall, and epilogue. | QUEST-001, WORLD-001 | Every chapter has enter, active, complete, and next conditions. |
| [ ] | QUEST-006 | Add quest journal categories for story, region, character, and optional discoveries. | QUEST-001 | Journal shows current objective, location, reward, and completed history. |
| [ ] | QUEST-007 | Add objective guidance hooks for map marker, world beacon, spren hint, NPC marker, and “no marker” mystery goals. | QUEST-002, SPREN-004, WORLD-007 | Each guidance mode can be enabled independently by content. |
| [ ] | QUEST-008 | Author the complete ranch chapter from hatch through care lesson, spren arrival, training stars, Mossback trial, and Fernwood gate. | INTRO-006, SPREN-002, QUEST-005 | Fresh save reaches Fernwood with no debug command or missing objective. |

## WP16 — Touch-first nonlethal battle system (BATTLE)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | BATTLE-001 | Extract battle rules from UI/store code into a pure deterministic battle state machine. | STATE-007, ARCH-005 | Battle runs to completion in unit tests without React. |
| [ ] | BATTLE-002 | Define combatant stats, move costs, power, defense, speed, status effects, bond meter, and yield threshold. | BATTLE-001, CONTENT-002 | Schema rejects negative costs and impossible thresholds. |
| [ ] | BATTLE-003 | Define a starter move set shared by all species plus one species-flavored move each. | BATTLE-002 | Every hatchable species has three usable early moves. |
| [ ] | BATTLE-004 | Implement turn order, move validation, seeded outcome roll, status duration, and end-of-turn cleanup. | BATTLE-002, SAVE-005 | Same seed and inputs produce identical battle log. |
| [ ] | BATTLE-005 | Add defend, comfort, item, observe, and retreat actions alongside direct moves. | BATTLE-004, ECON-001, CARE-001 | Each action has a valid tactical effect and clear disabled reason. |
| [ ] | BATTLE-006 | Add nonlethal victory, defeat, retreat, and story-interrupted outcomes with typed rewards and recovery. | BATTLE-004, ARCH-005 | No outcome leaves negative HP or an unresolvable mode. |
| [ ] | BATTLE-007 | Add battle presentation events for camera cue, animation, impact, number, status, dialogue, and victory choreography. | BATTLE-004, DINO-007, INPUT-006 | Renderer consumes events without owning battle truth. |
| [ ] | BATTLE-008 | Replace the current Mossback prototype flow with the new battle state machine while preserving its visual arena. | BATTLE-006, BATTLE-007 | Existing training-to-Mossback flow passes regression. |

## WP17 — Wild creature encounters and ecology (WILD)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | WILD-001 | Define habitat tags and time/weather eligibility for every wild creature archetype. | CONTENT-002, CONTENT-007, STATE-002 | Registry query returns valid creatures for each region habitat. |
| [ ] | WILD-002 | Implement deterministic encounter spawning with cell capacity, cooldown, distance, safe zones, and story suppression. | CONTENT-007, SAVE-005, WORLD-008 | Seeded route produces repeatable spawns and none in safe areas. |
| [ ] | WILD-003 | Add ambient creature states for forage, wander, rest, flee, investigate, and challenge. | STATE-007, WILD-002 | State transitions work offscreen and render when nearby. |
| [ ] | WILD-004 | Add pre-battle telegraph and player choices to observe, approach, offer item, challenge, or leave. | INPUT-003, ECON-001, WILD-003 | Player can avoid every non-story wild battle. |
| [ ] | WILD-005 | Connect challenge choice to battle setup using the exact spawned creature instance and environment. | BATTLE-004, WILD-004 | Returning from battle resolves or preserves the correct spawn. |
| [ ] | WILD-006 | Add calm/befriend outcomes that unlock creature notes, habitat hints, and cosmetic rewards rather than capture. | BATTLE-006, NPC-004 | First calm grants note once; repeats grant bounded rewards. |
| [ ] | WILD-007 | Add encounter cooldown and anti-grind scaling that preserves fun without punishing exploration. | WILD-002, WILD-006 | Repeated route never chains encounters faster than configured minimum. |
| [ ] | WILD-008 | Add region ecology counters so story events can temporarily change spawn mix and ambient behavior. | STATE-005, WILD-002 | Setting a region event flag changes the table and later restores it. |

## WP18 — Regional bosses, abilities, and world progression (BOSS)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | BOSS-001 | Implement multi-phase boss definitions with phase triggers, arena rules, authored reactions, and nonlethal resolution. | CONTENT-007, BATTLE-006 | Two-phase fixture changes behavior at the configured threshold. |
| [ ] | BOSS-002 | Add boss introduction state that locks input, stages camera/actors, names the threat, and can be skipped after first viewing. | INPUT-006, BOSS-001 | First and repeat introductions both enter battle safely. |
| [ ] | BOSS-003 | Add environmental boss actions represented as battle events rather than arbitrary scene mutations. | BOSS-001, BATTLE-007 | Arena reacts from typed events and deterministic log. |
| [ ] | BOSS-004 | Define six crest records and their links to chapters, bosses, map display, rewards, and route gates. | QUEST-005, ARCH-004 | Each region has one unique crest and valid unlock link. |
| [ ] | BOSS-005 | Implement traversal ability unlocks as explicit story rewards rather than implicit quest side effects. | INPUT-007, QUEST-001 | Ability is absent before reward and saved immediately after. |
| [ ] | BOSS-006 | Add a regional completion transaction that awards crest, ability, currency/items, story flags, and recovery exactly once. | BOSS-004, BOSS-005, ECON-002 | Replaying completion cannot duplicate rewards. |
| [ ] | BOSS-007 | Add retry checkpoints outside boss arenas with recommended care/training hints and no lost inventory. | BOSS-001, WORLD-008, SPREN-005 | Defeat returns party to valid checkpoint and offers relevant help. |
| [ ] | BOSS-008 | Add boss-state save/resume policy that restarts the current phase cleanly rather than serializing animation mid-frame. | SAVE-002, BOSS-001 | Reload during each phase produces valid deterministic restart. |

## WP19 — Fernwood Wilds region (FERN)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | FERN-001 | Build Lantern Hollow as Fernwood's safe ranger camp with rest, save, ranger, vendor, and fast-travel anchor. | WORLD-008, NPC-003, ECON-004 | Safe-area contract passes and all services are reachable. |
| [ ] | FERN-002 | Build Whispering Grove as an introductory forest cell with forked trail, landmark tree, and low-risk encounter space. | WORLD-004, INPUT-002 | Cell has valid bounds, exits, landmark, and encounter zones. |
| [ ] | FERN-003 | Build Mossy Steps with stepping-stone traversal, shallow stream blockers, and a hidden collectible ledge. | INPUT-007, WORLD-004 | Intended route works; invalid water crossing is blocked. |
| [ ] | FERN-004 | Build Singing Canopy with vertical sightlines, musical flora interactions, and day/night ambience variants. | WORLD-004, STATE-002 | Flora interaction and ambience respond deterministically to time. |
| [ ] | FERN-005 | Build Rootbridge as a gated approach cell with a repaired natural bridge and boss-arena transition. | QUEST-003, WORLD-006 | Bridge route changes only after its quest flag. |
| [ ] | FERN-006 | Author Fernwood's habitat table, ambient groups, three wild encounter families, ranger notes, and vendor stock. | WILD-001, NPC-004, ECON-004 | Day/night routes expose the configured variety with no safe spawns. |
| [ ] | FERN-007 | Author Fernwood's story arc: missing trail markers, frightened creatures, rootbridge repair, and guardian investigation. | QUEST-005, FERN-001 through FERN-005 | Arc advances across all cells and survives save/load at each objective. |
| [ ] | FERN-008 | Implement the Thornback guardian boss, crest reward, ally/rival reactions, and route opening to Ambergrass. | BOSS-006, FERN-007, ALLY-006, RIVAL-006 | Boss resolution awards once and unlocks the correct world edge. |

## WP20 — Ambergrass Prairie region (AMBER)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | AMBER-001 | Build Windmill Rest as the prairie safe hub with shop stall, race board, rest point, and fast travel. | WORLD-008, NPC-007, ECON-004 | Hub services work and encounter suppression passes. |
| [ ] | AMBER-002 | Build Tallgrass Maze with readable wind direction, moving grass lanes, and creature-spotting clearings. | WORLD-004, INPUT-002 | Child testers can reach both exits without hidden pixel paths. |
| [ ] | AMBER-003 | Build Thunder Flats with visible storm telegraphs, temporary safe stones, and reduced-motion fallback. | STATE-002, WORLD-004 | Hazard rhythm is deterministic and never causes permanent failure. |
| [ ] | AMBER-004 | Build Sunstone Canyon with elevation switchbacks, echo interactions, and a gated glide-current shortcut. | INPUT-007, WORLD-004 | Ground path works before glide; shortcut works after unlock. |
| [ ] | AMBER-005 | Build Herding Fields with moving ambient herds, race markers, and ally competition route. | ALLY-007, WILD-003 | Herd pathing and race can run together without blocking exits. |
| [ ] | AMBER-006 | Author prairie habitats, fast pack encounters, horned creature encounters, vendor goods, and ranger notes. | WILD-001, ECON-004, NPC-004 | Encounter and stock queries vary correctly by cell/time. |
| [ ] | AMBER-007 | Author the prairie story arc around disrupted migrations, rival shortcuts, storm beacons, and restoring a safe herd route. | QUEST-005, AMBER-001 through AMBER-005 | Objectives allow exploration order without soft-locking the arc. |
| [ ] | AMBER-008 | Implement the Stormhorn race/battle hybrid, prairie crest, glide-current ability, and Moonwater route unlock. | BOSS-003, BOSS-006, AMBER-007 | Both race and battle inputs contribute to one deterministic outcome. |

## WP21 — Moonwater Marsh region (MARSH)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | MARSH-001 | Build Reedlight Village as a stilted safe hub with dock, healer/caretaker, vendor, rest, and fast travel. | WORLD-008, ECON-004, NPC-002 | Hub is navigable by touch and contains no encounter spawns. |
| [ ] | MARSH-002 | Build Mirror Pools with reflective landmarks, shallow-water routes, and day/night path readability. | WORLD-004, STATE-002 | Routes remain readable with reflections reduced or disabled. |
| [ ] | MARSH-003 | Build Glowreed Fen with bioluminescent guide reeds, nocturnal creatures, and optional stealthy observation. | WILD-003, WORLD-004 | Night changes ambience/spawns without hiding required objectives. |
| [ ] | MARSH-004 | Build Sinkroot Grove with sinking-ground telegraphs, root platforms, and a comfort-based dinosaur assist. | CARE-003, INPUT-007 | Assist triggers from bond/comfort and has a fallback route. |
| [ ] | MARSH-005 | Build Moonwell with water-level switches, raft anchors, ritual landmark, and boss-arena boundary. | ECON-006, WORLD-006 | Raft and switch state persist across cell reload. |
| [ ] | MARSH-006 | Author marsh habitats, amphibious/nocturnal encounters, regional ingredients, vendor stock, and creature notes. | WILD-001, ECON-008, NPC-004 | Tables cover day/night and never require unavailable items. |
| [ ] | MARSH-007 | Author the marsh story arc around dimming glowreeds, a blocked Moonwell, missing boat parts, and frightened wildlife. | QUEST-005, MARSH-001 through MARSH-005 | Quest supports camp/rest time changes without losing state. |
| [ ] | MARSH-008 | Implement Mirejaw's water-level boss phases, marsh crest, raft upgrade, and Emberpeak route unlock. | BOSS-003, BOSS-006, MARSH-007 | Phase changes match water events and reload safely. |

## WP22 — Emberpeak Range region (EMBER)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | EMBER-001 | Build the Emberpeak Ranger Outpost safe hub with training upgrade service, supply vendor, rest, and fast travel. | WORLD-008, NPC-004, ECON-004 | Ranger upgrades and safe-area services function. |
| [ ] | EMBER-002 | Build Ashwood Foothills with ash gust telegraphs, fallen-log routes, and heat-shelter landmarks. | WORLD-004, INPUT-002 | Player always has a readable safe route through gusts. |
| [ ] | EMBER-003 | Build Lava Tubes with lit junctions, cooling vents, and short route puzzles rather than darkness mazes. | WORLD-004, SPREN-005 | Guided hint can identify the next valid junction. |
| [ ] | EMBER-004 | Build Obsidian Shelf with breakable rock gates and dinosaur-assisted clearing interactions. | INPUT-007, CARE-003 | Required gates have ability check, animation, and fallback explanation. |
| [ ] | EMBER-005 | Build Crater Rim with dramatic vistas, stable arena approach, shelter checkpoint, and boss boundary. | WORLD-006, BOSS-007 | Checkpoint restores party outside the arena. |
| [ ] | EMBER-006 | Author mountain habitats, armored/fire-adapted encounters, minerals, vendor equipment, and ranger notes. | WILD-001, ECON-004, NPC-004 | Spawn and shop content respect the heat-protection gate. |
| [ ] | EMBER-007 | Author the mountain story arc around tremors, blocked vents, the rival's risky shortcut, and calming panicked herds. | QUEST-005, EMBER-001 through EMBER-005 | Rival event cannot strand the player or permanently block an exit. |
| [ ] | EMBER-008 | Implement the Ash Titan environmental boss, mountain crest, heat-protection upgrade, and Starfall route unlock. | BOSS-003, BOSS-006, EMBER-007 | Arena hazards are telegraphed, recoverable, and deterministic. |

## WP23 — Starfall Coast region and epilogue (COAST)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | COAST-001 | Build Beacon Harbor as the coastal safe hub with lighthouse, docks, final vendors, rest, and fast travel. | WORLD-008, ECON-004, NPC-002 | All services work and final-chapter NPC overrides resolve. |
| [ ] | COAST-002 | Build Tide Pools with timed water routes, collectible shells, and non-blocking ambient creatures. | STATE-002, WORLD-004 | Tide state is deterministic and always leaves a safe exit. |
| [ ] | COAST-003 | Build Fossil Cliffs with rope paths, fossil discoveries, and story clues about the eggs. | WORLD-007, INPUT-007 | Each clue reveals once and updates the journal. |
| [ ] | COAST-004 | Build Storm Reef with raft traversal, wind/current telegraphs, and shelter checkpoints. | MARSH-008, AMBER-008, INPUT-008 | Failing traversal restores at the latest shelter without item loss. |
| [ ] | COAST-005 | Build Starfall Beach with meteor-glass landmarks, calm exploration space, and final arena approach. | WORLD-004, BOSS-002 | Approach supports landmark reveal and skippable repeat entrance. |
| [ ] | COAST-006 | Author coastal habitats, flying/coastal/ancient encounters, final vendor stock, fossil notes, and rare cosmetics. | WILD-001, ECON-004, NPC-004 | Content varies by tide/time and has no required rare random drop. |
| [ ] | COAST-007 | Author the coast story arc revealing the nest mystery and bringing ally/rival journeys into the same objective. | QUEST-005, COAST-001 through COAST-005, ALLY-008, RIVAL-007 | Story branches acknowledge relationships but converge without content loss. |
| [ ] | COAST-008 | Implement the storm beacon final crest trial and epilogue schedules for the player, ally, rival, and regional NPCs. | BOSS-006, COAST-007 | Credits/epilogue return to an explorable world with quests and saves intact. |

## WP24 — Interface, accessibility, audio, and feedback (UX)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | UX-001 | Replace overlapping prototype HUD panels with a mode-aware shell for explore, dialogue, care, shop, map, journal, and battle. | STATE-001, INPUT-004 | Only relevant controls render in each mode and safe-area exit remains available. |
| [ ] | UX-002 | Build a touch-first world map showing discovered cells, safe areas, current party, known NPC schedules, quests, and fast travel. | WORLD-007, NPC-008, QUEST-007 | Map is usable at target tablet resolution without hover. |
| [ ] | UX-003 | Add unified toast/event feedback for item, currency, quest, discovery, relationship, ability, save, and error events. | STATE-007 | Events queue, coalesce repeats, and never cover the action button. |
| [ ] | UX-004 | Add settings for text size, subtitle size, contrast, color differentiation, reduced motion, camera shake, vibration, volume channels, and PIP. | SPREN-008, CARE-007 | Settings apply live and persist per save/profile. |
| [ ] | UX-005 | Add complete keyboard, screen-reader label, focus order, and escape/back behavior for every non-canvas UI mode. | UX-001 | Automated accessibility scan plus keyboard walkthrough passes agreed criteria. |
| [ ] | UX-006 | Implement AudioDirector with region ambience, safe-area theme, exploration music, battle layers, boss cues, and ducking under dialogue. | CONTENT-001, BATTLE-007, QUEST-004 | Transitions crossfade and muted channels perform no playback. |
| [ ] | UX-007 | Add authored voice manifest and subtitle timing for the opening, spren introduction, chapter transitions, bosses, and epilogue. | INTRO-001, SPREN-001, QUEST-005 | Missing audio falls back to subtitles without blocking. |
| [ ] | UX-008 | Add a first-session tutorial policy that teaches one control at a time and suppresses completed prompts across saves. | QUEST-008, UX-001 | Fresh player gets ordered prompts; returning player does not. |

## WP25 — Performance, QA, balancing, and release integration (PERF/QA/RELEASE)

| Done | ID | Atomic task | Depends on | Acceptance evidence |
|---|---|---|---|---|
| [ ] | PERF-001 | Establish reference tablet/desktop profiles and automated counters for FPS, frame time, draw calls, triangles, textures, and loaded GLBs. | ARCH-001, SAVE-007 | Baseline report can be reproduced from a named route. |
| [ ] | PERF-002 | Set per-quality-tier budgets for actors, shadows, draw calls, particles, PIP refresh, cell memory, and transition time. | PERF-001 | Budget table has pass/fail thresholds for low, medium, and high. |
| [ ] | PERF-003 | Implement low/medium/high quality presets with automatic suggestion and manual override. | PERF-002, DINO-008, SPREN-003, CARE-007 | Each preset visibly changes only documented features and persists. |
| [ ] | PERF-004 | Add asset preflight that reports missing GLBs, animation clips, oversized textures, duplicate materials, and unlicensed files. | CONTENT-008, DINO-001 | CI fixture intentionally fails each report category. |
| [ ] | QA-001 | Create deterministic end-to-end smoke scenarios for new game, intro, care, spren, shop, quest, wild battle, boss, save/load, and fast travel. | SAVE-008, QUEST-008, BATTLE-008 | Scenarios use semantic commands/state, not fragile screen coordinates. |
| [ ] | QA-002 | Create save-migration fixtures for every released schema and corruption/recovery cases. | SAVE-003, SAVE-004 | All fixtures load or return a child-safe recoverable error. |
| [ ] | QA-003 | Run a full content-graph audit for unreachable cells, dangling dialogue, impossible quests, missing rewards, duplicate IDs, and progression soft-locks. | CONTENT-008, COAST-008 | Audit produces zero errors for release content. |
| [ ] | RELEASE-001 | Complete the release-candidate pass: production build, full story smoke, two-hour soak, tablet performance, accessibility, offline mode, optional-provider failure, and clean-save replay. | All prior tasks | Signed checklist links build output, metrics, screenshots, save fixtures, and known non-blockers. |

---

## 13. Recommended execution waves

### Wave 0 — Freeze contracts

Complete ARCH-001 through ARCH-008. No large system should be built until IDs, layer boundaries, offline behavior, and scope decisions are recorded.

### Wave 1 — Make state testable

Complete STATE, CONTENT, and SAVE/HARNESS. This is the main dependency gate. At the end, an agent must be able to create a world, issue commands, advance time, save, reload, and inspect state without clicking the canvas.

### Wave 2 — Deliver the living-ranch vertical slice

Run WORLD and INPUT first. Then parallelize RANCH/INTRO, ALLY, RIVAL, DINO, and CARE. Add SPREN and finish QUEST-008. This wave is successful only when the entire requested opening and first ranch chapter work on a fresh save.

### Wave 3 — Finish the first complete game loop

Complete NPC, ECON, QUEST framework, BATTLE, WILD, BOSS, and FERN. This produces the minimum honest open-world story game: a safe hub, scheduled peers, a wilderness region, shops, quests, wild encounters, a boss, a crest, and a return loop.

### Wave 4 — Expand the world in parallel

AMBER, MARSH, EMBER, and COAST may use separate contributors after their shared contracts are frozen. Each region must integrate continuously rather than living on a long-running isolated branch.

### Wave 5 — Child-ready polish

Complete UX and PERF/QA/RELEASE. Do not postpone save recovery, accessibility, optional-provider failure, or low-quality mode until after content lock.

---

## 14. Cross-package acceptance scenarios

These scenarios are release-level stories, not substitutes for individual task tests.

### Scenario A — The nest

Start a clean save, hear or read the exact ally line, inspect eggs, choose one, see the ally choose a different egg, see the rival take a third, hatch all companions, and arrive at the ranch with valid persistent actor state.

### Scenario B — A living day

Advance from morning through night. The ally trains, explores, and sleeps; the rival appears elsewhere, causes a reversible event, and becomes unavailable; shop hours change; wild spawns change; the spren can explain where a known character went.

### Scenario C — Care and closeness

Let the dinosaur become dirty and tired. The PIP shows the correct expression and gaze. Enter care mode, clean and comfort it, observe state/animation/PIP change, save, reload, and retain the improved condition.

### Scenario D — First regional adventure

Leave the ranch, enter Fernwood, discover Lantern Hollow, shop, accept a quest, avoid one wild encounter, resolve another through battle or calming, repair Rootbridge, complete the boss, receive a crest/ability once, and return safely.

### Scenario E — Failure without punishment

Lose a wild battle and a boss battle, become stuck in terrain, encounter missing voice/model assets, and interrupt a save. Every case returns to a playable state with clear child-readable guidance and no lost required item.

### Scenario F — Full world

Complete all six regional arcs in valid order, revisit every safe area, find both peers according to schedule, use all traversal abilities, finish the storm beacon trial, watch the epilogue, and continue exploring the same save.

---

## 15. Balance and content budgets

Initial targets; tune from playtesting rather than intuition.

- Opening to first free ranch control: 5–8 minutes.
- Ranch chapter to Fernwood access: 25–45 minutes.
- Each later regional main arc: 45–90 minutes.
- Wild encounter: 30–120 seconds.
- Regional boss: 3–6 minutes including introduction.
- Required dialogue card: normally 12 words or fewer; never more than three cards without player input or a skip affordance.
- Travel between meaningful interactions: normally under 45 seconds.
- Unsolicited spren hint cooldown: at least 90 seconds.
- Needs: no urgent state during a normal 20-minute session begun in good condition.
- Inventory: enough starter capacity to complete a regional outing without compulsory inventory management.
- Random required drops: zero.
- Save checkpoint: after purchases, quest transitions, boss outcomes, region transitions, and rests.

---

## 16. Risk register

| Risk | Consequence | Mitigation |
|---|---|---|
| Monolithic Zustand store continues growing | Fragile changes and impossible migrations | STATE package splits serializable slices and pure commands first |
| “Open world” becomes one giant mounted scene | Tablet memory/FPS collapse | Region graph, cell streaming, prefetch, LOD, instancing, quality tiers |
| Friend/rival feel like teleporting quest markers | World still feels dead | Deterministic schedules, offscreen simulation, activities, companion rendering |
| AI availability controls core behavior | Offline game breaks and tests become nondeterministic | Authored providers own logic; AI only decorates wording/reactions |
| PIP requires a second full-rate render | Expensive tablet GPU cost | State-driven fallback and capped portrait refresh rate |
| Region teams invent incompatible content | Integration and save failures | Freeze schemas/IDs first; validate every manifest in CI |
| Child gets lost or overwhelmed | Abandonment despite rich world | Objective ladder, spren escalation, map clarity, recovery anchors |
| Rival reads as cruel instead of fun | Emotional harm and tonal mismatch | Bounded mischief vocabulary, reversible outcomes, relationship growth |
| Save changes erase existing progress | Loss of trust | Versioned migrations, fixtures, atomic write recovery, export |
| Boss spectacle owns game logic | Visual bugs corrupt progression | Pure battle/boss state machine emits presentation events |

---

## 17. Evidence log template

Copy one entry per completed task:

### TASK-ID — short title

- Status: complete / blocked
- Date:
- Implementer:
- Assumptions:
- Files changed:
- Verification command or scenario:
- Evidence artifact:
- Save migration impact:
- Follow-up tasks created:
- Known non-blocking limitations:

---

## 18. Completion definition for the long-horizon goal

This roadmap is complete when:

1. The exact opening sequence establishes the player, ally, rival, and their three different dinosaur companions.
2. The ally and rival persist as scheduled, roaming, interactable world actors with offscreen lives and companion dinosaurs.
3. The ranch and five additional regions are explorable, distinct, connected, and populated.
4. Every region has a safe area, multiple geographic cells, functional NPCs, ecology, quests, wild encounters, a story climax, and a crest/reward.
5. The baby dinosaur is colorful, emotionally legible, careable at close range, visible through the PIP, and meaningfully affected by bond and needs.
6. The spren provides an authored, optional, always-available guidance layer without owning required logic.
7. The battle, economy, quest, inventory, schedule, save, map, and progression systems remain coherent across the full story.
8. A child can recover from getting lost, losing, missing an optional service, closing the game, or encountering a failed asset/provider.
9. The production build passes deterministic full-story tests and meets the agreed tablet performance and accessibility budgets.
10. No essential behavior depends on one AI model, coding agent, browser harness, network service, or hosting vendor.
