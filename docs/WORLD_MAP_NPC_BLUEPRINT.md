# Sunpatch Valley: World Map and NPC Blueprint

## Scope and coordinate contract

- World plane uses `x` east/west, `z` north/south; all current interaction targets use `y: 0`.
- Playable authored basin: `x -30..30`, `z -30..28`. Keep collision/soft boundary inside ridge ring. Map conversion already assumes `x -30..30`, `z -30..26`.
- Existing player spawn is `(0, 0, -2)`, not ranch fire. First camera view must look north-east toward ranch fire at `(4.2, 0, 8.4)` and south toward Mossback gate/arena route.
- Do not make terrain height block current click-to-move until movement samples height. Use decorative ridges, bank meshes, raised path edges, and short ramps; interaction centers remain `y: 0`.

## Spatial plan

| Place | Center / footprint | Elevation read | Player job | Fixed landmark / sightline |
| --- | --- | --- | --- | --- |
| Arrival Meadow | `(0,-2)`, `x -6..7`, `z -8..5` | Low flat saddle | Orient, choose ranch, training, arena road | From spawn: ranch lanterns NE; twin arena banners S; crystal glint SE |
| Sunpatch Ranch | `(4.2,8.4)`, radius 10 | Raised warm terrace, +0.25 visual only | Care, recovery, crest celebration, quest handoff | Fire, tent, berry picnic; fenced north edge frames Fernwood gate |
| Pip Training Ring | `(-8,8)`, radius 6 | Flat packed circle, low flower berm | Earn 3 training stars | Gold ring visible from Arrival Meadow through west gap |
| Whispercap Grove | `(-12,2)`, radius 7 | Shaded shallow bowl; mushroom roots make edge | First enemy, singing-mushroom discovery | Pink/purple caps visible west from training ring; dense canopy hides exit |
| Prism Glen | `(13,-4)`, radius 7 | Stony knoll, +0.5 visual rock shelves | Crystal discovery, Gloomwing encounter after training | Tall cyan crystal stack visible from meadow and arena approach |
| Silverrun Crossing | `(-5,-12)`, radius 8 | Stream cut, water at -0.18 visual, banks +0.25 | Cross stepping stones; optional trained fight | Water band runs west-east; bridge sign faces north road |
| Mossback Gate | `(0,-20)`, radius 8 | Road descends one terrace | Spend 3 stars to enter friendly challenge | Twin red/gold banner posts visible from Arrival Meadow |
| Mossback Arena | `(0,-25)`, radius 8.5 | Existing floor top `0.46` | Spar ladder, Meadow Crest | Gate silhouette, cyan rune glow, crowd movement |
| Fernwood Gate | `(18,16)`, radius 5 | Narrow uphill visual ramp, +0.4 | Crest check, enter late-game loop | Two giant trunks and gold plaque visible from ranch fence |
| Fernwood Wilds | `(18,16)`, radius 9; extends to `(28,27)` | Layered green terraces and canopy | Thornjaw patrols, Rootshell guardian | Canopy closes behind gate; guardian clearing only revealed at final bend |

## Roads, loops, and gates

### Main spoke: home to arena

Use existing packed-road sequence as canonical path: `(5.5,8.3)`, `(4.1,4.7)`, `(3.5,0.7)`, `(3.1,-3.1)`, `(2.2,-6.8)`, `(1.2,-10.8)`, `(0.1,-14.8)`, `(-0.6,-18.9)`, `(-1.3,-23.2)`. Widen to 3.5–4.5 world units including shoulders. It is safe, readable, and carries player from ranch to Silverrun, gate, and arena.

### West beginner loop

`Ranch west gate (0,8)` -> `Training (-8,8)` -> `Whispercap (-12,2)` -> `Arrival Meadow (-4,0)` -> `Ranch south gate (2,5)`. Width 2.5. Use fence breaks, low mushroom banks, and lantern posts rather than solid walls. Boar sits at `(-17,3)` off loop, so player can see it, choose it, and retreat back to the loop.

### South discovery loop

`Arrival Meadow (0,-2)` -> `Prism (13,-4)` -> `east bank turnout (8,-11)` -> `Silverrun stones (-5,-12)` -> `main road (1,-11)`. Width 2.25. Prism is a deliberate detour before trained enemy access; no progression gate. Stream stones are alternate return route, never sole route.

### East crest loop

