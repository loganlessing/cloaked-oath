/* =================================================================
   characters.js — side-view NPC sprite builder for interiors.

   Characters are parameterised by race + role so the same builder
   produces a dwarf bartender, an elf patron, a human, etc. This keeps
   the "diverse fantasy races with distinct visual styles" requirement
   data-driven: add a race entry, get a new look everywhere.

   Returns a cached buffer keyed by the full descriptor.
   ================================================================= */

import { makeBuffer, px, outline } from '../pixelArt.js';
import { Palette } from '../palette.js';

const _cache = new Map();

/** Per-race body proportions & default colours. */
const RACES = {
  dwarf: { w: 22, h: 30, skin: Palette.skinDwarf, head: 9, body: 14, stout: true,  beard: Palette.beard },
  elf:   { w: 20, h: 36, skin: Palette.skinElf,   head: 7, body: 18, stout: false, ears: true },
  human: { w: 20, h: 33, skin: Palette.skinHuman, head: 8, body: 16, stout: false },
};

/**
 * Build a side-view character.
 * @param {object} d - { race, cloth, hair, beard, role }
 */
function build(d) {
  const r = RACES[d.race] || RACES.human;
  const W = r.w + 6, H = r.h + 6;
  const { canvas, ctx } = makeBuffer(W, H);
  const cx = W >> 1;
  const cloth = d.cloth || Palette.cloth;
  const skin = r.skin;

  // shadow
  px(ctx, cx - 8, H - 3, 16, 3, Palette.shadow);

  let y = 4;
  const headW = r.head;
  const headX = cx - (headW >> 1);

  // head
  px(ctx, headX, y, headW, headW, skin[2]);
  outline(ctx, headX, y, headW, headW, skin[0]);
  // eyes
  px(ctx, headX + headW - 3, y + 3, 1, 2, '#1a1018');
  px(ctx, headX + headW - 5, y + 3, 1, 2, '#1a1018');
  // hair cap
  const hair = d.hair || Palette.beard;
  px(ctx, headX, y, headW, 3, hair[1]);
  // elf ears
  if (r.ears) {
    px(ctx, headX - 1, y + 3, 2, 3, skin[2]);
    px(ctx, headX + headW - 1, y + 3, 2, 3, skin[2]);
  }

  // beard (dwarves / bearded roles)
  if (r.beard || d.beard) {
    const beard = d.beard || r.beard;
    const by = y + headW - 1;
    px(ctx, headX - 1, by, headW + 2, 8, beard[2]);
    px(ctx, headX + 1, by + 8, headW - 2, 3, beard[1]);
    y += 2; // beard pushes body down a touch
  }

  // body / tunic
  const bodyY = y + headW;
  const bodyW = r.stout ? r.w : r.w - 4;
  const bodyX = cx - (bodyW >> 1);
  px(ctx, bodyX, bodyY, bodyW, r.body, cloth[2]);
  outline(ctx, bodyX, bodyY, bodyW, r.body, cloth[0]);
  // belt
  px(ctx, bodyX, bodyY + r.body - 5, bodyW, 2, Palette.wood[1]);
  px(ctx, cx - 1, bodyY + r.body - 6, 2, 4, Palette.gold[2]);

  // arms
  px(ctx, bodyX - 3, bodyY + 2, 3, r.body - 6, cloth[1]);
  px(ctx, bodyX + bodyW, bodyY + 2, 3, r.body - 6, cloth[1]);
  // hands
  px(ctx, bodyX - 3, bodyY + r.body - 5, 3, 3, skin[2]);
  px(ctx, bodyX + bodyW, bodyY + r.body - 5, 3, 3, skin[2]);

  // legs
  const legY = bodyY + r.body;
  px(ctx, cx - 5, legY, 4, H - legY - 3, cloth[1]);
  px(ctx, cx + 1, legY, 4, H - legY - 3, cloth[1]);
  // boots
  px(ctx, cx - 6, H - 4, 5, 3, Palette.wood[0]);
  px(ctx, cx + 1, H - 4, 5, 3, Palette.wood[0]);

  // role props
  if (d.role === 'bartender') {
    // apron
    px(ctx, bodyX + 2, bodyY + 4, bodyW - 4, r.body - 6, Palette.cloth[3]);
    // tankard in hand
    px(ctx, bodyX + bodyW + 1, bodyY + r.body - 8, 4, 5, Palette.gold[2]);
  } else if (d.role === 'patron') {
    // mug on the table side
    px(ctx, bodyX + bodyW, bodyY + r.body - 7, 3, 4, Palette.iron[2]);
  }

  return { canvas, w: W, h: H };
}

/** Public: cached character buffer for a descriptor. */
export function character(descriptor) {
  const key = JSON.stringify(descriptor);
  if (!_cache.has(key)) _cache.set(key, build(descriptor));
  return _cache.get(key);
}
