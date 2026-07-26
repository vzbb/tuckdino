"use client";

import type { CompanionMove, EncounterState } from "@/src/systems/combat/encounterEngine";
import type { EnemySpecies } from "@/src/world/enemies/enemyCatalog";
import styles from "./EncounterPanel.module.css";

export type EncounterPanelProps = {
  encounter: EncounterState;
  enemy: EnemySpecies;
  playerMaxHp: number;
  busy?: boolean;
  onMove: (move: CompanionMove) => void;
  onRetreat: () => void;
  onClose: () => void;
};

const MOVES: Array<{ id: CompanionMove; icon: string; name: string; hint: string }> = [
  { id: "stomp", icon: "💥", name: "Comet Stomp", hint: "Strike beats trick" },
  { id: "tail_whip", icon: "🍃", name: "Leaf Whirl", hint: "Trick beats guard" },
  { id: "brace", icon: "🛡️", name: "Brave Brace", hint: "Guard beats strike" },
];

export function EncounterPanel({ encounter, enemy, playerMaxHp, busy = false, onMove, onRetreat, onClose }: EncounterPanelProps) {
  const active = encounter.outcome === "active";
  const playerPercent = Math.max(0, Math.min(100, encounter.playerHp / playerMaxHp * 100));
  const enemyPercent = Math.max(0, Math.min(100, encounter.enemyHp / enemy.maxHp * 100));

  return (
    <section className={styles.panel} role="region" aria-label={`Challenge ${enemy.name}`}>
      <header className={styles.header}>
        <small><span className={styles.liveDot} />{enemy.temperament === "boss" ? "WILD GUARDIAN" : "TRAIL CHALLENGE"}</small>
        <strong>{active ? enemy.name : encounter.log.at(-1)}</strong>
        {active && <span className={styles.tell}>{encounter.enemyTell}</span>}
      </header>

      <div className={styles.health}>
        <div><b>Your Team</b><b>{encounter.playerHp}/{playerMaxHp}</b><span><i style={{ width: `${playerPercent}%` }} /></span></div>
        <div><b>{enemy.name}</b><b>{encounter.enemyHp}/{enemy.maxHp}</b><span><i className={styles.rivalHp} style={{ width: `${enemyPercent}%` }} /></span></div>
      </div>

      {active ? <>
        <p className={styles.tip}>Choose counter. Miss costs stamina.</p>
        <div className={styles.moves}>
          {MOVES.map((move) => <button key={move.id} type="button" disabled={busy} onClick={() => onMove(move.id)}><span>{move.icon} <b>{move.name}</b></span><small>{move.hint}</small></button>)}
        </div>
        <button type="button" disabled={busy} onClick={onRetreat} className={styles.retreat}>Retreat safely</button>
      </> : <button type="button" className={styles.result} onClick={onClose}>
        {encounter.outcome === "won" ? `Trail clear! +${enemy.reward.trailTokens} tokens · +${enemy.reward.companionXp} companion XP` : "Rest, train, and return"}
      </button>}

      <div className={styles.log} aria-live="polite">{encounter.log.slice(-2).join(" ")}</div>
    </section>
  );
}
