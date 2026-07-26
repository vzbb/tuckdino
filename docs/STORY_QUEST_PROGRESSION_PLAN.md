# Tuckdino Story + Quest Progression Plan

## Design rule

Every outing changes one visible thing: dino skill, map knowledge, ranch object, trail state, or relationship. No fetch-quest padding. Battles end with yielding, repair, or friendship; never harm companion.

## Core premise

Sunpatch Valley's **Trail Song** has gone quiet. It is not magic apocalypse: landmarks once helped young dinos learn safe routes, but tangled roots, crystal echoes, and anxious wild creatures now block them. Player and newly hatched dino restore each trail by learning care, reading enemy tells, and bringing each crest home. Ranch grows into living map of places helped.

Player role: junior Trailkeeper. Companion role: brave learner whose growth makes each milestone emotional and mechanical. Main question: can they become trusted enough to lead a safe expedition beyond Sunpatch?

## Cast

| NPC | Role | First use | System anchor |
|---|---|---|---|
| Pip | Warm trainer and quest voice. Teaches one stat/move concept at time; sends player outward only after practice. | Training Ring | `src/world/worldZones.ts`, `src/state/useGameStore.ts` training handlers, `src/ui/HUD.tsx` |
| Mossback | Friendly arena steward, not antagonist. Tests teamwork; awards Meadow Crest; hosts repeat spar ladder. | Mossback Meadow Gate | Existing arena flow in `useGameStore.ts`, `trainingProgression.ts` |
| Juniper | Ranch keeper. Turns each returned crest into visible ranch improvement and short campfire scene. | Sunpatch Ranch fire | `WorldProps.tsx` `HomeRanch`/`Campfire`, `celebrateCrestAtCamp` |
| Luma | Field-map scout. Marks next safe route after player discovers landmark; gives compact map dialogue. | Map / zone entrance | `WorldMap.tsx`, `worldZones.ts`, `discoverZone` |
| Elder Rootshell | An old, frightened grove guardian; first boss-like encounter. Wants quiet, not defeat. | Whispercap Grove | Existing `elder_rootshell` in `enemyCatalog.ts`; relocate/re-gate for Chapter 1. |
| Comet Raptor | Silverrun's competitive guardian. Tests reading fast intent changes. | Silverrun Stream | Existing `comet_raptor`; later chapter boss. |
| Bramblemaw | Fernwood's territorial trailkeeper, final current-world guardian. | Fernwood Wilds | Later species/boss; do not call current regular `thornjaw` the boss. |

NPCs can begin as text bubbles/portrait cards. Do not block story on new character rigs. Reuse ranch props, gate, boss models, and HUD overlay first.

## Chapter spine

| Chapter | Player promise and chain | Required gate | Permanent result | Build status |
|---|---|---|---|---|
| 0. Hatchling Oath | Hatch dino; Juniper names player Trailkeeper; Pip asks for one practice star. | Egg hatch | `chapter=1`, ranch discovered | Immediate: existing hatch + initial quest copy |
| 1. First Trail | Train 3 stars, pass Mossback's friendly test, return Meadow Crest, then calm Elder Rootshell in Whispercap. | 3 stars, arena win | Meadow Crest, Grove Lantern, growth stage 2, Whispercap clear | Immediate vertical slice |
| 2. Echo and Current | Luma opens Prism then Silverrun. Read trick/guard intents, cross stream, help Comet Raptor stop racing alone. | Grove Lantern / Chapter 2 | Prism Shield charge, Silverrun recovery boon, growth cosmetic | Later |
| 3. Wild Trail | Mossback's repeat spar proves readiness. Explore Fernwood, choose safe routes around two Thornjaws, calm Bramblemaw. | Meadow Crest plus Chapter 2 clears | Fernwood Crest, portable-camp upgrade, growth stage | Later |
| 4. Horizon | Volcanic Ridge, Moonlit Marsh, Ruined Observatory. Each restores one piece of Trail Song and exposes final shared route. | Prior crests | Frontier crests and full ranch map | Later content |

`adventure.chapter` should mean completed story chapter, not merely training count. Current code sets Chapter 2 at 3 stars and Chapter 3 on first arena win; immediate pass should move Chapter 2 transition to post-Rootshell and keep arena win inside Chapter 1.

## Immediate quest chain: Chapter 1

### Q01: "Meet Pip at the Ring"

