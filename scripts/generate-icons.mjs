// Genera los íconos PNG para la PWA desde un SVG inline.
// Ejecutar una sola vez: node scripts/generate-icons.mjs
import sharp from 'sharp';

const BG   = '#101714';
const GOLD = '#E8C468';

function svgIcon(size) {
  const rx         = Math.round(size * 0.18);   // esquinas redondeadas ~iOS
  const fontSize   = Math.round(size * 0.60);
  const textY      = Math.round(size * 0.695);  // centrado óptico del $
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="${BG}" rx="${rx}" ry="${rx}"/>
      <text
        x="${size / 2}" y="${textY}"
        font-family="Arial,Liberation Sans,Helvetica,sans-serif"
        font-size="${fontSize}" font-weight="bold"
        fill="${GOLD}" text-anchor="middle"
      >$</text>
    </svg>`
  );
}

const icons = [
  { size: 192, file: 'pwa-192x192.png' },
  { size: 512, file: 'pwa-512x512.png' },
  { size: 180, file: 'apple-touch-icon.png' },
];

for (const { size, file } of icons) {
  await sharp(svgIcon(size)).png().toFile(`public/${file}`);
  console.log(`✓ public/${file}`);
}
