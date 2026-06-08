/* =================================================================
   structures.js — top-down building & landmark sprite builders.

   Each builder returns a cached offscreen buffer drawn at "art
   resolution". The map renderer blits them scaled-up. Buildings are
   rendered with a slight pseudo-3D roof so the town reads clearly
   from a top-down camera.

   A registry maps a `sprite` id (referenced in data/townData.js) to a
   builder, so adding a new building art = add one function + one entry.
   ================================================================= */

import { makeBuffer, px, outline, speckle, vGradient } from '../pixelArt.js';
import { Palette } from '../palette.js';

const _cache = new Map();

/* ---- shared helpers ---- */

function roof(ctx, x, y, w, h, ramp) {
  vGradient(ctx, x, y, w, h, ramp);
  // ridge line + eaves
  px(ctx, x, y, w, 2, ramp[3]);
  px(ctx, x, y + h - 2, w, 2, ramp[0]);
  for (let i = x + 2; i < x + w; i += 6) px(ctx, i, y, 1, h, ramp[0]);
}

function wallBase(ctx, x, y, w, h, ramp) {
  vGradient(ctx, x, y, w, h, ramp);
  outline(ctx, x, y, w, h, ramp[0]);
}

function door(ctx, x, y, w, h) {
  px(ctx, x, y, w, h, Palette.wood[0]);
  outline(ctx, x, y, w, h, Palette.wood[3]);
  px(ctx, x + w - 3, y + Math.floor(h / 2), 2, 2, Palette.gold[3]); // handle
}

function litWindow(ctx, x, y, w, h) {
  px(ctx, x, y, w, h, Palette.glassLit[2]);
  outline(ctx, x, y, w, h, Palette.wood[0]);
  px(ctx, x + (w >> 1), y, 1, h, Palette.wood[0]);
}

/* ---- builders. Each returns { canvas, w, h } sized to art pixels ---- */

