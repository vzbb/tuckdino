import type { EnemyMoveKind, EnemySpecies, EncounterReward } from "@/src/world/enemies/enemyCatalog";

export type CompanionMove = "stomp" | "tail_whip" | "brace";
export type EncounterOutcome = "active" | "won" | "retreated";

export type CompanionBattleStats = {
  power: number;
  agility: number;
  heart: number;
};

export type EncounterState = {
  enemyId: string;
  playerHp: number;
  enemyHp: number;
  enemyGuard: number;
  playerGuard: number;
  turn: number;
  enemyIntent: EnemyMoveKind;
  enemyTell: string;
  outcome: EncounterOutcome;
  log: string[];
};

export type EncounterTurnResult = {
  state: EncounterState;
  reward?: EncounterReward;
};

const PLAYER_MOVE_KIND: Record<CompanionMove, EnemyMoveKind> = {
  stomp: "strike",
  tail_whip: "trick",
  brace: "guard",
};

// Rock-paper-scissors readability: strike breaks trick, trick slips past guard,
// guard absorbs strike. Correct reads earn a large advantage.
function matchup(attacker: EnemyMoveKind, defender: EnemyMoveKind) {
  if (
    (attacker === "strike" && defender === "trick") ||
    (attacker === "trick" && defender === "guard") ||
    (attacker === "guard" && defender === "strike")
  ) return 1;
  if (attacker === defender) return 0;
  return -1;
}

function enemyMoveForTurn(enemy: EnemySpecies, turn: number) {
  return enemy.moves[turn % enemy.moves.length];
}

export function startEncounter(enemy: EnemySpecies, stats: CompanionBattleStats): EncounterState {
  const first = enemyMoveForTurn(enemy, 0);
  return {
    enemyId: enemy.id,
    playerHp: 12 + stats.heart * 2,
    enemyHp: enemy.maxHp,
    enemyGuard: 0,
    playerGuard: 0,
    turn: 0,
    enemyIntent: first.kind,
    enemyTell: first.tell,
    outcome: "active",
    log: [`${enemy.name} ${first.tell}.`],
  };
}

export function resolveEncounterTurn(
  current: EncounterState,
  enemy: EnemySpecies,
  stats: CompanionBattleStats,
  playerMove: CompanionMove,
): EncounterTurnResult {
  if (current.outcome !== "active") return { state: current };

  const playerKind = PLAYER_MOVE_KIND[playerMove];
  const enemyMove = enemyMoveForTurn(enemy, current.turn);
  const advantage = matchup(playerKind, enemyMove.kind);
  const playerBase = playerMove === "stomp" ? stats.power : playerMove === "tail_whip" ? stats.agility : stats.heart;
  const playerGuard = playerMove === "brace" ? 2 + Math.floor(stats.heart / 2) : 0;
  const enemyGuard = enemyMove.kind === "guard" ? enemyMove.power : 0;
  const playerDamage = playerMove === "brace" ? 0 : Math.max(1, 2 + Math.floor(playerBase / 2) + advantage * 2 - enemyGuard);
  const enemyDamage = enemyMove.kind === "guard"
    ? 0
    : Math.max(0, enemyMove.power - playerGuard - advantage * 2);

  const enemyHp = Math.max(0, current.enemyHp - playerDamage);
  const playerHp = Math.max(1, current.playerHp - enemyDamage); // soft defeat: encounter ends, companion never harmed.
  const won = enemyHp === 0;
  const exhausted = !won && current.playerHp - enemyDamage <= 0;
  const nextTurn = current.turn + 1;
  const nextMove = enemyMoveForTurn(enemy, nextTurn);
  const read = advantage > 0 ? "Perfect read!" : advantage < 0 ? "Tough matchup." : "Even exchange.";
  const log = [
    ...current.log,
    `${read} ${playerDamage ? `${enemy.name} loses ${playerDamage} courage.` : "You hold steady."}`,
    ...(enemyDamage ? [`Your team loses ${enemyDamage} stamina.`] : []),
  ].slice(-6);

  if (won) {
    return {
      state: { ...current, playerHp, enemyHp, turn: nextTurn, outcome: "won", log: [...log, `${enemy.name} yields and clears the trail!`] },
      reward: enemy.reward,
    };
  }
  if (exhausted) {
    return {
      state: { ...current, playerHp: 1, enemyHp, turn: nextTurn, outcome: "retreated", log: [...log, "Your team retreats safely to catch its breath."] },
    };
  }
  return {
    state: {
      ...current,
      playerHp,
      enemyHp,
      playerGuard,
      enemyGuard,
      turn: nextTurn,
      enemyIntent: nextMove.kind,
      enemyTell: nextMove.tell,
      log: [...log, `${enemy.name} ${nextMove.tell}.`].slice(-6),
    },
  };
}

export function trainingCost(currentRank: number) {
  return 3 + currentRank * 2;
}

export function canTrainRank(currentRank: number, trailTokens: number, chapter: number) {
  const chapterCap = 2 + chapter * 2;
  return currentRank < chapterCap && trailTokens >= trainingCost(currentRank);
}
