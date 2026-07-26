"use client";

import { useEffect, useRef, useState } from "react";
import { persistGame, useGameStore, type BattleMove } from "@/src/state/useGameStore";
import { RadialMenu } from "@/src/ui/RadialMenu";
import { AudioControls } from "@/src/ui/AudioControls";

export function HUD() {
  const scene = useGameStore((s) => s.scene);
  const radialOpen = useGameStore((s) => s.radialMenuOpen);
  const recentEvents = useGameStore((s) => s.recentEvents);
  const lastEvent = recentEvents[recentEvents.length - 1];
  const [showHint, setShowHint] = useState(true);
  const adventure = useGameStore((s) => s.adventure);
  const beginTraining = useGameStore((s) => s.beginTraining);
  const trainStat = useGameStore((s) => s.trainStat);
  const beginBattle = useGameStore((s) => s.beginBattle);
  const useBattleMove = useGameStore((s) => s.useBattleMove);
  const finishBattleResolution = useGameStore((s) => s.finishBattleResolution);
  const returnToRanch = useGameStore((s) => s.returnToRanch);
  const progression = useGameStore((s) => s.progression);
  const growthStage = useGameStore((s) => s.dinoStats.growthStage);
  const celebrateCrestAtCamp = useGameStore((s) => s.celebrateCrestAtCamp);
  const setDinoDirective = useGameStore((s) => s.setDinoDirective);
  const [battleLocked, setBattleLocked] = useState(false);
  const [victoryReady, setVictoryReady] = useState(false);
  const battleTimer = useRef<number | null>(null);

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
      {scene === "world" && adventure.mode !== "battle" && adventure.mode !== "resolving" && adventure.mode !== "victory" && (
        <div className="adventure-hud">
          <div className="chapter-pill">CHAPTER {adventure.chapter} · THE MEADOW CREST</div>
          <div className="quest-card">
            <span className="quest-kicker">CURRENT QUEST</span>
            <strong>{adventure.quest}</strong>
            <div className="quest-progress"><span style={{ width: `${Math.min(100, adventure.trainingStars / 3 * 100)}%` }} /></div>
          </div>
        </div>
      )}

      {scene === "world" && adventure.mode === "explore" && (
        <div className="action-dock">
          <button className="dock-button training-button" onClick={beginTraining}><span>🏕️</span><b>Train</b><small>Ranch ring</small></button>
          <button className="dock-button battle-button" disabled={adventure.trainingStars < 3} onClick={beginBattle}><span>⚔️</span><b>Battle</b><small>{adventure.trainingStars < 3 ? `${adventure.trainingStars}/3 stars` : "Meadow gate"}</small></button>
          {progression.meadowCrestEarned && <button className="dock-button crest-button" onClick={celebrateAtCamp}><span>🏅</span><b>Crest Cheer</b><small>Ranch fire</small></button>}
        </div>
      )}

      {scene === "world" && adventure.mode === "training" && (
        <div className="game-panel training-panel">
          <div className="panel-title"><span>TRAINING RING</span><strong>Help your dino grow!</strong></div>
          <div className="stat-row"><span>⭐ {adventure.trainingStars}/3</span><span>💪 {adventure.power}</span><span>💨 {adventure.agility}</span><span>💚 {adventure.heart}</span></div>
          <div className="move-grid">
            <button onClick={() => trainStat("power")}><span>🪵</span><b>Log Push</b><small>Power +1</small></button>
            <button onClick={() => trainStat("agility")}><span>🍃</span><b>Leaf Dash</b><small>Agility +1</small></button>
            <button onClick={() => trainStat("heart")}><span>💚</span><b>Trust Jump</b><small>Heart +1</small></button>
          </div>
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
            <div><b>Mossback</b><span><i className="rival-hp" style={{ width: `${adventure.rivalHp / 12 * 100}%` }} /></span><small>{adventure.rivalHp} HP</small></div>
          </div>
          {adventure.mode === "battle" ? <div className="battle-moves">
            <button disabled={battleLocked} onClick={() => playBattleMove("stomp")}><b>☄️ Comet Stomp</b><small>Ground-shaking power</small></button>
            <button disabled={battleLocked} onClick={() => playBattleMove("tail_whip")}><b>🍃 Leaf Whirl</b><small>Fast forest strike</small></button>
            <button disabled={battleLocked} onClick={() => playBattleMove("brace")}><b>🛡️ Brave Brace</b><small>Hold strong together</small></button>
          </div> : adventure.mode === "victory" ? (
            <div className="victory-reward">
              <div className="crest-reveal"><span>🏅</span><div><small>REWARD UNLOCKED</small><strong>Meadow Crest</strong><b>Companion grew to stage {growthStage}</b></div></div>
            <button className="victory-button" disabled={!victoryReady} onClick={claimAndReturn}>
              {victoryReady ? "Claim the Meadow Crest ✨" : "The Meadow Crest is awakening…"}
            </button>
            </div>
          ) : (
            <div className="battle-resolving">Mossback helps your dino back up…</div>
          )}
        </div>
      )}
      {scene === "world" && lastEvent?.type === "collectible_found" && (
        <div className="discovery-toast" key={`${lastEvent.id}-${lastEvent.t}`}>
          <span>✨</span><strong>{lastEvent.id.replaceAll("_", " ")}</strong>
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
