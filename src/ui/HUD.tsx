"use client";

import { useEffect, useRef, useState } from "react";
import { persistGame, useGameStore, type BattleMove } from "@/src/state/useGameStore";
import { RadialMenu } from "@/src/ui/RadialMenu";
import { AudioControls } from "@/src/ui/AudioControls";
import { WorldMap } from "@/src/ui/WorldMap";
import { sparDifficulty, trainingBlockReason } from "@/src/systems/training/trainingProgression";
import { EncounterPanel } from "@/src/ui/EncounterPanel";
import { ENEMY_SPAWNS, getEnemySpecies } from "@/src/world/enemies/enemyCatalog";
import { WORLD_ZONES } from "@/src/world/worldZones";

export function HUD() {
  const scene = useGameStore((s) => s.scene);
  const radialOpen = useGameStore((s) => s.radialMenuOpen);
  const recentEvents = useGameStore((s) => s.recentEvents);
  const lastEvent = recentEvents[recentEvents.length - 1];
  const [showHint, setShowHint] = useState(true);
  const adventure = useGameStore((s) => s.adventure);
  const playerPos = useGameStore((s) => s.playerPos);
  const beginTraining = useGameStore((s) => s.beginTraining);
  const trainStat = useGameStore((s) => s.trainStat);
  const beginBattle = useGameStore((s) => s.beginBattle);
  const useBattleMove = useGameStore((s) => s.useBattleMove);
  const finishBattleResolution = useGameStore((s) => s.finishBattleResolution);
  const returnToRanch = useGameStore((s) => s.returnToRanch);
  const progression = useGameStore((s) => s.progression);
  const training = progression.training;
  const collectibleCount = progression.collectedItems.length;
  const growthStage = useGameStore((s) => s.dinoStats.growthStage);
  const celebrateCrestAtCamp = useGameStore((s) => s.celebrateCrestAtCamp);
  const setDinoDirective = useGameStore((s) => s.setDinoDirective);
  const mapOpen = useGameStore((s) => s.mapOpen);
  const setMapOpen = useGameStore((s) => s.setMapOpen);
  const [battleLocked, setBattleLocked] = useState(false);
  const [victoryReady, setVictoryReady] = useState(false);
  const battleTimer = useRef<number | null>(null);
  const rival = sparDifficulty(progression.arenaWins, adventure);
  const activeEncounter = useGameStore((s) => s.activeEncounter);
  const activeEnemySpawnId = useGameStore((s) => s.activeEnemySpawnId);
  const playWorldEncounterMove = useGameStore((s) => s.playWorldEncounterMove);
  const retreatWorldEncounter = useGameStore((s) => s.retreatWorldEncounter);
  const closeWorldEncounter = useGameStore((s) => s.closeWorldEncounter);
  const encounterSpawn = ENEMY_SPAWNS.find((spawn) => spawn.id === activeEnemySpawnId);
  const encounterEnemy = encounterSpawn ? getEnemySpecies(encounterSpawn.speciesId) : null;
  const nearZone = (zoneId: string) => {
    const zone = WORLD_ZONES.find((candidate) => candidate.id === zoneId)!;
    return Math.hypot(playerPos.x - zone.position.x, playerPos.z - zone.position.z) <= zone.radius;
  };
  const nearTraining = nearZone("training_ring");
  const nearArena = nearZone("mossback_gate");
  const nearRanch = nearZone("sunpatch_ranch");

  useEffect(() => {
    setShowHint(true);
    const timer = window.setTimeout(() => setShowHint(false), 8000);
    return () => window.clearTimeout(timer);
  }, [scene]);

  useEffect(() => () => {
    if (battleTimer.current !== null) window.clearTimeout(battleTimer.current);
  }, []);

  useEffect(() => {
    setVictoryReady(false);
    if (adventure.mode === "victory") {
      const timer = window.setTimeout(() => setVictoryReady(true), 1250);
      return () => window.clearTimeout(timer);
    }
    if (adventure.mode === "resolving") {
      const timer = window.setTimeout(finishBattleResolution, 1650);
      return () => window.clearTimeout(timer);
    }
  }, [adventure.mode, finishBattleResolution]);

  const playBattleMove = (move: BattleMove) => {
    if (battleLocked) return;
    setBattleLocked(true);
    useBattleMove(move);
    if (battleTimer.current !== null) window.clearTimeout(battleTimer.current);
    battleTimer.current = window.setTimeout(() => setBattleLocked(false), 1650);
  };

  const celebrateAtCamp = () => {
    celebrateCrestAtCamp();
    window.setTimeout(() => setDinoDirective({ mood: "calm", animation: "idle", shouldSpeak: false }), 2600);
  };

  const claimAndReturn = () => {
    returnToRanch();
    persistGame();
  };

  return (
    <>
      <AudioControls />
      {scene === "world" && adventure.mode === "explore" && !mapOpen && !activeEncounter && <button className="map-open-button" onClick={() => setMapOpen(true)}><span>🗺️</span><small>Map</small></button>}
      <WorldMap />
      {scene === "world" && adventure.mode !== "battle" && adventure.mode !== "resolving" && adventure.mode !== "victory" && (
        <div className="adventure-hud">
          <div className="chapter-pill">CHAPTER {adventure.chapter} · THE MEADOW CREST</div>
          <div className="quest-card">
            <span className="quest-kicker">CURRENT QUEST</span>
            <strong>{adventure.quest}</strong>
            <small>Trail finds {collectibleCount}/5 · {training.supplies} treats</small>
            <div className="quest-progress"><span style={{ width: `${Math.min(100, adventure.trainingStars / 3 * 100)}%` }} /></div>
          </div>
        </div>
      )}

      {scene === "world" && adventure.mode === "explore" && !activeEncounter && (
        <div className="action-dock">
          <button className="dock-button training-button" onClick={beginTraining}><span>🏕️</span><b>{nearTraining ? "Train" : "Go Train"}</b><small>{nearTraining ? `${training.energy} energy · ${training.supplies} treats` : "Guide to ranch ring"}</small></button>
          <button className="dock-button battle-button" disabled={adventure.trainingStars < 3} onClick={beginBattle}><span>⚔️</span><b>{nearArena ? (progression.meadowCrestEarned ? "Spar" : "Battle") : "Go to Arena"}</b><small>{adventure.trainingStars < 3 ? `${adventure.trainingStars}/3 stars` : !nearArena ? "Guide to meadow gate" : progression.meadowCrestEarned ? `Tier ${rival.tier + 1} · earn treats` : "Ready"}</small></button>
          {progression.meadowCrestEarned && <button className="dock-button crest-button" onClick={celebrateAtCamp}><span>🏅</span><b>{nearRanch ? "Crest Cheer" : "Go Home"}</b><small>{nearRanch ? "Ranch fire" : "Guide to Sunpatch"}</small></button>}
        </div>
      )}

      {scene === "world" && activeEncounter && encounterEnemy && (
        <EncounterPanel
          encounter={activeEncounter}
          enemy={encounterEnemy}
          playerMaxHp={12 + adventure.heart * 2}
          onMove={playWorldEncounterMove}
          onRetreat={retreatWorldEncounter}
          onClose={closeWorldEncounter}
        />
      )}

      {scene === "world" && adventure.mode === "training" && (
        <div className="game-panel training-panel">
          <div className="panel-title"><span>TRAINING RING</span><strong>Help your dino grow!</strong></div>
          <div className="stat-row"><span>⭐ {adventure.trainingStars}/3</span><span>⚡ {training.energy}/3</span><span>🦴 {training.supplies}</span><span>💪 {adventure.power}</span><span>💨 {adventure.agility}</span><span>💚 {adventure.heart}</span></div>
          <div className="move-grid">
            <button disabled={!!trainingBlockReason(training, adventure.power, growthStage)} onClick={() => trainStat("power")}><span>🪵</span><b>Log Push</b><small>{trainingBlockReason(training, adventure.power, growthStage) ?? "Power +1 · costs 1 treat"}</small></button>
            <button disabled={!!trainingBlockReason(training, adventure.agility, growthStage)} onClick={() => trainStat("agility")}><span>🍃</span><b>Leaf Dash</b><small>{trainingBlockReason(training, adventure.agility, growthStage) ?? "Agility +1 · costs 1 treat"}</small></button>
            <button disabled={!!trainingBlockReason(training, adventure.heart, growthStage)} onClick={() => trainStat("heart")}><span>💚</span><b>Trust Jump</b><small>{trainingBlockReason(training, adventure.heart, growthStage) ?? "Heart +1 · costs 1 treat"}</small></button>
          </div>
          <button className="save-close" onClick={returnToRanch}>Leave training ring</button>
        </div>
      )}

      {scene === "world" && (adventure.mode === "battle" || adventure.mode === "resolving" || adventure.mode === "victory") && (
        <div className="battle-overlay">
          <div className="battle-banner">
            <small><i className="battle-live-dot" /> MEADOW CREST SHOWDOWN</small>
            <strong>{adventure.battleMessage}</strong>
          </div>
          <div className="battle-health">
            <div><b>Your Dino</b><span><i style={{ width: `${adventure.playerHp / (12 + adventure.heart) * 100}%` }} /></span><small>{adventure.playerHp} HP</small></div>
            <div><b>{rival.label}</b><span><i className="rival-hp" style={{ width: `${adventure.rivalHp / rival.hp * 100}%` }} /></span><small>{adventure.rivalHp} HP</small></div>
          </div>
          {adventure.mode === "battle" ? <div className="battle-moves">
            <button disabled={battleLocked} onClick={() => playBattleMove("stomp")}><b>☄️ Comet Stomp</b><small>Ground-shaking power</small></button>
            <button disabled={battleLocked} onClick={() => playBattleMove("tail_whip")}><b>🍃 Leaf Whirl</b><small>Fast forest strike</small></button>
            <button disabled={battleLocked} onClick={() => playBattleMove("brace")}><b>🛡️ Brave Brace</b><small>Hold strong together</small></button>
          </div> : adventure.mode === "victory" ? (
            <div className="victory-reward">
              <div className="crest-reveal"><span>{progression.arenaWins === 1 ? "🏅" : "🦴"}</span><div><small>{progression.arenaWins === 1 ? "REWARD UNLOCKED" : "SPAR REWARD"}</small><strong>{progression.arenaWins === 1 ? "Meadow Crest" : "3 Training Treats"}</strong><b>{progression.arenaWins === 1 ? `Companion grew to stage ${growthStage}` : `${training.sparWins} spar wins · next rival grows stronger`}</b></div></div>
            <button className="victory-button" disabled={!victoryReady} onClick={claimAndReturn}>
              {victoryReady ? (progression.arenaWins === 1 ? "Claim the Meadow Crest ✨" : "Pack treats and return") : "Celebrating victory…"}
            </button>
            </div>
          ) : (
            <div className="battle-resolving">Mossback helps your dino back up…</div>
          )}
        </div>
      )}
      {scene === "world" && lastEvent?.type === "collectible_found" && (
        <div className="discovery-toast" key={`${lastEvent.id}-${lastEvent.t}`}>
          <span>✨</span><div><strong>{lastEvent.id.replaceAll("_", " ")}</strong>{lastEvent.treats && <small>+{lastEvent.treats} treat · +{lastEvent.xp} XP</small>}</div>
        </div>
      )}
      {scene === "world" && lastEvent?.type === "camp_crest_celebration" && (
        <div className="reward-toast" key={lastEvent.t}>
          <span>🏅</span><div><small>RANCH INTERACTION</small><strong>Crest Cheer!</strong></div>
        </div>
      )}

      {showHint && scene !== "egg" && adventure.mode === "explore" && (
        <div className="play-hint">
          {scene === "hatching" ? "Your new friend is hatching!" : "Tap the path to explore • Tap sparkly things!"}
        </div>
      )}

      {radialOpen && <RadialMenu />}
    </>
  );
}
