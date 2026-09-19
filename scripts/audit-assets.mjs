import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = JSON.parse(
  await fs.readFile(path.join(root, "src/content/asset-list.json"), "utf8"),
);
const manifest = JSON.parse(
  await fs.readFile(path.join(root, "docs/assets/manifest.json"), "utf8"),
);
const missing = [],
  unrecorded = [],
  invalid = [];
let count = 0,
  total = 0;
for (const [group, names] of Object.entries(required))
  for (const name of names) {
    const key = `${group}/${name}`,
      file = path.join(root, "public/assets", key + ".webp");
    const stat = await fs.stat(file).catch(() => null);
    if (!stat) {
      missing.push(key);
      continue;
    }
    count++;
    total += stat.size;
    if (!manifest[key]) unrecorded.push(key);
    const metadata = await sharp(file).metadata();
    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width < 128 ||
      metadata.height < 128
    )
      invalid.push(key);
  }
const expected = new Set(
  Object.entries(required).flatMap(([group, names]) =>
    names.map((name) => `${group}/${name}.webp`),
  ),
);
const unused = [];
for (const group of await fs.readdir(path.join(root, "public/assets"))) {
  const dir = path.join(root, "public/assets", group);
  if (!(await fs.stat(dir)).isDirectory()) continue;
  for (const f of await fs.readdir(dir))
    if (f.endsWith(".webp") && !expected.has(`${group}/${f}`))
      unused.push(`${group}/${f}`);
}
console.log(
  JSON.stringify(
    {
      present: count,
      totalMiB: Number((total / 1048576).toFixed(2)),
      missing,
      unrecorded,
      invalid,
      unused,
    },
    null,
    2,
  ),
);
if (missing.length || unrecorded.length || invalid.length || unused.length)
  process.exitCode = 1;
