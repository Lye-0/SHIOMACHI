// Shared coordinates for the cradle tracing, floating stern and physical measuring rod.
export const hull = {
  width: 800,
  height: 450,
  datum: 134,
  keel: 300,
  waterline: 234,
  step: 13.2,
} as const;
export const boatDraft = (hull.keel - hull.waterline) / hull.step / 10;
