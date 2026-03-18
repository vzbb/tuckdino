Original prompt: vzbb/tuckdino ... is the repo. pls download/clone locally and work on development

Notes:
- Repository cloned locally into this workspace on 2026-03-09.
- `npm install` completed successfully on Windows/PowerShell.
- Initial inspection shows a Next.js + React Three Fiber game project with Gemini-backed API routes.
- README and some source comments display mojibake on this machine, so file encoding consistency may need cleanup during development.

TODO:
- Start the app locally and record the first runtime/build issue.
- Verify whether the 3D scene loads without external model assets.
- Add testing notes and any follow-up fixes here after each meaningful step.

Updates:
- 2026-03-12: Ran `npm run build`. First blocking issue was a TypeScript error in `src/systems/ai/useDinoBrainLoop.ts` where `DinoAnimationKey` was referenced without being imported.
- 2026-03-12: Added the missing `DinoAnimationKey` type import. Next step is to rebuild and continue until the app reaches a runnable state, then verify the game scene in-browser.
- 2026-03-12: Verified the app builds successfully after the type fix.
- 2026-03-12: Added a disk-backed TTS cache in `app/api/tts/route.ts`. Audio is now saved under `.cache/tts/` as `.wav` files plus metadata, keyed by voice and exact text, so repeated speech lines no longer need a fresh Gemini TTS call.
- 2026-03-12: Updated the client speech player to accept cached `audio/wav` responses while keeping its in-memory cache for the active session.
- 2026-03-12: Brightened nighttime world rendering in `src/three/scenes/WorldScene.tsx` by lifting ambient fill, adding hemisphere/moon fill light, warming the camp area, and reducing the darkness of night fog/sky so the scene stays readable.
- 2026-03-12: Added an explicit scene background color in `src/three/scenes/WorldScene.tsx` so the world no longer falls back to a near-black void when night lighting and fog combine unfavorably.
- 2026-03-12: Reworked dino follow behavior in `src/three/characters/BabyDino.tsx` so the body faces its actual travel heading during movement, trails beside/behind the player more naturally, and rotates the Quaternius model correctly to avoid the backward-sliding look.
- 2026-03-12: Rebuilt `src/three/world/WorldProps.tsx` to stabilize prop placement with memoized scatter points, improve the procedural trees/flowers/hills, and swap the campsite over to the existing Quaternius `Tent.glb` and `Bonfire.glb` assets (with the tent scaled down after browser verification).
- 2026-03-12: Added `window.render_game_to_text` and `window.advanceTime` hooks in `src/GameApp.tsx` so the web-game Playwright harness can observe state.
- 2026-03-12: Installed `playwright` in both the repo and the local skill folder, then installed the Chromium browser bundle required by the web-game harness.
- 2026-03-12: Browser-tested the egg flow, hatch transition, world rendering, and tap-to-move follow behavior. `output/web-game/round2/` now contains valid screenshots/state captures from the automated harness; manual Playwright screenshots were also taken for the world scene and movement verification.
- 2026-03-12: Reduced local-dev console noise by making `/api/brain` return a safe idle directive when no Gemini key is configured, and by adding TTS/brain fallback backoff on the client. Remaining known issue: without Gemini credentials, one TTS request during hatch/world may still fail once before browser speech fallback takes over.

TODO:
- If you add Quaternius tree or rock `.glb` files under `public/assets/quaternius/`, replace the current procedural tree meshes with model instances.
- Consider a dedicated movement test harness action sequence that clicks through egg selection into the world automatically; the generic script click target can miss the eggs depending on viewport size.
