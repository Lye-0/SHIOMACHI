// Native vector layout guide for image_gen, not a game asset or raster edit.
import sharp from "sharp";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 800 450"><rect width="800" height="450" fill="#344858"/><path d="M106 134H694Q670 284 400 300Q130 284 106 134Z" fill="#604a35" stroke="#211d19" stroke-width="3"/><path d="M108 143H692M119 166H681M135 195H665M150 218H650" stroke="#251f18" stroke-width="3"/><circle cx="106" cy="134" r="4" fill="#d2a45b"/><circle cx="694" cy="134" r="4" fill="#d2a45b"/><rect y="234" width="800" height="216" fill="#203e50"/><path d="M0 234H800" stroke="#7798a2" stroke-width="1.5"/></svg>`;
await sharp(Buffer.from(svg)).png().toFile(process.argv[2]);
