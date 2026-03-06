export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Damps an angle (radians) towards a target in a stable way.
export function dampAngle(current: number, target: number, lambda: number, dt: number) {
  const twoPi = Math.PI * 2;
  let delta = (target - current) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  if (delta < -Math.PI) delta += twoPi;
  const t = 1 - Math.exp(-lambda * dt);
  return current + delta * t;
}
