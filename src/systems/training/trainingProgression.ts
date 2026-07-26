export type TrainableStat = "power" | "agility" | "heart";

export type TrainingLedger = {
  energy: number;
  supplies: number;
  sessions: number;
  restCycle: number;
  dayStamp: string;
  sparWins: number;
  sparLosses: number;
};

export const TRAINING_ENERGY_MAX = 3;
export const TRAINING_STARTING_SUPPLIES = 6;

export const DEFAULT_TRAINING_LEDGER: TrainingLedger = {
  energy: TRAINING_ENERGY_MAX,
  supplies: TRAINING_STARTING_SUPPLIES,
  sessions: 0,
  restCycle: 0,
  dayStamp: "",
  sparWins: 0,
  sparLosses: 0,
};

export function trainingDayStamp(now = new Date()) {
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function normalizeTrainingLedger(saved?: Partial<TrainingLedger>, today = trainingDayStamp()): TrainingLedger {
  const newDay = !!saved?.dayStamp && saved.dayStamp !== today;
  return {
    energy: newDay ? TRAINING_ENERGY_MAX : Math.max(0, Math.min(TRAINING_ENERGY_MAX, saved?.energy ?? TRAINING_ENERGY_MAX)),
    supplies: Math.max(0, saved?.supplies ?? TRAINING_STARTING_SUPPLIES),
    sessions: Math.max(0, saved?.sessions ?? 0),
    restCycle: Math.max(0, saved?.restCycle ?? 0),
    dayStamp: today,
    sparWins: Math.max(0, saved?.sparWins ?? 0),
    sparLosses: Math.max(0, saved?.sparLosses ?? 0),
  };
}

export function trainingStatCap(growthStage: number) {
  return 3 + Math.max(1, growthStage) * 2;
}

export function trainingBlockReason(ledger: TrainingLedger, statValue: number, growthStage: number) {
  if (ledger.energy <= 0) return "Dino tired. Rest until morning.";
  if (ledger.supplies <= 0) return "Need training treats. Win a spar to restock.";
  if (statValue >= trainingStatCap(growthStage)) return "Current growth stage mastered.";
  return null;
}

export function spendTrainingSession(ledger: TrainingLedger): TrainingLedger {
  return {
    ...ledger,
    energy: Math.max(0, ledger.energy - 1),
    supplies: Math.max(0, ledger.supplies - 1),
    sessions: ledger.sessions + 1,
  };
}

export function restTrainingDay(ledger: TrainingLedger, dayStamp = trainingDayStamp()): TrainingLedger {
  if (ledger.dayStamp === dayStamp) return ledger;
  return {
    ...ledger,
    energy: TRAINING_ENERGY_MAX,
    restCycle: ledger.restCycle + 1,
    dayStamp,
  };
}

export function finishSpar(ledger: TrainingLedger, won: boolean): TrainingLedger {
  return {
    ...ledger,
    supplies: ledger.supplies + (won ? 3 : 1),
    sparWins: ledger.sparWins + (won ? 1 : 0),
    sparLosses: ledger.sparLosses + (won ? 0 : 1),
  };
}

export function sparDifficulty(arenaWins: number, stats: { power: number; agility: number; heart: number }) {
  const trained = Math.floor((stats.power + stats.agility + stats.heart - 3) / 3);
  const tier = Math.max(0, arenaWins + trained);
  return {
    tier,
    hp: Math.min(34, 12 + tier * 2),
    damage: Math.min(8, 3 + Math.floor(tier / 2)),
    label: tier < 2 ? "Mossback Rookie" : tier < 5 ? "Mossback Ranger" : "Mossback Champion",
  };
}