`Ranch north-east gate (7,11)` -> `(11,13)` -> Fernwood Gate `(18,16)` -> patrol fork `(22,18)` -> north loop `(15,24)` -> guardian clearing `(28,27)` -> east return `(27,16)` -> gate. Width 2.25, narrowed to 1.6 at gate. Gate remains visibly locked until `meadowCrestEarned`; once open, tree trunks frame path instead of disappearing.

### Gate rules

1. Training ring has no physical lock. Pip redirects player to ring until three stars.
2. Mossback banners/gate at `(0,-20)` block arena action, not movement: `trainingStars < 3` gives prompt and map guide to `(-8,8)`.
3. Fernwood Gate at `(18,16)` blocks movement/click target before crest. Use current `crestEarned` pointer behavior plus a visible root barrier. After crest, swap barrier for open trunks and lit plaque.
4. Silverrun must not be crest-gated: current `boar_silverrun` says trained, while zone unlock says start. Zone remains discoverable at start; only its boar encounter waits for training.

## Enemy territory and pacing

| Beat | Existing spawn / exact home | Territory shape and encounter rule | Recovery / next reason to travel |
| --- | --- | --- | --- |
| First optional fight | `boar_whispercap` `(-17,3)` | 3-unit patrol in west grove pocket; first sight from `(-14,4)` before aggro range | 2 tokens/3 XP; training/ranch remains close |
| Trained road test | `moth_prism` `(17,-7)` | 5-unit aerial orbit behind Prism’s east rock wall; player meets crystal landmark first | 3 tokens/4 XP; teaches fast/wary enemy |
| Crossing guard | `boar_silverrun` `(-11,-14)` | 4-unit south-west bank patrol, not on stepping-stone line | 2 tokens/3 XP; safe north road remains escape |
| Fernwood entrance | `thornjaw_fern_1` `(23,17)` | 5-unit patrol blocks direct east branch, leaving north loop readable | 5 tokens/6 XP; asks player to choose branch |
| Fernwood flank | `thornjaw_fern_2` `(15,24)` | 4-unit patrol on north loop, seen from overlook before it sees player | 5 tokens/6 XP; two patrols create route choice, not corridor combat |
| Fernwood finale | `boss_rootshell` `(28,27)` | 1-unit clearing anchor; no surprise aggro while entering clearing | 14 tokens/18 XP, `Rootshell Friend`; clearing gains lantern/seed visual after win |
| Future south boss slot | `boss_comet` `(-19,-23)` | Keep as sealed Silverrun west-bank arena until a named zone/gate exists | Do not label it Silverrun guardian in UI yet; current code requires crest, unlike master-plan order |

`Elder Rootshell` is current implemented guardian. Master plan names Elder Puffcap, Shardhorn, Brookjaw, and Bramblemaw, but none exist in catalog. Do not promise them via map markers until catalog, spawn, reward, and save-state work exist.

## NPC roster and placements

NPCs are stationary anchors. Give each an interaction radius of 2.2, facing/idle animation, one short current objective line, and one state-dependent line. Never place an NPC inside enemy aggro radius.

| NPC | Exact position / facing | First interaction | State changes / practical purpose |
| --- | --- | --- | --- |
| Pip, trail coach | `(-5.4,0,8)`, faces west toward ring | “Three focused sessions make a Meadow-ready team.” | At 3 stars: points south to Mossback Gate. After crest: points east to Fernwood. Starts `beginTraining` only when player is within training zone. |
| Marlow, ranch keeper | `(4.2,0,10.8)`, faces fire | “Campfire means rest, care, and a safe return.” | After Meadow Crest, stands at fire and prompts crest celebration. Anchors `returnToRanch` explanation; no shop until economy UI exists. |
| Suri, field mapper | `(1.2,0,5.6)`, faces south road | “Map places, then follow a trail guide.” | On zone discovery, names next undiscovered unlocked zone; opens map. Keeps map tutorial at ranch rather than overlay-only. |
| Nib, mushroom listener | `(-10.2,0,3.8)`, faces Whispercap caps | “Caps sing loudest after rain.” | Directs `singing_mushrooms` at `(-12,2)` and warns boar is west at `(-17,3)`. Moves no farther than grove entrance. |
| Iona, crystal surveyor | `(10.2,0,-2.2)`, faces Prism | “Find the humming color, then watch sky.” | Directs rainbow crystal `(13,-4)`; after 3 stars warns of Gloomwing at `(17,-7)`. |
| Toma, crossing scout | `(-2.4,0,-9.8)`, faces stones | “Stones return you west; road returns you home.” | Explains alternate loop and warns boar patrol sits south-west, not on crossing. |
| Moss, arena marshal | `(0,0,-19.2)`, faces north | “Three stars earns a friendly crest match.” | Before 3 stars: opens guide to Pip. After win: directs ranch fire. Battle action remains gate/arena interaction, not NPC click only. |
| Alder, Fernwood warden | `(15.4,0,14.4)`, faces gate | “A Meadow Crest opens old trails.” | Before crest: visible behind root barrier, directs arena. After crest: moves to `(20.2,0,17.4)`, points north/east patrol fork and names Rootshell clearing. |

