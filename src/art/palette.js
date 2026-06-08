/* =================================================================
   Palette — named colour ramps for the medieval-fantasy art.

   Keeping colours centralised means sprites stay visually coherent
   and a future "theme"/season system can swap ramps in one place.
   Each ramp goes dark -> light so shading is consistent.
   ================================================================= */

export const Palette = {
  // Terrain
  grass:   ['#2f4a25', '#3c5e2e', '#4d7838', '#5e8d42'],
  dirt:    ['#3a2c1d', '#4d3a26', '#634a31', '#7a5d3e'],
  stone:   ['#3b3a44', '#4f4e59', '#6a6975', '#878695'],
  cobble:  ['#544a3a', '#6b5f49', '#857758', '#9d8e6b'],
  water:   ['#1c3a55', '#27506f', '#356a8f', '#4a87ad'],

  // Structures
  wood:    ['#3a261a', '#523623', '#6e492f', '#8a5e3d'],
  woodLite:['#6e492f', '#8a5e3d', '#a5744d', '#c08f63'],
  roofRed: ['#5a221d', '#7a2e26', '#9c3b30', '#bf4d3f'],
  roofBlue:['#1f2f4d', '#2b4068', '#395688', '#4c70aa'],
  roofGreen:['#234027','#2f5634','#3e7044','#4f8a55'],
  thatch:  ['#5a4516', '#766020', '#9a7e2e', '#c0a23e'],
  iron:    ['#26262e', '#34343f', '#474753', '#5e5e6c'],
  gold:    ['#7a5410', '#a8761c', '#d49d2c', '#f0c44a'],
  glassLit:['#6a5320', '#b89030', '#e9c45a', '#fff1b0'],

  // Characters
  skinHuman: ['#7a4a30', '#a36a44', '#c98b5e', '#e6b487'],
  skinElf:   ['#7e6a4e', '#a8916b', '#cdb78d', '#ead9b3'],
  skinDwarf: ['#8a543a', '#b07150', '#cf9069', '#ecb88c'],
  beard:     ['#5a3a1e', '#7a5028', '#9a6a36', '#b88a4e'],
  beardGrey: ['#454048', '#5e5860', '#807a82', '#a7a1a8'],
  cloth:     ['#2a2438', '#3a3150', '#4d4268', '#615484'],
  cloak:     ['#16131f', '#211b2e', '#2f2740', '#3d3454'], // the cult's cloaks

  // UI / lighting
  shadow:  'rgba(0,0,0,0.35)',
  glow:    'rgba(243,196,74,0.30)',
  night:   '#0c0a12',
};

/** Pick a ramp index safely (clamps). */
export function shade(ramp, i) {
  return ramp[Math.max(0, Math.min(ramp.length - 1, i))];
}
