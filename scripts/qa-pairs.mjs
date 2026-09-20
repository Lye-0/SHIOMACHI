import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const source = process.argv[2];
if (!source) throw Error("Pass the screenshot directory");
const destination = "docs/qa/consistency";
await fs.mkdir(destination, { recursive: true });
const files = (await fs.readdir(source)).filter((f) =>
  /^pair-.*\.png$/.test(f),
);
const groups = Object.groupBy(files, (f) =>
  f.replace(/-(before|\d+)\.png$/, ""),
);
for (const [group, list] of Object.entries(groups)) {
  list.sort((a, b) =>
    a.includes("-before")
      ? -1
      : b.includes("-before")
        ? 1
        : a.localeCompare(b, undefined, { numeric: true }),
  );
  for (let start = 0; start < list.length; start += 4) {
    const inputs = [];
    for (let j = start; j < Math.min(start + 4, list.length); j++) {
      const i = j - start,
        left = (i % 2) * 683,
        top = Math.floor(i / 2) * 410;
      inputs.push({
        input: await sharp(path.join(source, list[j]))
          .resize(683, 384)
          .toBuffer(),
        left,
        top,
      });
      inputs.push({
        input: Buffer.from(
          `<svg width="683" height="26"><rect width="683" height="26" fill="#111"/><text x="10" y="18" fill="white" font-size="13">${list[j]}</text></svg>`,
        ),
        left,
        top: top + 384,
      });
    }
    await sharp({
      create: { width: 1366, height: 820, channels: 3, background: "#111" },
    })
      .composite(inputs)
      .jpeg({ quality: 90 })
      .toFile(path.join(destination, `${group}-${start}.jpg`));
  }
}
console.log({ screenshots: files.length, groups: Object.keys(groups).length });
const walkthrough = [
  "paper",
  "support-free",
  "patch-dry",
  "boat-inside-dry",
  "rise",
  "rear-open",
  "recorded-chart",
  "draft",
  "lamp-dirty",
  "lamp-lit",
  "gate-open",
  "departure",
  "beam",
  "ending",
  "map",
  "mobile-map",
  "mobile-menu",
  "landscape-menu",
];
for (const name of walkthrough) {
  const file = path.join(source, `flow-${name}.png`);
  if (await fs.stat(file).catch(() => null))
    await sharp(file)
      .resize({ width: 1366, withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toFile(path.join(destination, `flow-${name}.jpg`));
}