- Trigger: first world load; existing default quest.
- Objective: walk to `training_ring`.
- Dialogue: Pip: "Big trails begin with tiny practice. Which strength does your friend want to try first?"
- Reward: opening one training panel; no stat granted.
- Save flags: `introPipMet` and `zone_training_ring_discovered`.
- Current mapping: `WORLD_ZONES`, `beginTraining`, HUD train button. Add quest definitions/flags; retain guiding target behavior.

### Q02: "Three Kinds of Brave"

- Objective: complete three total sessions, one each of Power, Agility, Heart. Current system allows any three; require one each only if onboarding clarity outweighs freedom. Recommended: show three optional stamps, award star per session, preserve player choice.
- Economy: 3 energy / 6 starting supplies exactly supports this. No free refills. If player spends extra supplies, Pip points to Mossback spar or trail finds.
- Dialogue beats: Power: "Push together." Agility: "Watch, then move." Heart: "Brave can be gentle."
- Reward: training stars; meadow gate opens; `trainingTutorialSeen`.
- Current mapping: `trainingProgression.ts` already caps energy/stat rank; `trainStat` and HUD expose costs/blocking. Do not add a grind currency.

### Q03: "Mossback's Listening Test"

- Objective: travel to `mossback_gate`, win friendly first spar.
- Teach: arena is rehearsal for open-world intent reading. Mossback calls out one readable counter before first turn.
- Dialogue: Mossback: "Strong feet help. Strong listening helps more."
- Reward: Meadow Crest, 15 XP, Stage 2 scale bump, 3 treats on later wins; existing values fit.
- Save flags: existing `meadowCrestEarned`, `arenaWins`; add `mossbackIntroSeen`.
- Current mapping: `beginBattle`, `useBattleMove`, `sparDifficulty`, HUD victory card, `BabyDino.tsx` crest visual.

### Q04: "Bring the Crest Home"

- Objective: return to Sunpatch fire.
- Scene: Juniper hangs crest on ranch sign; fire brightens; dino wears/has visible Meadow Crest. Luma notices Whispercap lantern has dimmed.
- Reward: permanently lit crest marker, Ranch Map board, objective to Whispercap.
- Save flags: existing `campCrestCelebrations` is currently repeatable; replace/extend with one-shot `meadowCrestCelebrated` so celebration cannot advance story repeatedly.
- Current mapping: `returnToRanch`, `celebrateCrestAtCamp`, `WorldProps.tsx` fire/lanterns, `HUD.tsx` Crest Cheer toast.

### Q05: "The Humming Grove"

- Objective: follow Luma's map ping to Whispercap; discover one singing mushroom and one trail find; choose to approach or avoid `boar_whispercap`.
- Combat teach: Bramble Boar is territorial. Its tell demonstrates `brace` against strike; retreat remains success for discovery quest.
- Dialogue: Luma: "A worried creature is not a bad creature. Give it space, or show it you can listen."
- Reward: 2 trail tokens/3 XP from current boar win; discovery still gives enough progress to reach guardian.
- Save flags: existing `discoveredZones`, `collectedItems`, `defeatedEnemyAt`; add `whispercapLandmarkFound`, `boarEncounterSeen`.
- Current mapping: `boar_whispercap` is already start-unlocked; `EnemyEncounterLayer`, `EnemyEncounterLayer.tsx`, `collectItem`, `discoverZone`.

### Q06: "Rootshell's Quiet"

- Objective: reach grove heart; win or safely resolve Elder Rootshell encounter. Narrative outcome: Rootshell yields once players prove they can read strike/guard/trick sequence, then opens root-lantern path.
- Boss placement correction: current `boss_rootshell` is crest-gated at Fernwood coordinates, so it cannot finish the promised first vertical slice. Immediate build: move spawn to Whispercap edge, change unlock to `trained` or a new `meadow_crest` gate, keep it permanent-defeat. Use current model/species; no new asset needed.
- Reward: **Grove Lantern** ranch interaction, `Rootshell Friend` badge, 14 treats, 18 XP, one growth bump. Grove lantern lights next map route.
- Save flags: existing `bossBadges`, `defeatedSpawnIds`, `defeatedEnemyAt`; add `groveLanternRestored` and `elderRootshellResolved`.
- Current mapping: `elder_rootshell`, `awardEncounter`, boss non-respawn condition in `EnemyEncounterLayer`, growth reward in `playWorldEncounterMove`.

### Q07: "A Brighter Map"

