/* =================================================================
   structures.js — top-down building & landmark sprite builders.

   Each builder returns a cached offscreen buffer drawn at "art
   resolution". The map renderer blits them scaled-up. Buildings are
   rendered with a slight pseudo-3D roof so the town reads clearly
   from a top-down camera.

   A registry maps a `sprite` id (referenced in data/townData.js) to a
   builder, so adding a new building art = add one function + one entry.
   ================================================================= */

import { makeBuffer, px, dot, outline, speckle, vGradient } from '../pixelArt.js';
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

  /* ----- Golden fountain / hooded statue at town centre -----
     Higher-resolution so detail reads when scaled up: a tiered stone
     basin, rippling water with sparkles, and a gilded hooded figure
     (a quiet nod to the cult). */
  fountain() {
    const w = 76, h = 76;
    const { canvas, ctx } = makeBuffer(w, h);
    const cx = w >> 1, cy = h >> 1;

    // ground shadow
    for (let r = 34; r > 31; r--) ringFill(ctx, cx, cy + 2, r, Palette.shadow);

    // outer stone basin with a stepped rim
    for (let r = 33; r > 25; r--) {
      ringFill(ctx, cx, cy, r, Palette.stone[r > 30 ? 0 : (r % 2 ? 1 : 2)]);
    }
    ringPixel(ctx, cx, cy, 33, Palette.stone[0]);
    ringPixel(ctx, cx, cy, 29, Palette.stone[3]); // rim highlight

    // water pool with concentric ripples
    for (let r = 25; r > 9; r--) {
      ringFill(ctx, cx, cy, r, Palette.water[(r % 3) + 1]);
    }
    ringPixel(ctx, cx, cy, 21, Palette.water[3]);
    ringPixel(ctx, cx, cy, 15, Palette.water[3]);
    // sparkles
    for (const [dx, dy] of [[-10, -6], [12, 4], [-6, 12], [8, -12], [0, 8]])
      dot(ctx, cx + dx, cy + dy, '#bfe3f5');

    // central plinth
    px(ctx, cx - 6, cy - 4, 12, 12, Palette.stone[2]);
    outline(ctx, cx - 6, cy - 4, 12, 12, Palette.stone[0]);
    px(ctx, cx - 6, cy - 4, 12, 2, Palette.stone[3]);

    // gilded hooded figure (cloak flares to the base)
    px(ctx, cx - 2, cy - 24, 4, 4, Palette.gold[3]);     // hood crown
    px(ctx, cx - 3, cy - 21, 6, 6, Palette.gold[2]);     // hood/face
    px(ctx, cx - 1, cy - 19, 2, 3, Palette.gold[0]);     // shadowed face
    px(ctx, cx - 4, cy - 16, 8, 10, Palette.gold[2]);    // shoulders/cloak
    px(ctx, cx - 5, cy - 8, 10, 6, Palette.gold[1]);     // cloak hem flare
    px(ctx, cx + 4, cy - 16, 3, 9, Palette.gold[1]);     // raised arm
    px(ctx, cx + 5, cy - 18, 2, 3, Palette.gold[3]);     // hand/torch
    px(ctx, cx - 2, cy - 15, 2, 9, Palette.gold[3]);     // gilt highlight
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

  /* =========================================================
     Decorative props — small details that dress the town.
     ========================================================= */

  /* ----- Wrought-iron lamp post ----- */
  lamppost() {
    const w = 12, h = 46;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 3, h - 3, 6, 2, Palette.shadow);
    px(ctx, 3, h - 6, 6, 5, Palette.iron[1]); outline(ctx, 3, h - 6, 6, 5, Palette.iron[0]);
    px(ctx, 5, 6, 2, h - 11, Palette.iron[2]);           // post
    px(ctx, 2, 3, 8, 9, Palette.iron[1]); outline(ctx, 2, 3, 8, 9, Palette.iron[0]); // housing
    px(ctx, 3, 5, 6, 6, Palette.glassLit[2]);
    px(ctx, 4, 5, 4, 5, Palette.glassLit[3]);
    px(ctx, 5, 6, 2, 3, '#fff1b0');                      // flame core
    px(ctx, 3, 1, 6, 2, Palette.iron[2]);                // cap
    px(ctx, 5, 0, 2, 1, Palette.gold[3]);                // finial
    return { canvas, w, h };
  },

  stallRed()   { return makeStall('#bf4d3f', '#e6dcc4'); },
  stallGreen() { return makeStall('#4f8a55', '#e6dcc4'); },

  /* ----- Plaza bench ----- */
  bench() {
    const w = 26, h = 14;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 2, h - 2, w - 4, 2, Palette.shadow);
    px(ctx, 3, h - 6, 3, 6, Palette.wood[0]);
    px(ctx, w - 6, h - 6, 3, 6, Palette.wood[0]);
    px(ctx, 1, h - 9, w - 2, 4, Palette.woodLite[1]);
    px(ctx, 1, h - 9, w - 2, 1, Palette.woodLite[3]);
    px(ctx, 3, 2, 2, 7, Palette.wood[1]);
    px(ctx, w - 5, 2, 2, 7, Palette.wood[1]);
    px(ctx, 1, 2, w - 2, 3, Palette.woodLite[2]);
    return { canvas, w, h };
  },

  /* ----- Flower bed ----- */
  flowerbed() {
    const w = 28, h = 14;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 1, h - 7, w - 2, 7, Palette.dirt[1]); outline(ctx, 1, h - 7, w - 2, 7, Palette.dirt[0]);
    for (const cx of [5, 12, 19, 24]) ringFill(ctx, cx, h - 8, 3, Palette.roofGreen[1]);
    const flowers = [[5, '#d24b3a'], [12, '#e9c44a'], [19, '#e9e2d0'], [24, '#9a6ad2']];
    for (const [fx, col] of flowers) { px(ctx, fx, h - 11, 2, 2, col); dot(ctx, fx, h - 12, '#fff1b0'); }
    return { canvas, w, h };
  },

  /* ----- Leafy bush ----- */
  bush() {
    const w = 24, h = 18;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 3, h - 2, w - 6, 2, Palette.shadow);
    ringFill(ctx, 8, 12, 7, Palette.roofGreen[0]);
    ringFill(ctx, 16, 13, 6, Palette.roofGreen[1]);
    ringFill(ctx, 12, 9, 6, Palette.roofGreen[2]);
    ringFill(ctx, 9, 7, 3, Palette.roofGreen[3]);
    dot(ctx, 14, 11, '#d24b3a'); dot(ctx, 7, 13, '#d24b3a'); // berries
    return { canvas, w, h };
  },

  /* ----- Barrel ----- */
  barrel() {
    const w = 16, h = 20;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 3, h - 2, 10, 2, Palette.shadow);
    px(ctx, 3, 2, 10, h - 4, Palette.wood[2]);
    px(ctx, 3, 2, 2, h - 4, Palette.wood[1]);
    px(ctx, 11, 2, 2, h - 4, Palette.wood[1]);
    px(ctx, 7, 2, 1, h - 4, Palette.wood[3]);            // stave highlight
    px(ctx, 3, 5, 10, 2, Palette.iron[2]);               // hoops
    px(ctx, 3, h - 8, 10, 2, Palette.iron[2]);
    px(ctx, 4, 1, 8, 2, Palette.wood[3]);                // lid
    outline(ctx, 3, 2, 10, h - 4, Palette.wood[0]);
    return { canvas, w, h };
  },

  /* ----- Stack of crates ----- */
  crateStack() {
    const w = 30, h = 28;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 2, h - 2, w - 4, 2, Palette.shadow);
    crate(ctx, 1, h - 15, 14);
    crate(ctx, 15, h - 15, 14);
    crate(ctx, 8, 0, 14);
    return { canvas, w, h };
  },

  /* ----- Wood pile (log ends) ----- */
  woodpile() {
    const w = 34, h = 16;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 2, h - 2, w - 4, 2, Palette.shadow);
    const log = (cx, cy) => {
      ringFill(ctx, cx, cy, 4, Palette.woodLite[2]);
      ringPixel(ctx, cx, cy, 4, Palette.wood[0]);
      ringPixel(ctx, cx, cy, 2, Palette.wood[3]);
      dot(ctx, cx, cy, Palette.wood[1]);
    };
    for (const cx of [5, 13, 21, 29]) log(cx, h - 5);
    for (const cx of [9, 17, 25]) log(cx, h - 12);
    return { canvas, w, h };
  },

  /* ----- Hand cart ----- */
  cart() {
    const w = 38, h = 26;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 4, h - 2, w - 8, 2, Palette.shadow);
    const wheel = (cx) => {
      ringFill(ctx, cx, h - 6, 5, Palette.wood[1]);
      ringPixel(ctx, cx, h - 6, 5, Palette.wood[0]);
      dot(ctx, cx, h - 6, Palette.iron[2]);
    };
    px(ctx, 4, h - 18, w - 10, 10, Palette.woodLite[1]); outline(ctx, 4, h - 18, w - 10, 10, Palette.wood[0]);
    for (let x = 8; x < w - 8; x += 5) px(ctx, x, h - 18, 1, 10, Palette.wood[1]);
    px(ctx, 8, h - 23, 8, 6, '#cdb06a');                 // hay sack
    px(ctx, 19, h - 23, 9, 6, Palette.roofRed[2]);       // crate
    px(ctx, w - 6, h - 16, 5, 2, Palette.wood[2]);       // handle
    wheel(9); wheel(w - 13);
    return { canvas, w, h };
  },

  /* ----- Hay bale ----- */
  hayBale() {
    const w = 26, h = 18;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 2, h - 2, w - 4, 2, Palette.shadow);
    px(ctx, 2, 3, w - 4, h - 6, '#c9a84e'); outline(ctx, 2, 3, w - 4, h - 6, '#9a7e2e');
    speckle(ctx, 3, 4, w - 6, h - 8, ['#b89030', '#d4b45a', '#9a7e2e'], 17, 0.4);
    px(ctx, 8, 3, 2, h - 6, '#7a5028');                  // bands
    px(ctx, w - 10, 3, 2, h - 6, '#7a5028');
    return { canvas, w, h };
  },

  /* ----- Direction signpost ----- */
  signpost() {
    const w = 20, h = 34;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 7, h - 3, 7, 2, Palette.shadow);
    px(ctx, 9, 4, 3, h - 6, Palette.wood[1]);
    px(ctx, 7, h - 4, 7, 3, Palette.wood[0]);            // base
    px(ctx, 8, 6, 11, 5, Palette.woodLite[2]); outline(ctx, 8, 6, 11, 5, Palette.wood[0]); // → board
    px(ctx, 10, 8, 6, 1, Palette.wood[0]);
    px(ctx, 1, 14, 11, 5, Palette.woodLite[1]); outline(ctx, 1, 14, 11, 5, Palette.wood[0]); // ← board
    px(ctx, 4, 16, 6, 1, Palette.wood[0]);
    return { canvas, w, h };
  },

  /* ----- Lone tree (front-view, matches forest marker) ----- */
  tree() {
    const w = 40, h = 54;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 8, h - 4, 24, 4, Palette.shadow);
    px(ctx, w / 2 - 3, h - 20, 6, 20, Palette.wood[1]);
    px(ctx, w / 2 - 3, h - 20, 2, 20, Palette.wood[0]);
    px(ctx, w / 2 + 1, h - 20, 1, 20, Palette.wood[2]);
    ringFill(ctx, 20, 22, 17, Palette.roofGreen[0]);
    ringFill(ctx, 20, 18, 15, Palette.roofGreen[1]);
    ringFill(ctx, 16, 15, 11, Palette.roofGreen[2]);
    ringFill(ctx, 25, 20, 8, Palette.roofGreen[1]);
    ringFill(ctx, 15, 12, 5, Palette.roofGreen[3]);
    dot(ctx, 24, 14, Palette.roofGreen[3]); dot(ctx, 12, 20, Palette.roofGreen[3]);
    return { canvas, w, h };
  },

  /* ----- Pine / conifer (forest variety) ----- */
  pineTree() {
    const w = 34, h = 58;
    const { canvas, ctx } = makeBuffer(w, h);
    const cx = w >> 1;
    px(ctx, cx - 4, h - 4, 8, 4, Palette.shadow);
    px(ctx, cx - 2, h - 14, 4, 14, Palette.wood[1]);      // trunk
    px(ctx, cx - 2, h - 14, 1, 14, Palette.wood[0]);
    // stacked foliage tiers, dark -> light up the tree
    const tiers = [[h - 16, 15], [h - 28, 12], [h - 38, 9], [h - 46, 6]];
    tiers.forEach(([ty, half], i) => {
      const shade = Palette.roofGreen[i === 0 ? 0 : (i === tiers.length - 1 ? 3 : 1)];
      for (let r = 0; r <= half; r++) {
        px(ctx, cx - (half - r), ty + r, (half - r) * 2 + 1, 1, shade);
      }
    });
    px(ctx, cx - 1, h - 50, 2, 4, Palette.roofGreen[3]);  // tip
    return { canvas, w, h };
  },

  /* ----- Windmill (aesthetic; tower + sails) ----- */
  windmill() {
    const w = 80, h = 140;
    const { canvas, ctx } = makeBuffer(w, h);
    const cx = w >> 1;
    px(ctx, cx - 22, h - 5, 44, 5, Palette.shadow);

    // tapering stone tower
    const topY = 44, botY = h - 4, topHalf = 16, botHalf = 26;
    for (let y = topY; y < botY; y++) {
      const t = (y - topY) / (botY - topY);
      const half = Math.round(topHalf + (botHalf - topHalf) * t);
      px(ctx, cx - half, y, half * 2, 1, Palette.stone[1 + (y % 2)]);
    }
    // stone banding + edges
    for (let y = topY + 8; y < botY; y += 12) px(ctx, cx - 26, y, 52, 1, Palette.stone[0]);
    px(ctx, cx - botHalf, botY - 1, botHalf * 2, 1, Palette.stone[0]);
    // door + windows
    px(ctx, cx - 6, botY - 22, 12, 22, Palette.wood[1]); outline(ctx, cx - 6, botY - 22, 12, 22, Palette.wood[3]);
    px(ctx, cx - 8, topY + 14, 6, 7, Palette.glassLit[2]); outline(ctx, cx - 8, topY + 14, 6, 7, Palette.wood[0]);
    px(ctx, cx + 2, topY + 14, 6, 7, Palette.glassLit[2]); outline(ctx, cx + 2, topY + 14, 6, 7, Palette.wood[0]);

    // conical cap
    for (let r = 0; r <= 20; r++) px(ctx, cx - (20 - r), topY - 22 + r, (20 - r) * 2 + 1, 1, Palette.roofRed[1 + (r % 2)]);
    px(ctx, cx - 1, topY - 26, 2, 4, Palette.iron[2]);    // finial

    // four sails (X) with lattice blades around the hub
    const hubY = topY - 2;
    px(ctx, cx - 3, hubY - 3, 6, 6, Palette.wood[3]); outline(ctx, cx - 3, hubY - 3, 6, 6, Palette.wood[0]);
    const blade = (dx, dy) => {
      for (let i = 6; i < 34; i += 2) {
        px(ctx, cx + Math.round(dx * i), hubY + Math.round(dy * i), 3, 3, Palette.wood[2]);
        if (i % 6 === 0) px(ctx, cx + Math.round(dx * i) - 2, hubY + Math.round(dy * i) - 2, 7, 1, '#cdbf9a');
      }
    };
    blade(0.7, -0.7); blade(0.7, 0.7); blade(-0.7, 0.7); blade(-0.7, -0.7);
    return { canvas, w, h };
  },

  /* ----- Field crop row ----- */
  crop() {
    const w = 28, h = 16;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 1, h - 5, w - 2, 5, Palette.dirt[1]);         // mounded soil
    px(ctx, 1, h - 5, w - 2, 1, Palette.dirt[3]);
    for (let x = 3; x < w - 2; x += 5) {
      px(ctx, x, h - 11, 2, 7, Palette.roofGreen[2]);     // stalk
      px(ctx, x - 1, h - 13, 4, 3, Palette.roofGreen[3]); // leafy top
      dot(ctx, x, h - 13, Palette.gold[3]);               // grain
    }
    return { canvas, w, h };
  },

  /* ----- Fence segment (horizontal) ----- */
  fence() {
    const w = 26, h = 16;
    const { canvas, ctx } = makeBuffer(w, h);
    px(ctx, 3, h - 4, 3, 4, Palette.wood[0]);             // posts
    px(ctx, w - 6, h - 4, 3, 4, Palette.wood[0]);
    px(ctx, 3, 3, 3, h - 4, Palette.wood[1]);
    px(ctx, w - 6, 3, 3, h - 4, Palette.wood[1]);
    px(ctx, 1, 5, w - 2, 2, Palette.woodLite[1]);         // rails
    px(ctx, 1, 10, w - 2, 2, Palette.woodLite[1]);
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

/* ---- prop helpers ---- */

/** A single wooden crate with an X-brace, drawn at (x,y) size s. */
function crate(ctx, x, y, s) {
  px(ctx, x, y, s, s, Palette.woodLite[1]);
  outline(ctx, x, y, s, s, Palette.wood[0]);
  px(ctx, x, y + (s >> 1) - 1, s, 2, Palette.wood[1]); // mid plank
  for (let i = 1; i < s - 1; i++) {                    // X brace
    dot(ctx, x + i, y + i, Palette.wood[2]);
    dot(ctx, x + s - 1 - i, y + i, Palette.wood[2]);
  }
}

/** A striped-awning market stall. Returns a sprite buffer. */
function makeStall(awn, trim) {
  const w = 52, h = 44;
  const { canvas, ctx } = makeBuffer(w, h);
  px(ctx, 3, h - 3, w - 6, 3, Palette.shadow);
  px(ctx, 5, 10, 3, h - 12, Palette.wood[1]);          // posts
  px(ctx, w - 8, 10, 3, h - 12, Palette.wood[1]);
  px(ctx, 3, h - 16, w - 6, 13, Palette.woodLite[1]);  // counter
  px(ctx, 3, h - 16, w - 6, 3, Palette.woodLite[3]);
  const goods = ['#bf4d3f', '#4f8a55', '#e9c44a', '#4a87ad'];
  for (let i = 0; i < 4; i++) px(ctx, 9 + i * 10, h - 23, 6, 6, goods[i]); // wares
  for (let x = 2; x < w - 2; x += 8) {                 // striped awning
    px(ctx, x, 2, 4, 14, awn);
    px(ctx, x + 4, 2, 4, 14, trim);
  }
  px(ctx, 2, 2, w - 4, 2, Palette.wood[2]);            // valance
  px(ctx, 2, 15, w - 4, 2, Palette.wood[2]);
  return { canvas, w, h };
}

/** Public: get a cached structure sprite buffer by id. */
export function structure(id) {
  if (!builders[id]) return null;
  if (!_cache.has(id)) _cache.set(id, builders[id]());
  return _cache.get(id);
}
