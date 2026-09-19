import sharp from "sharp";
import path from "node:path";
for (const file of process.argv.slice(2)) {
  const meta = await sharp(file).metadata();
  const stats = await sharp(file).stats();
  console.log(
    JSON.stringify({
      file: path.basename(file),
      width: meta.width,
      height: meta.height,
      alpha: meta.hasAlpha,
      channels: stats.channels.map((c) => ({
        min: c.min,
        max: c.max,
        mean: Math.round(c.mean),
      })),
    }),
  );
}