## Discovery order and camera composition

1. New save: Ranch already discovered; Suri/Pip are both visible from initial meadow. Camera has two choices, no empty horizon.
2. Training: west loop exposes mushroom cap color and Pip’s gold ring. `training_ring` discovery occurs on arrival.
3. Whispercap: caps and Nib appear before boar. Player can take first encounter or return.
4. Prism/Silverrun: south road and cyan crystal create two visible destinations; Prism before moth, stream before boar.
5. Mossback: after third star, south banners become goal. Arena victory is viewed as a return-to-ranch event, then gate opening.
6. Fernwood: open gate becomes a long ranch sightline. First Thornjaw is framed beyond split, second is revealed from north overlook, Rootshell only from clearing approach.

Sightline rules:

- Keep center of each safe route free for 2.2 units. Dense trees/ferns form side walls, never random scatter across trail.
- Place high-color hero landmark at each decision: gold ring, pink caps, cyan prism, blue stream, red/gold arena banners, green/gold Fernwood gate.
- Use ridge silhouettes only at perimeter. Preserve `x 6..18, z 8..16` as open ranch-to-gate vista.
- Use low foreground props at camera edge; no companion-height prop directly in front of player spawn or destination interaction.
- Every combat territory needs a visible retreat route: grove east loop, Prism west road, Silverrun north bank, Fernwood gate/alternate branch.

## Immediate code mapping

| Need | File / exact mapping |
| --- | --- |
| Keep map nodes and route destinations canonical | `src/world/worldZones.ts`: retain centers above; add only a zone when its interaction, discovery, and landmark ship together. `mapPosition` bounds must expand if Fernwood guardian `(28,27)` becomes map-selectable. |
| Make map lines match real routes | `src/ui/WorldMap.tsx`: replace decorative SVG `map-path` with main spoke + west, south, and crest loops; show gate icon at Mossback/Fernwood, not generic road. |
| Place authored landmarks and route clearings | `src/three/world/WorldProps.tsx`: replace global `makeScatter` for route-adjacent trees/hills with named arrays; reserve trails, NPC circles, enemy territories, and views before scatter. Existing center points: ranch fire `(4.2,8.4)`, training `(-8,8)`, mushroom `(-12,2)`, crystal `(13,-4)`, stones `(-5,-12)`, Mossback marker `(0,-20)`, Fernwood gate `(18,16)`. |
| Add visual banks/ridges without changing click movement | `src/three/world/TerrainComposition.tsx`: implement location-specific terrace/bank/ridge groups using visual height only; retain flat `WorldGround` interaction plane. |
| Implement characters and dialogue | New `src/world/npcs/npcCatalog.ts` plus `src/three/world/NpcLayer.tsx`: use roster coordinates, 2.2 radius, state predicates (`trainingStars`, `meadowCrestEarned`, discovery). Render from data; do not hardcode per-mesh dialogue in `WorldProps`. |
| Enforce gates and enemy pacing | `src/world/enemies/enemyCatalog.ts` and `src/three/world/EnemyEncounterLayer.tsx`: preserve current homes; add territory decal/clearing bounds and UI label. Add Fernwood root-barrier collision/guide behavior in a dedicated gate layer. |
| Keep temporary camp portable | `src/three/world/Camp.tsx`: keep camp offset from current player position (`+3.5,+1.5`) and reject placement within NPC interaction circles, road centerline, water, arena, or boss clearings. Ranch fire remains permanent `WorldProps` home anchor. |
| Keep arena exact | `src/three/world/DinosaurArena.tsx`: arena center stays `(0,-25)`, gate local `z -7.2` faces north toward `(0,-20)`. Do not relocate it to satisfy map art. |

## Acceptance check

From a fresh save, player can identify Pip, ranch, arena direction, and one colorful wilderness landmark without opening map; reach first boar without forced combat; reach Prism and Silverrun by different legs of a loop; earn three stars, read Mossback gate, win, return to visibly changed ranch, then see Fernwood gate and its next threat from safe distance. No NPC, prop scatter, camp, or enemy blocks a named trail center.
