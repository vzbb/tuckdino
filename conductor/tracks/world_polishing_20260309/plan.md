# Implementation Plan: Polish World & Core Interactive Engagements

## Phase 1: Environmental & Atmospheric Polish
Goal: Elevate the visual quality and coherence of the 3D world.

- [x] Task: Audit existing lighting and materials in `WorldScene.tsx` and `WorldProps.tsx`.
- [x] Task: Refine Day/Night transition logic and skybox atmosphere in `useDayNightSync.ts`.
- [x] Task: Implement subtle environmental effects (e.g., wind in trees, campfire particle refinement).
- [x] Task: Conductor - User Manual Verification 'Environmental & Atmospheric Polish' (Protocol in workflow.md)

## Phase 2: Engaging Dino Interactivity
Goal: Create dynamic, reactive behaviors that make the dino feel "alive" in the world.

- [x] Task: Define environmental "Interest Points" (e.g., butterflies, flowers) in `WorldScene.tsx`.
- [x] Task: Implement dino "Discovery" behaviors—where the dino autonomously investigates Interest Points.
    - [x] Write Tests: Verify interest point detection logic.
    - [x] Implement: Update `useDinoBrainLoop.ts` with new behavior states.
- [x] Task: Add reactive "Dino Reactions" (e.g., happy wiggles, curious tilts) based on proximity to Interest Points.
- [ ] Task: Conductor - User Manual Verification 'Engaging Dino Interactivity' (Protocol in workflow.md)

## Phase 3: Touch & Interaction Refinement
Goal: Improve the tactile feel of player interaction.

- [ ] Task: Add visual feedback for "Tap-to-Move" target (e.g., ground ripple, marker animation).
- [ ] Task: Implement subtle "Dino Attention" logic—where the dino looks at the player or interaction point.
- [ ] Task: Refine the Radial Menu appearance and transition animations in `RadialMenu.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Touch & Interaction Refinement' (Protocol in workflow.md)
