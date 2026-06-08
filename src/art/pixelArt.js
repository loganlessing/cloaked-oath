/* =================================================================
   pixelArt — low-level drawing primitives for crisp pixel art.

   The approach: sprites are drawn into a small offscreen canvas at
   "art resolution" (e.g. 1 unit = 1 pixel), then blitted scaled-up
   with smoothing disabled. This yields high-detail, chunky pixel art
   without any external image assets and with tiny memory cost.

   Higher-level sprite builders (sprites/*.js) compose these.
   ================================================================= */

/** Create an offscreen pixel buffer of logical size w x h. */
export function makeBuffer(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx, w, h };
}

/** Fill a rectangle of pixels. */
export function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

/** Single pixel. */
export function dot(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, 1, 1);
}

/** Draw a vertical gradient of stripes from a ramp (top=dark). */
export function vGradient(ctx, x, y, w, h, ramp) {
  const band = Math.max(1, Math.floor(h / ramp.length));
  for (let i = 0; i < ramp.length; i++) {
    px(ctx, x, y + i * band, w, (i === ramp.length - 1 ? h - i * band : band), ramp[i]);
  }
}

/** Outline a rect with a 1px border colour. */
export function outline(ctx, x, y, w, h, color) {
  px(ctx, x, y, w, 1, color);
  px(ctx, x, y + h - 1, w, 1, color);
  px(ctx, x, y, 1, h, color);
  px(ctx, x + w - 1, y, 1, h, color);
}

/**
 * Render a sprite from a string grid + colour key. Great for
 * characterful small sprites. '.' or ' ' = transparent.
 *   grid: array of equal-length strings
 *   key:  { 'a': '#fff', ... }
 */
export function stamp(ctx, ox, oy, grid, key, scale = 1) {
  for (let row = 0; row < grid.length; row++) {
    const line = grid[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.' || ch === ' ') continue;
      const color = key[ch];
      if (!color) continue;
      px(ctx, ox + col * scale, oy + row * scale, scale, scale, color);
    }
  }
}

/**
 * Deterministic pseudo-random for procedural texture (so a tile looks
 * the same every frame). Mulberry32-style.
 */
export function seeded(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Speckle a rect with random pixels from a ramp for organic texture. */
export function speckle(ctx, x, y, w, h, ramp, seed, density = 0.18) {
  const rnd = seeded(seed);
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      if (rnd() < density) {
        dot(ctx, x + xx, y + yy, ramp[(rnd() * ramp.length) | 0]);
      }
    }
  }
}

/**
 * Blit an offscreen buffer onto a destination context, scaled up with
 * smoothing off so pixels stay crisp.
 */
export function blit(destCtx, buffer, dx, dy, scale) {
  destCtx.imageSmoothingEnabled = false;
  destCtx.drawImage(buffer.canvas, dx, dy, buffer.w * scale, buffer.h * scale);
}
