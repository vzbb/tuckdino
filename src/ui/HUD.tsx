"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/src/state/useGameStore";
import { RadialMenu } from "@/src/ui/RadialMenu";

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
  const returnToRanch = useGameStore((s) => s.returnToRanch);

  useEffect(() => {
    setShowHint(true);
    const timer = window.setTimeout(() => setShowHint(false), 8000);
    return () => window.clearTimeout(timer);
  }, [scene]);

  return (
    <>
      {scene === "world" && (
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

      {scene === "world" && (adventure.mode === "battle" || adventure.mode === "victory") && (
        <div className="battle-overlay">
          <div className="battle-banner"><small>FRIENDLY RANCH BATTLE</small><strong>{adventure.battleMessage}</strong></div>
          <div className="battle-health">
            <div><b>Your Dino</b><span><i style={{ width: `${adventure.playerHp / (12 + adventure.heart) * 100}%` }} /></span><small>{adventure.playerHp} HP</small></div>
            <div><b>Mossback</b><span><i className="rival-hp" style={{ width: `${adventure.rivalHp / 12 * 100}%` }} /></span><small>{adventure.rivalHp} HP</small></div>
          </div>
          {adventure.mode === "battle" ? <div className="battle-moves">
            <button onClick={() => useBattleMove("stomp")}><b>☄️ Comet Stomp</b><small>Strong & steady</small></button>
            <button onClick={() => useBattleMove("tail_whip")}><b>🍃 Leaf Whirl</b><small>Quick attack</small></button>
            <button onClick={() => useBattleMove("brace")}><b>🛡️ Brave Brace</b><small>Block damage</small></button>
          </div> : <button className="victory-button" onClick={returnToRanch}>Claim the Meadow Crest ✨</button>}
        </div>
      )}
      {scene === "world" && lastEvent?.type === "collectible_found" && (
        <div className="discovery-toast" key={`${lastEvent.id}-${lastEvent.t}`}>
          <span>✨</span><strong>{lastEvent.id.replaceAll("_", " ")}</strong>
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