- Objective: return to fire and activate Grove Lantern.
- Scene: all Chapter 1 cast appears as short text sequence; companion does happy jump; Fernwood gate remains visible but locked, Prism and Silverrun become map teasers rather than accidental objectives.
- Reward: Chapter 2 unlock, Luma's route markers, optional Mossback spar loop.
- Save flags: `chapter1Complete`, `groveLanternCelebrated`.
- Current mapping: existing campfire event/directive and `WORLD_ZONES`; later add quest-state selector to HUD.

## Arena, ranch, and open-world connective tissue

1. Ranch is planning room, recovery place, and memory shelf. Each guardian returns one object: Meadow Crest sign, Grove Lantern, Prism wind-chime, Silverrun water trough, Fernwood trail map. `WorldProps.tsx` adds visibility based on flags.
2. Arena is optional mastery loop after first crest. Wins refill 3 supplies using existing `finishSpar`; it should never be required for a single story completion after Chapter 1.
3. Open world teaches consequence without punishment. Patrols can be avoided; retreat preserves progress; first clear pays normal reward; respawn enemies are practice/token sources. Existing `respawnAvailable` and soft defeat support this.
4. Portable camp remains expedition tool only. Ranch fire stays permanent hub. Later Fernwood upgrade lets camp restore one expedition comfort/action, never replace daily energy reset in `restTrainingDay`.

## Economy and progression rules

| Resource | Current behavior | Story rule |
|---|---|---|
| Energy | 3/day; training spends 1 | Only focused training spends it. Exploration, boss clears, and ranch scenes do not. |
| Supplies / treats | Start 6; training spends 1; spar/encounter add | Use for training, not story locks. First Chapter has enough starting supplies for required 3 stars. |
| Trail tokens | Enemy reward; unused by shown HUD | Later advanced rank purchase only; surface in HUD after first boar reward. Do not double-label as treats. |
| XP / growth | Actions, arena, encounters; boss grants growth | Growth should give visible scale/cosmetic and cap expansion, not raw story gate alone. |
| Crests / ranch relics | Meadow Crest exists | One-time keys and world-state souvenirs. Never consumed. |

Current technical conflict: `encounterProgress.buyTrainingRank()` calls `canTrainRank()`/`trainingCost()` from combat engine, while standard training uses supplies and energy. Keep Chapter 1 on standard training. Later either expose token rank purchases as separate "advanced coaching" or delete/consolidate unused path; never present two unexplained training currencies.

## Enemy and boss placement

| Area | Regular encounter use | Guardian use | Placement / logic |
|---|---|---|---|
| Whispercap | `bramble_boar`, start unlocked | Elder Rootshell, Chapter 1 end | One boar blocks shortcut; Rootshell at grove heart, permanent clear. |
| Prism Glen | `gloomwing`, trained/Chapter 2 | Shardhorn, future | Moths teach trick tells near crystals. Add boss only with unique crystal rule. |
| Silverrun | `bramble_boar` variant, trained/Chapter 2 | Comet Raptor | Boar near bank; Comet moves after stepping-stone discovery. |
| Fernwood | two `thornjaw`, Meadow Crest/Chapter 3 | Bramblemaw, future | Thornjaws patrol side routes; boss protects central trail, not another random aggro spawn. |

Bosses must be placed after player knows every readable move. Do not use mere high HP as difficulty. Elder Rootshell cycles all three current move types; Comet accelerates alternating tells later; Bramblemaw combines patrol positioning with a clear safe route.

## Companion growth and cosmetic beats

- Hatch: chosen color/name, follows near player.
- First star: unique short animation per chosen stat through existing `DinoDirective` keys.
- Meadow Crest: Stage 2 scale + crest visual already supported in `BabyDino.tsx`.
- Rootshell: add a leaf/lantern glow accessory or idle sparkle. Cosmetic must show at ranch and in field.
- Each later crest: one ranch keepsake plus one companion appearance beat; save cosmetic IDs, not only growth number.
- Growth stage caps training with current `trainingStatCap`; next boss/growth milestone expands cap. Avoid unbounded stat farming.

## Dialogue rules and sample moments

- One to two short lines before input. Never interrupt walking repeatedly.
- Repeat NPC interaction gives gameplay hint, not story dump.
- `Pip`: "Look at tell. Then choose move."
- `Mossback`: "You heard my stomp coming. That is teamwork."
- `Juniper`: "This crest says you came home together."
- `Luma`: "Map marks places you have truly seen."
- `Elder Rootshell`: "Roots drum. Little trailkeeper, can you listen?"
- Encounter UI already has enemy `tell` and battle log. Reuse it; add speaker/toast presentation later rather than separate dialogue engine first.

