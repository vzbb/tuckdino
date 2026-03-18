# Handoff

## Current Goal
- Keep polishing Tucker's dinosaur game, with special focus on movement feel, visual charm, and replacing rough placeholder world art with better assets over time.

## What Changed
- Fixed the worst of the baby dino backward-sliding / moonwalk feel in `src/three/characters/BabyDino.tsx` by separating travel heading from idle looking behavior and correcting the Quaternius model orientation.
- Reworked world dressing in `src/three/world/WorldProps.tsx` so prop placement is stable, the camp uses the Quaternius `Tent.glb` and `Bonfire.glb`, and the procedural trees/flowers/hills look more deliberate.
- Added `window.render_game_to_text` and `window.advanceTime` in `src/GameApp.tsx` for automated game-state inspection.
- Added local-dev fallback/backoff behavior for brain/TTS flows in `app/api/brain/route.ts`, `src/systems/ai/useDinoBrainLoop.ts`, and `src/systems/ai/useDinoSpeak.ts` so the game is less noisy without Gemini credentials.
- Installed Playwright in the repo and in the local skill folder, plus the Chromium browser bundle needed by the web-game testing harness.

## Verification
- `npm run build` passes.
- Manual browser flow verified:
  - egg selection
  - hatch transition
  - world load
  - tap-to-move
  - dino follow behavior looks much better than before
- Automated artifacts were saved under `output/web-game/round2/`.

## Important Files
- `src/three/characters/BabyDino.tsx`
- `src/three/world/WorldProps.tsx`
- `src/GameApp.tsx`
- `src/systems/ai/useDinoBrainLoop.ts`
- `src/systems/ai/useDinoSpeak.ts`
- `app/api/brain/route.ts`
- `progress.md`

## Known Caveats
- Without Gemini credentials, TTS may still fail once and then fall back to browser speech.
- The automated harness can miss egg clicks depending on viewport/canvas coordinates, so the manual browser pass was the more reliable world-entry verification.
- There are several repo changes and assets already present in the worktree beyond this specific pass; this checkpoint commit is intended to preserve the full current state, not to isolate only one file set.

## Good Next Steps
- Replace the current procedural trees with Quaternius tree models once those `.glb` assets are added under `public/assets/quaternius/`.
- Do a dedicated kid-fun/UI polish pass on HUD/menu readability and moment-to-moment delight.
- If desired, build a more deterministic automated action sequence for selecting an egg and entering the world.
