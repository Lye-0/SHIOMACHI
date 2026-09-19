import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [category, id, source, ...flags] = process.argv.slice(2);
if (
  !["scenes", "closeups", "items", "mechanisms", "documents"].includes(
    category,
  ) ||
  !/^[a-z0-9-]+$/.test(id ?? "") ||
  !source
)
  throw Error(
    "Usage: node scripts/import-image.mjs <category> <id> <source> [--replace]",
  );
const relative = `assets/${category}/${id}.webp`;
const destination = path.join(root, "public", relative);
if (
  !flags.includes("--replace") &&
  (await fs.stat(destination).catch(() => null))
)
  throw Error("Asset exists; inspect replacement before using --replace");
await fs.mkdir(path.dirname(destination), { recursive: true });
const original = await sharp(source).metadata();
await sharp(source)
  .resize({ width: 2048, withoutEnlargement: true })
  .webp({ quality: 92, alphaQuality: 100 })
  .toFile(destination);
const final = await sharp(destination).metadata();
const manifestPath = path.join(root, "docs/assets/manifest.json");
const existing = JSON.parse(
  await fs.readFile(manifestPath, "utf8").catch(() => "{}"),
);
const manifest = Object.fromEntries(
  Object.values(existing).map((entry) => [
    entry.path.replace(/^assets\//, "").replace(/\.webp$/, ""),
    entry,
  ]),
);
manifest[`${category}/${id}`] = {
  path: relative,
  source: path.basename(source),
  generator: "built-in image_gen",
  sourceWidth: original.width,
  sourceHeight: original.height,
  width: final.width,
  height: final.height,
  status: "selected-for-integration",
};
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `${id}: ${final.width}x${final.height}, ${final.size ?? (await fs.stat(destination)).size} bytes`,
);
