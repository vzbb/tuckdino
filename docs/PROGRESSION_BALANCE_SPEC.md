# Tuckdino Progression Balance Specification

## Goal

Preserve a gentle, finite loop:

`Sunpatch Ranch care/rest -> training ring -> Meadow Arena -> explore trails -> return to ranch`

No enemy dies. A battle win means the creature yields, befriends the team, or clears a trail. A loss or retreat means a safe return and a chance to learn; no XP, items, cosmetics, or permanent stat loss are removed.

This specification replaces the current unbounded XP/growth behavior and connects the existing `trailTokens`, training-rank purchase helpers, treats, arena, and world encounters into one economy.

## Progression at a glance

| Beat | Required state | Main reward | Opens |
| --- | --- | --- | --- |
| Hatchling trail | Level 1, three starting treats | First training session | Training Ring |
| Training trial | Earn 3 training stars | Level 2 target stats | Meadow Arena |
| Meadow Crest | Defeat Mossback Rookie | Meadow Crest, 5 treats, 10 tokens | Fernwood and trained trail spawns |
| Fernwood path | Clear Boar and Gloomwing first clears | Tokens and XP | Thornjaw challenges |
| Old Grove | Clear two Thornjaw spawns | Rootshell badge | Rootshell guardian |
| Silverrun finale | Rootshell badge plus Level 7 | Comet badge, final cosmetic | Champion spar loop |

Training stars are tutorial milestones only. They remain `0..3`; they must not be used as an unlimited power gate after Meadow Crest.

## Finite companion levels and cosmetic growth

`dinoStats.xp` is lifetime XP, capped at **900**. `level` is derived from XP; never increment `growthStage` directly from a win. Keep `growthStage` as a compatibility mirror of cosmetic stage until migration completes.

| Level | Total XP | Cosmetic stage | Visible change | Stat rank cap |
| --- | ---: | --- | --- | ---: |
| 1 | 0 | Hatchling | current small model | 2 |
| 2 | 35 | Sprout | neckerchief color accent | 3 |
| 3 | 90 | Trail Scout | small saddlebag | 4 |
| 4 | 170 | Meadow Friend | Meadow Crest on saddlebag | 5 |
| 5 | 280 | Fernwood Ranger | leaf trail charm | 6 |
| 6 | 420 | Grove Guardian | mossy leg-band accent | 7 |
| 7 | 590 | Silverrun Star | silver tail ribbon | 8 |
| 8 | 760 | Valley Champion | star lantern/saddle pennant | 9 |
| 9 | 900 | Sunpatch Legend | all earned accents, no further size change | 10 |

Cosmetic stage changes once per listed milestone. Model scale is cosmetic only: `1.00, 1.03, 1.06, 1.09, 1.12, 1.15, 1.18, 1.21, 1.24`. Do not grant a free stage from boss or first-arena victory. At level 9, XP remains at 900 and all later XP awards become zero.

## Training economy

### Daily ledger

| Rule | Value |
| --- | ---: |
| Starting treats | 6 |
| Treat wallet cap | 20 |
| Daily energy maximum | 3 |
| Daily energy refresh | Local calendar day, first store hydration/action after midnight |
| Training session cost | 1 energy + 1 treat |
| Training XP | 4 XP, only first 3 sessions each day |
| Training stat gain | +1 selected stat, only if below level cap |
| Daily training sessions | At most 3, because energy does not refill except on a new day |
| Care-action XP | 0; care raises care meters only |
| Optional ranch play bonus | 1 XP once/day, after all three care meters are at least 0.75 |

Every stat (`power`, `agility`, `heart`) begins at 1. Each stat may reach the cap for current level. This makes a newly unlocked level provide room for one meaningful training choice, not a requirement to max all three immediately.

Training Ring copy must say both costs and cap: `Power +1 — 1 energy, 1 treat` or `Reach Level 4 to train further`.

### Treat sources and sinks

| Source | Amount | Limit | Purpose |
| --- | ---: | --- | --- |
| Five fixed starting trail finds | 1 treat each | once/save | Early safety net |
| First Meadow Crest win | 5 treats | once/save | Funds next two days |
| Arena spar win | 2 treats | first 2 wins/day; then 0 | Repeatable training fuel |
| Arena spar loss | 1 treat | first loss/day only | Soft recovery, no farming |
| Boar/Gloomwing first clear | 1 treat | once/spawn | Exploration support |
| Thornjaw first clear | 2 treats | once/spawn | Midgame support |
| Boss first clear | 3 treats | once/boss | Celebration/recovery |
| Care feed action | costs 1 treat | hunger below 0.85 only | Treat sink; no XP |
| Training session | costs 1 treat | daily energy gate | Main sink |

All gains clamp at 20. Respawn victories grant tokens/XP subject to encounter limits, but never treats. This prevents waiting beside one spawn for an infinite training supply.

## Token economy and stat-rank purchase