## First 10-15 minute playable vertical slice

| Time | Player action | Proof of loop | Immediate implementation anchors |
|---|---|---|---|
| 0:00-1:30 | Hatch, arrive at ranch, Pip points to ring | Companion + hub | Existing egg flow, `startNewGame`, HUD quest |
| 1:30-4:00 | Walk to ring; train three times | finite energy/supplies, three stat choices | `beginTraining`, `trainStat`, `trainingProgression.ts` |
| 4:00-6:30 | Follow guide to Mossback; win first spar | readable moves, Meadow Crest, Stage 2 | arena handlers, HUD overlay |
| 6:30-7:30 | Return fire; crest celebration | persistent ranch change | `celebrateCrestAtCamp`, `WorldProps.tsx` |
| 7:30-9:30 | Map-guide Whispercap; find landmark; meet/avoid boar | open-world choice, discovery, encounter reward | `WorldMap.tsx`, collectibles, `EnemyEncounterLayer` |
| 9:30-13:00 | Beat Elder Rootshell at grove heart | boss-like encounter, permanent state | reposition/gate `boss_rootshell`; existing encounter engine |
| 13:00-15:00 | Return ranch; light Grove Lantern; save/reload | visible reward and durable flags | persistence in `useGameStore.ts`, props gated by flags |

Acceptance: new save can complete every row without waiting for next real day, without needing repeat spar wins, and can reload after Rootshell to see defeated boss absent plus Grove Lantern present.

## Build sequence

### Immediate build

1. Add a small quest-definition/state layer (quest ID, phase, objective, completed flags) in `src/state/useGameStore.ts` or `src/systems/progression/quests.ts`; migrate existing plain `adventure.quest` text gradually.
2. Correct chapter and boss ordering: arena win remains Chapter 1; relocate/re-gate Rootshell to Whispercap; mark it permanent.
3. Add one-shot celebration flags and crest/lantern prop variants in `WorldProps.tsx`.
4. Make HUD quest card show objective-specific progress, not always `trainingStars / 3`; keep current training display intact.
5. Add minimum NPC dialogue cards/text triggers using existing events/HUD. No new dialogue framework or models required.
6. Verify save migration defaults for every new flag in `startNewGame`, `loadGame`, and `persistGame`.

### Later build

1. Add Chapter 2 Prism/Silverrun quests, Shardhorn, route-specific traversal rules, and Comet outcome.
2. Add companion cosmetic inventory and ranch relic board.
3. Add Fernwood expedition loop and portable-camp upgrade; preserve ranch as permanent fire/home.
4. Add future frontier zones only when each has unique traversal, enemy family, guardian, ranch consequence, and save flags.

## File map

| File | Responsibility under this plan |
|---|---|
| `docs/WORLD_GAMEPLAY_MASTER_PLAN.md` | Source gameplay promise; update later only if story names replace placeholders. |
| `src/state/useGameStore.ts` | Canonical quest phase/flags, chapter transitions, one-shot celebrations, save migration, rewards. |
| `src/world/worldZones.ts` | Zone unlock prerequisites, chapter-aware labels/route status. |
| `src/world/enemies/enemyCatalog.ts` | Enemy/boss placement, unlock conditions, reward identity, actual guardian roster. |
| `src/three/world/EnemyEncounterLayer.tsx` | Boss permanence and flag-aware visibility. |
| `src/systems/combat/encounterProgress.ts` | First-clear rewards/badges; future quest completion hook. |
| `src/systems/training/trainingProgression.ts` | Keep finite energy/supply/cap rules; chapter growth cap connection. |
| `src/systems/combat/encounterEngine.ts` | Intent tutorial and boss move sequences; no combat rewrite needed for Chapter 1. |
| `src/three/world/WorldProps.tsx` | Ranch relics, gate state, grove landmark/boss staging. |
| `src/ui/HUD.tsx` | Quest objective/progress, dialogue/toasts, resource clarity. |
| `src/ui/WorldMap.tsx` | Luma route markers, discovered-versus-unlocked language. |
| `src/three/characters/BabyDino.tsx` | Crest/accessory growth visibility. |

## Do not do yet

- Do not add procedural quest generators, branching morality, random loot tables, or combat penalties on loss.
- Do not require repeated daily resets, arena grinding, or optional patrol clears to advance core story.
- Do not make permanent ranch and portable camp same feature.
- Do not add new frontier lore before Chapter 1 reliably saves, reloads, and leaves visible world state.
