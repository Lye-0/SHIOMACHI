const aliases: Record<string, string> = {
  "items/key-bow": "items/key-parts",
  "items/key-tip": "items/key-parts",
  "items/key": "items/key-parts",
  "closeups/shutter-open": "scenes/waiting-front-open",
  "closeups/shutter-open-high": "scenes/waiting-front-open-high",
  "closeups/key-empty": "closeups/key",
  "closeups/patch-dry": "closeups/patch",
  "closeups/belt": "closeups/belt-base",
  "closeups/boat-flooded": "scenes/dock-high-flooded",
};
export const asset = (group: string, name: string) =>
  `${import.meta.env.BASE_URL}assets/${aliases[`${group}/${name}`] ?? `${group}/${name}`}.webp`;
export const scene = (name: string) => asset("scenes", name);
export const closeup = (name: string) => asset("closeups", name);
export const itemImage = (name: string) =>
  asset(
    "items",
    name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
  );
export const mechanism = (name: string) => asset("mechanisms", name);