`trailTokens` are a second, finite-rate currency. They buy advanced rank permission, then a Training Ring session supplies the actual +1 stat. Existing `buyTrainingRank` must become reachable from the store/UI.

| Next rank | Token cost | Required level | Notes |
| --- | ---: | ---: | --- |
| 2 | 5 | 1 | First upgrade after early Boar/Gloomwing exploration |
| 3 | 8 | 2 | Before/around Meadow Crest |
| 4 | 12 | 3 | Fernwood entry |
| 5 | 16 | 4 | Meadow Friend |
| 6 | 21 | 5 | Fernwood Ranger |
| 7 | 27 | 6 | Grove Guardian |
| 8 | 34 | 7 | Silverrun Star |
| 9 | 42 | 8 | Champion |
| 10 | 51 | 9 | Final cap |

The current `trainingCost(currentRank) = 3 + currentRank * 2` is too cheap and `buyTrainingRank` has no caller. Replace it with this table, track `rankUnlocked` separately per stat, and make a training session require both `stat < rankUnlocked` and `stat < levelCap`. Initial `rankUnlocked` is 1 for all stats. This gives tokens a clear use without allowing repeated respawns to outpace chapters.

## Combat curve

### Common battle formula

Use current readable counter triangle: Strike beats Trick, Trick beats Guard, Guard beats Strike. Keep enemy intent visible before player chooses.

* Player max stamina: `12 + 2 * heart`.
* Damage on a correct read: `3 + floor(relevantStat / 2)`.
* Even read: `2 + floor(relevantStat / 2)`.
* Wrong read: `max(1, 1 + floor(relevantStat / 2) - enemyGuard)`; player receives enemy move damage normally.
* Guard grants `2 + floor(heart / 2)` protection and deals no damage.
* Enemy HP and damage below assume target player ranks roughly equal to listed requirement. Do not dynamically multiply enemy stats by number of wins.

### Open-world roster

| Enemy | Unlock / intended level | HP | Damage | Reward first clear | Later win reward | Respawn |
| --- | --- | ---: | ---: | --- | --- | --- |
| Bramble Boar (2 spawns) | Start / L1 | 9 | 2 | 2 tokens, 6 XP, 1 treat | 1 token, 2 XP; max 2 later wins/day total | 5 min |
| Gloomwing | 3 training stars / L2 | 12 | 3 | 3 tokens, 9 XP, 1 treat | 1 token, 2 XP; max 2 later wins/day total | 8 min |
| Thornjaw (2 spawns) | Meadow Crest / L4 | 17 | 4 | 5 tokens, 14 XP, 2 treats | 2 tokens, 3 XP; max 2 later wins/day total | 12 min |
| Elder Rootshell | both Thornjaw first clears, L6 | 30 | 5 | 18 tokens, 45 XP, 3 treats, Rootshell Friend badge | no material reward; replay once/day for practice | daily |
| Comet Raptor | Rootshell badge, L7 | 36 | 6 | 25 tokens, 60 XP, 3 treats, Silverrun Star badge | 3 tokens, 5 XP; once/day | daily |

Bosses appear only until their first clear, except an explicit ranch/guardian replay button after clear. The current layer permanently hides bosses after any defeat timestamp; change that condition to `bossBadges.includes(badge)` so a retreat does not erase a boss.

### Encounter rewards and anti-grind accounting

Track each spawn's `firstClear`, `rewardDayStamp`, and `repeatRewardsToday`. A win always increments a friendly victory journal, but only a rewarded win affects currency/XP.

* First clear: listed full reward.
* Standard repeat: listed later reward only while `repeatRewardsToday < 2` across common enemies; then `0 tokens, 0 XP, 0 treats` and a friendly `Practice complete for today` message.
* Boss replay: only listed once/day reward; no badge duplication.
* Defeated spawn visual respawns after listed time, but exhausted reward caps do not reset with respawn.
* Retreat/loss cannot reset a first-clear reward and cannot produce supplies.

## Meadow Arena: ranch-to-arena loop

Meadow Arena remains friendly, repeatable, and closest reliable way back into training. It is never a world-boss gate after the Crest.

| Arena tier | Unlock | Rival HP / damage | Win reward | Loss reward | Frequency |
| --- | --- | --- | --- | --- | --- |
| Mossback Rookie | 3 stars, before Crest | 14 / 3 | Meadow Crest, 25 XP, 5 treats, 10 tokens | 1 treat, return to ranch | one story win |
| Mossback Ranger | Crest, L3+ | 18 / 4 | 12 XP, 2 treats, 3 tokens | 1 treat, return to ranch | 2 rewarded wins/day |
| Mossback Champion | Rootshell badge, L6+ | 24 / 5 | 18 XP, 2 treats, 5 tokens | 1 treat, return to ranch | 1 rewarded win/day |

After daily rewards are spent, arena still supports practice but gives no XP/treats/tokens. Choose tier by story badge and level, not `arenaWins + average stats`; current scaling eventually makes all repeated wins increase difficulty and reward indefinitely.

