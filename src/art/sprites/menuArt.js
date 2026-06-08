/* =================================================================
   menuArt.js — generates the main-menu backdrop as a pixel scene and
   returns a data-URL usable as a CSS background. Programmatic, so no
   external image asset is needed.
   ================================================================= */

import { makeBuffer, px, speckle } from '../pixelArt.js';
import { Palette } from '../palette.js';

export function menuBackdropUrl() {
  const W = 320, H = 180;
  const { canvas, ctx } = makeBuffer(W, H);

  // Night sky gradient
  for (let y = 0; y < H; y++) {
    const t = y / H;
    const r = Math.round(18 + t * 20), g = Math.round(14 + t * 14), b = Math.round(34 + t * 24);
    px(ctx, 0, y, W, 1, `rgb(${r},${g},${b})`);
  }
  // Stars
  speckle(ctx, 0, 0, W, H * 0.6, ['#cabfe0', '#e9e2f0', '#9a90b8'], 99, 0.02);
  // Moon
  px(ctx, W - 60, 24, 22, 22, '#e9e2c8');
  px(ctx, W - 56, 26, 14, 16, '#f4eed6');

  // Distant hills
  hill(ctx, W, H, 0.78, '#16131f');
  hill(ctx, W, H, 0.85, '#100d18');

  // Town silhouette (rooftops)
  const baseY = Math.round(H * 0.82);
  px(ctx, 0, baseY, W, H - baseY, '#0b0910');
  for (let x = 10; x < W; x += 26) {
    const bh = 18 + ((x * 7) % 22);
    px(ctx, x, baseY - bh, 20, bh, '#0e0b16');
    // roof
    for (let i = 0; i < 10; i++) px(ctx, x - i + 5, baseY - bh - i, 20 + i * 2 - 10, 1, '#120e1c');
    // a couple of lit windows
    if ((x / 26) % 2 === 0) px(ctx, x + 6, baseY - bh + 6, 3, 3, Palette.glassLit[3]);
  }

  // Central golden statue glow
  const sx = W / 2;
  const glow = ctx.createRadialGradient(sx, baseY - 20, 2, sx, baseY - 20, 40);
  glow.addColorStop(0, 'rgba(243,196,74,0.5)'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.fillRect(sx - 40, baseY - 60, 80, 80);
  px(ctx, sx - 2, baseY - 34, 4, 16, Palette.gold[2]);
  px(ctx, sx - 1, baseY - 38, 2, 5, Palette.gold[3]);

  return canvas.toDataURL();
}

function hill(ctx, W, H, level, color) {
  const baseY = Math.round(H * level);
  for (let x = 0; x < W; x++) {
    const y = baseY + Math.round(Math.sin(x * 0.04) * 6 + Math.sin(x * 0.13) * 3);
    px(ctx, x, y, 1, H - y, color);
  }
}
