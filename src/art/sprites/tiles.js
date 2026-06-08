/* =================================================================
   tiles.js — procedural terrain tile buffers (top-down map).

   Each tile is generated once into a small buffer and cached, then
   tiled across the world by the TownMap renderer.
   ================================================================= */

import { makeBuffer, px, speckle } from '../pixelArt.js';
import { Palette } from '../palette.js';

const TILE = 16; // logical pixels per tile
const _cache = new Map();

function build(kind) {
  const { canvas, ctx } = makeBuffer(TILE, TILE);
  switch (kind) {
    case 'grass':
      px(ctx, 0, 0, TILE, TILE, Palette.grass[1]);
      speckle(ctx, 0, 0, TILE, TILE, Palette.grass, 11, 0.30);
      break;
    case 'path':
      px(ctx, 0, 0, TILE, TILE, Palette.dirt[1]);
      speckle(ctx, 0, 0, TILE, TILE, Palette.dirt, 23, 0.28);
      break;
    case 'cobble':
      px(ctx, 0, 0, TILE, TILE, Palette.cobble[1]);
      // Brick-ish seams
      for (let y = 0; y < TILE; y += 4) {
        for (let x = 0; x < TILE; x += 8) {
          const off = (y / 4) % 2 ? 4 : 0;
          px(ctx, x + off, y, 7, 3, Palette.cobble[2]);
        }
      }
      speckle(ctx, 0, 0, TILE, TILE, Palette.cobble, 7, 0.10);
      break;
    case 'water':
      px(ctx, 0, 0, TILE, TILE, Palette.water[1]);
      speckle(ctx, 0, 0, TILE, TILE, Palette.water, 41, 0.22);
      break;
    case 'forest':
      px(ctx, 0, 0, TILE, TILE, Palette.grass[0]);
      speckle(ctx, 0, 0, TILE, TILE, Palette.roofGreen, 71, 0.45);
      break;
    case 'soil':
      // Tilled farm rows.
      px(ctx, 0, 0, TILE, TILE, Palette.dirt[2]);
      for (let y = 0; y < TILE; y += 4) {
        px(ctx, 0, y, TILE, 2, Palette.dirt[0]);
        px(ctx, 0, y + 2, TILE, 1, Palette.dirt[3]);
      }
      speckle(ctx, 0, 0, TILE, TILE, Palette.dirt, 13, 0.12);
      break;
    default:
      px(ctx, 0, 0, TILE, TILE, Palette.grass[1]);
  }
  return canvas;
}

/** Get a cached tile canvas by kind. */
export function tile(kind) {
  if (!_cache.has(kind)) _cache.set(kind, build(kind));
  return _cache.get(kind);
}

export const TILE_SIZE = TILE;