### Loss, retreat, and recovery

| Outcome | Result |
| --- | --- |
| World retreat button | Close encounter, return player target to nearest safe trail/ranch, no reward, no penalty |
| World stamina exhausted | Same as retreat; show one counter tip based on last enemy intent |
| Arena loss | Return to ranch after result, +1 consolation treat once/day, no XP/tokens |
| Any loss | Keep earned XP, treats, tokens, ranks, badges, and cosmetics; never decrease stats or friendship |
| Boss retreat | Boss remains available; only first clear changes its badge flag |

## Persistent save flags

Persist this under `progression` and normalize old saves. Timestamp fields use local `YYYY-M-D` format already used by training.

```ts
type ProgressionV2 = {
  level: number;                         // derived/cached 1..9
  xp: number;                            // 0..900; migrate dinoStats.xp once
  cosmeticStage: number;                 // 1..9, derived from level
  statRanks: { power: number; agility: number; heart: number }; // purchased 1..10
  training: TrainingLedger & {
    dailyCareXpAwarded: boolean;
    arenaRewardDayStamp: string;
    arenaRewardWinsToday: number;
    arenaLossTreatDayStamp: string;
  };
  encounters: EncounterProgress & {
    firstClearSpawnIds: string[];
    repeatRewardDayStamp: string;
    repeatRewardsToday: number;
    bossBadges: string[];
  };
  meadowCrestEarned: boolean;
  campCrestCelebrations: number;
  collectedItems: string[];
  defeatedEnemyAt: Record<string, number>; // visual respawn only
};
```

Migration rules: cap legacy XP at 900, derive level/stage from XP, retain legacy `arenaWins`, retain all collected items and badges, set ranks to `max(1, legacy stat value)` capped at 10, and set missing daily counters to zero/current day. Do not use client clock to grant unlimited reward refresh after manual clock changes; accept the local daily reset as a child-friendly soft limit, and retain per-session monotonic `lastRewardAt` for a minimum 20-hour reward interval if clock tampering becomes material.

## Immediate code changes by file

| File | Required change |
| --- | --- |
| `src/state/useGameStore.ts` | Add level/ranks/daily reward fields; centralize `awardXp`, `awardTreats`, and daily normalization; remove XP from pet/bathe/play/camp; make feed cost a treat; stop direct `growthStage + 1` on boss/crest; call rank purchase before training; route loss/retreat to safe target; persist all new fields. |
| `src/systems/training/trainingProgression.ts` | Add XP thresholds, level/cosmetic helpers, wallet cap, rank-cost table, `statRank` gating, daily arena/care counters; replace dynamic `sparDifficulty` with fixed tier selector. |
| `src/systems/combat/encounterProgress.ts` | Distinguish first-clear versus repeat rewards, track per-day repeat cap and boss clear flags; make `buyTrainingRank` use per-stat ranks and level requirements. |
| `src/systems/combat/encounterEngine.ts` | Keep counter readability; tune damage to spec, remove unused generic rank-cost functions after moving them to training progression, return exhaustion metadata for counter tip. |
| `src/world/enemies/enemyCatalog.ts` | Apply roster HP/damage/rewards/respawns/unlock prerequisites; add badge/level/first-clear requirements to spawn metadata. |
| `src/three/world/EnemyEncounterLayer.tsx` | Gate spawns by level, badges, and first clears; hide common enemies only for respawn timer; hide bosses only after badge clear, not after retreat. |
| `src/ui/EncounterPanel.tsx` | Display first/repeat reward state, daily practice cap, safe-retreat result, and final counter tip. |
| `src/ui/HUD.tsx` | Show level/XP, treats `current/20`, energy, rank unlock affordance, arena tier/reward availability, and ranch-return recovery copy. Remove fixed `Trail finds n/5` once more collectibles exist. |
| `src/three/world/Collectibles.tsx` | Keep five early finds but label them as once-only trail supplies; each grants 1 treat, no XP. |
| `src/world/worldZones.ts` and `src/ui/WorldMap.tsx` | Show level/badge lock reasons for Fernwood, Old Grove, and Silverrun paths instead of only star/crest locks. |
| `src/three/characters/BabyDino.tsx` or `DinosaurModel.tsx` | Render cosmetic accessories/color accents by `cosmeticStage`; scale only from stage helper. |

## Acceptance checks

1. Fresh save can complete 3 training sessions on day one without a respawn farm.
2. Missing a counter or losing never deletes currency/progress and always returns safely.
3. Repeating one common spawn cannot yield more than two rewarded repeat wins/day.
4. A boss that was retreated from remains challengeable; a cleared boss awards badge only once.
5. Companion reaches level 9/900 XP and no further stat or scale growth is possible.
6. Arena keeps offering friendly practice after Crest, but only listed daily rewards.
7. Every permanent unlock is explainable in HUD/map: level, badge, Crest, or first-clear condition.