const builders = {
  /* ----- Tavern: large, warm, thatched, hanging sign ----- */
  tavern() {
    const w = 80, h = 72;
    const { canvas, ctx } = makeBuffer(w, h);
    // ground footprint shadow
    px(ctx, 6, h - 6, w - 12, 6, Palette.shadow);
    // walls
    wallBase(ctx, 8, 26, w - 16, h - 30, Palette.woodLite);
    // timber framing
    for (let i = 16; i < w - 12; i += 12) px(ctx, i, 28, 2, h - 34, Palette.wood[1]);
    px(ctx, 8, 44, w - 16, 2, Palette.wood[1]);
    // roof (thatch), overhanging
    roof(ctx, 2, 6, w - 4, 26, Palette.thatch);
    // door + windows
    door(ctx, w / 2 - 6, h - 22, 12, 18);
    litWindow(ctx, 16, 50, 12, 10);
    litWindow(ctx, w - 28, 50, 12, 10);
    // hanging sign
    px(ctx, w - 16, 34, 2, 10, Palette.iron[2]);
    px(ctx, w - 22, 42, 12, 8, Palette.wood[2]);
    outline(ctx, w - 22, 42, 12, 8, Palette.gold[2]);
    return { canvas, w, h };
  },

  /* ----- Homestead: cozy cottage, red roof, chimney smoke stub ----- */
  homestead() {
    const w = 64, h = 60;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 6, h - 5, w - 12, 5, Palette.shadow);
    wallBase(ctx, 8, 24, w - 16, h - 28, Palette.wood);
    roof(ctx, 3, 6, w - 6, 22, Palette.roofRed);
    // chimney
    px(ctx, w - 20, 2, 8, 14, Palette.stone[1]);
    outline(ctx, w - 20, 2, 8, 14, Palette.stone[0]);
    door(ctx, w / 2 - 5, h - 20, 10, 16);
    litWindow(ctx, 14, 32, 10, 9);
    litWindow(ctx, w - 24, 32, 10, 9);
    return { canvas, w, h };
  },

  /* ----- Blacksmith: stone walls, anvil + forge glow, dark roof ----- */
  blacksmith() {
    const w = 70, h = 62;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 6, h - 5, w - 12, 5, Palette.shadow);
    wallBase(ctx, 8, 24, w - 16, h - 28, Palette.stone);
    speckle(ctx, 8, 24, w - 16, h - 28, Palette.stone, 5, 0.12);
    roof(ctx, 3, 6, w - 6, 22, Palette.iron);
    // forge opening with glow
    px(ctx, 14, 36, 16, 16, '#1a120c');
    px(ctx, 17, 42, 10, 8, Palette.roofRed[3]);
    px(ctx, 19, 44, 6, 5, Palette.gold[3]);
    // chimney
    px(ctx, 12, 0, 8, 12, Palette.iron[1]);
    door(ctx, w - 24, h - 22, 12, 18);
    // anvil out front
    px(ctx, w / 2 + 4, h - 9, 10, 4, Palette.iron[2]);
    px(ctx, w / 2 + 7, h - 12, 4, 3, Palette.iron[3]);
    return { canvas, w, h };
  },

  /* ----- Locked building: boarded windows, chained door, cold roof ----- */
  locked() {
    const w = 60, h = 58;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 6, h - 5, w - 12, 5, Palette.shadow);
    wallBase(ctx, 8, 22, w - 16, h - 26, Palette.stone);
    roof(ctx, 3, 6, w - 6, 20, Palette.roofBlue);
    // boarded door
    door(ctx, w / 2 - 6, h - 22, 12, 18);
    px(ctx, w / 2 - 10, h - 16, 20, 3, Palette.wood[2]); // plank
    px(ctx, w / 2 - 10, h - 10, 20, 3, Palette.wood[2]);
    // chain/lock hint
    px(ctx, w / 2 - 1, h - 14, 2, 4, Palette.iron[3]);
    // boarded window
    px(ctx, 14, 30, 12, 10, '#0d0b14');
    px(ctx, 12, 33, 16, 2, Palette.wood[2]);
    px(ctx, 12, 37, 16, 2, Palette.wood[2]);
    return { canvas, w, h };
  },

  /* ----- Golden fountain / statue at town centre ----- */
  fountain() {
    const w = 56, h = 56;
    const { canvas, ctx } = makeBuffer(w, h);
    const cx = w >> 1, cy = h >> 1;
    // basin (stone ring)
    for (let r = 24; r > 14; r--) ringPixel(ctx, cx, cy, r, Palette.stone[r % 2 ? 1 : 2]);
    // water
    for (let r = 14; r > 6; r--) ringPixel(ctx, cx, cy, r, Palette.water[(r % 3) + 1]);
    // golden statue plinth
    px(ctx, cx - 4, cy - 4, 8, 10, Palette.stone[2]);
    // golden figure
    px(ctx, cx - 3, cy - 14, 6, 12, Palette.gold[2]);
    px(ctx, cx - 2, cy - 18, 4, 5, Palette.gold[3]); // head
    px(ctx, cx + 3, cy - 12, 3, 8, Palette.gold[1]);  // raised arm
    px(ctx, cx - 1, cy - 13, 2, 6, Palette.gold[3]);  // glint
    return { canvas, w, h };
  },

  /* ----- Town gate (north path, currently barred) ----- */
  gate() {
    const w = 64, h = 40;
    const { canvas, ctx } = makeBuffer(w, h);
    // two towers
    for (const tx of [4, w - 20]) {
      vGradient(ctx, tx, 6, 16, h - 6, Palette.stone);
      outline(ctx, tx, 6, 16, h - 6, Palette.stone[0]);
      // crenellations
      for (let i = 0; i < 16; i += 6) px(ctx, tx + i, 2, 4, 5, Palette.stone[1]);
    }
    // archway with portcullis
    px(ctx, 22, 14, w - 44, h - 14, '#0c0a12');
    for (let i = 22; i < w - 22; i += 4) px(ctx, i, 14, 2, h - 14, Palette.iron[2]);
    for (let j = 18; j < h; j += 5) px(ctx, 22, j, w - 44, 2, Palette.iron[2]);
    return { canvas, w, h };
  },

  /* ----- Forest edge marker (south path) ----- */
  forest() {
    const w = 72, h = 56;
    const { canvas, ctx } = makeBuffer(w, h);
    const trees = [[10, 18, 12], [30, 8, 16], [52, 16, 13], [44, 30, 10], [16, 34, 9]];
    for (const [tx, ty, rad] of trees) {
      px(ctx, tx + rad - 2, ty + rad, 4, 12, Palette.wood[1]); // trunk
      for (let r = rad; r > 0; r--) ringFill(ctx, tx + rad, ty + rad, r, Palette.roofGreen[(r % 3)]);
    }
    return { canvas, w, h };
  },
};

/* circle helpers (pixel-rounded) */
function ringPixel(ctx, cx, cy, r, color) {
  for (let a = 0; a < 360; a += 6) {
    const x = cx + Math.round(Math.cos((a * Math.PI) / 180) * r);
    const y = cy + Math.round(Math.sin((a * Math.PI) / 180) * r);
    px(ctx, x, y, 1, 1, color);
  }
}
function ringFill(ctx, cx, cy, r, color) {
  for (let y = -r; y <= r; y++) {
    const span = Math.floor(Math.sqrt(r * r - y * y));
    px(ctx, cx - span, cy + y, span * 2 + 1, 1, color);
  }
}

/** Public: get a cached structure sprite buffer by id. */
export function structure(id) {
  if (!builders[id]) return null;
  if (!_cache.has(id)) _cache.set(id, builders[id]());
  return _cache.get(id);
}
