// One-off script to rasterize the app icon (a checkmark-in-circle mark on an
// indigo background) into the PNG sizes the PWA manifest and iOS need.
// Run with: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const BG = "#4f46e5";

// `rounded`: draws its own rounded-corner background (regular app icon).
// Maskable/apple icons must be full-bleed squares — the OS applies its own
// mask/corner shape, and the checkmark is scaled down to stay inside the
// ~80%-diameter "safe zone" maskable icons require.
function svgIcon({ rounded, scale }) {
  const rectRadius = rounded ? 96 : 0;
  const r = 140 * scale;
  const cx = 256;
  const cy = 256;
  const strokeW = 28 * scale;
  const checkStrokeW = 32 * scale;
  // Checkmark path scaled/centered around (256,256) at the given scale.
  const p1 = { x: 256 - 66 * scale, y: 256 + 4 * scale };
  const p2 = { x: 256 - 21 * scale, y: 256 + 49 * scale };
  const p3 = { x: 256 + 74 * scale, y: 256 - 51 * scale };

  return `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="${rectRadius}" fill="${BG}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="white" stroke-width="${strokeW}"/>
  <path d="M${p1.x} ${p1.y} L${p2.x} ${p2.y} L${p3.x} ${p3.y}"
        stroke="white" stroke-width="${checkStrokeW}" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

const jobs = [
  { file: "icon-192.png", size: 192, rounded: true, scale: 1 },
  { file: "icon-512.png", size: 512, rounded: true, scale: 1 },
  { file: "icon-maskable-192.png", size: 192, rounded: false, scale: 0.7 },
  { file: "icon-maskable-512.png", size: 512, rounded: false, scale: 0.7 },
  { file: "apple-touch-icon.png", size: 180, rounded: false, scale: 0.78 },
];

for (const job of jobs) {
  const svg = svgIcon({ rounded: job.rounded, scale: job.scale });
  await sharp(Buffer.from(svg))
    .resize(job.size, job.size)
    .png()
    .toFile(path.join(outDir, job.file));
  console.log(`wrote ${job.file}`);
}
