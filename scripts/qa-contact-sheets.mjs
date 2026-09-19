import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
const source = process.argv[2];
if (!source)
  throw Error("Pass the directory containing shio-qa-00.png through 49.png");
await fs.mkdir("docs/qa", { recursive: true });
for (let start = 0; start < 50; start += 6) {
  const composites = [];
  for (let i = start; i < Math.min(start + 6, 50); i++) {
    const input = await sharp(
      path.join(source, `shio-qa-${String(i).padStart(2, "0")}.png`),
    )
      .resize(683, 384)
      .toBuffer();
    composites.push({
      input,
      left: ((i - start) % 2) * 683,
      top: Math.floor((i - start) / 2) * 410,
    });
    composites.push({
      input: Buffer.from(
        `<svg width="683" height="26"><rect width="683" height="26" fill="#111"/><text x="12" y="19" fill="white" font-size="17">State ${i}</text></svg>`,
      ),
      left: ((i - start) % 2) * 683,
      top: Math.floor((i - start) / 2) * 410 + 384,
    });
  }
  await sharp({
    create: { width: 1366, height: 1230, channels: 3, background: "#111" },
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(`docs/qa/states-${String(start).padStart(2, "0")}.jpg`);
}
