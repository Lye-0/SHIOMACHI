export const chartPoints: Record<string, [number, number]> = {
  S: [60, 60],
  A: [280, 100],
  B: [280, 310],
  C: [500, 250],
  D: [500, 560],
  E: [720, 180],
  F: [700, 360],
  T: [850, 300],
  X: [70, 520],
};
export const observer = chartPoints.S;
export const landmarkPositions = {
  A: chartPoints.A,
  B: chartPoints.B,
  D: chartPoints.D,
  E: chartPoints.E,
};
// Both leading lines meet at the actual landing (60,60), not the similar old landing.
export function projection(
  node: keyof typeof landmarkPositions,
  position: number,
) {
  const shift = (position - 2) * 30,
    forward = [Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)],
    right = [-forward[1], forward[0]];
  const [x, y] = landmarkPositions[node],
    dx = x - (observer[0] + right[0] * shift),
    dy = y - (observer[1] + right[1] * shift);
  const z = dx * forward[0] + dy * forward[1],
    sideways = dx * right[0] + dy * right[1];
  return { x: 50 + (60 * sideways) / z, scale: 275 / z };
}
