/* =================================================================
   townData.js — the first town's layout (pure data).

   World coordinates are "art pixels". The TownMap system reads this
   to render terrain, props, buildings, and configure fog of war. New
   towns = new data files of the same shape (anticipating the "More
   Towns / World Expansion" future feature).

   Layout philosophy: buildings hug a central cobbled plaza around the
   fountain to read as a compact, lived-in town, with smaller props
   (stalls, lamps, barrels, greenery) filling the spaces between.
   ================================================================= */

export const town = {
  id: 'oakhollow',
  name: 'Oakhollow',
  world: { w: 1200, h: 900 },

  // Camera cinematic: start tight on the centre, pull back to this view.
  cinematic: {
    startZoom: 2.4,
    endZoom: 1.15,
    focus: { x: 600, y: 450 }, // fountain
    durationMs: 3200,
  },

  // Fog of war: everything outside these revealed regions starts hidden.
  // Generous radius so the tight town sits well clear of the fog edge.
  revealed: [
    { x: 600, y: 450, r: 400 }, // the town proper
  ],

  // Terrain painting instructions, resolved in order (later = on top).
  terrain: {
    base: 'grass',
    patches: [
      // central cobbled plaza
      { kind: 'cobble', x: 450, y: 322, w: 300, h: 278 },
      // dirt paths out of town (north gate / south forest)
      { kind: 'path', x: 572, y: 150, w: 56, h: 180 },
      { kind: 'path', x: 572, y: 590, w: 56, h: 130 },
      // short cobble approaches from the plaza to each building
      { kind: 'cobble', x: 414, y: 348, w: 40, h: 22 }, // tavern
      { kind: 'cobble', x: 746, y: 352, w: 38, h: 22 }, // homestead
      { kind: 'cobble', x: 404, y: 540, w: 48, h: 20 }, // blacksmith
      { kind: 'cobble', x: 748, y: 540, w: 36, h: 20 }, // locked hall
      // forest fringe behind the south trail
      { kind: 'forest', x: 420, y: 770, w: 360, h: 70 },
    ],
  },

  // Interactive structures. `interaction`: 'enter' | 'look' | 'locked'.
  // `interior` references an interior defined in npcData.js.
  buildings: [
    {
      id: 'fountain', name: 'Golden Fountain', sprite: 'fountain',
      x: 572, y: 422, interaction: 'look', interior: null,
      lookText: 'A gilded statue of a hooded hero presides over the fountain. ' +
                'Coins glint beneath the water. Something about the figure unsettles you.',
    },
    {
      id: 'tavern', name: 'The Salted Hart', sprite: 'tavern',
      x: 358, y: 300, interaction: 'enter', interior: 'tavern',
    },
    {
      id: 'homestead', name: 'Maren\'s Homestead', sprite: 'homestead',
      x: 758, y: 308, interaction: 'enter', interior: 'homestead',
    },
    {
      id: 'blacksmith', name: 'Emberfall Smithy', sprite: 'blacksmith',
      x: 368, y: 512, interaction: 'enter', interior: 'blacksmith',
    },
    {
      id: 'locked', name: 'The Shuttered Hall', sprite: 'locked',
      x: 762, y: 512, interaction: 'locked', interior: null,
      lockedText: 'The door is chained and the windows boarded. ' +
                  'Whatever happened here, the town would rather forget it.',
    },
    // Gated exits — visible but inaccessible for now.
    {
      id: 'gate', name: 'North Gate', sprite: 'gate',
      x: 568, y: 150, interaction: 'locked', interior: null,
      lockedText: 'The portcullis is lowered. The road beyond winds out of Oakhollow ' +
                  'toward lands you are not yet ready to walk.',
    },
    {
      id: 'forest', name: 'Forest Trail', sprite: 'forest',
      x: 560, y: 712, interaction: 'locked', interior: null,
      lockedText: 'The forest path is overgrown and dark. You sense it leads somewhere ' +
                  'important — but not today.',
    },
  ],

  // Non-interactive decorative props. Drawn (with buildings) sorted by
  // base-Y for depth. `sprite` maps to a builder in art/sprites.
  props: [
    // Plaza lamp posts (four corners)
    { sprite: 'lamppost', x: 452, y: 316 },
    { sprite: 'lamppost', x: 740, y: 316 },
    { sprite: 'lamppost', x: 452, y: 580 },
    { sprite: 'lamppost', x: 740, y: 580 },

    // Market stalls flanking the north path
    { sprite: 'stallRed',   x: 470, y: 290 },
    { sprite: 'stallGreen', x: 648, y: 290 },

    // Benches & greenery around the fountain
    { sprite: 'bench',     x: 540, y: 516 },
    { sprite: 'bench',     x: 632, y: 516 },
    { sprite: 'flowerbed', x: 506, y: 548 },
    { sprite: 'flowerbed', x: 668, y: 548 },
    { sprite: 'bush',      x: 506, y: 330 },
    { sprite: 'bush',      x: 672, y: 330 },

    // Tavern clutter (barrels, crates)
    { sprite: 'barrel',     x: 430, y: 364 },
    { sprite: 'barrel',     x: 446, y: 372 },
    { sprite: 'crateStack', x: 332, y: 360 },

    // Smithy clutter (woodpile, crates)
    { sprite: 'woodpile',   x: 336, y: 590 },
    { sprite: 'crateStack', x: 446, y: 556 },

    // Homestead surrounds (cart, hay)
    { sprite: 'cart',    x: 720, y: 392 },
    { sprite: 'hayBale', x: 824, y: 392 },

    // Signpost where the paths meet the plaza
    { sprite: 'signpost', x: 636, y: 250 },

    // Outskirt trees softening the fog edge
    { sprite: 'tree', x: 248, y: 244 },
    { sprite: 'tree', x: 884, y: 250 },
    { sprite: 'tree', x: 276, y: 642 },
    { sprite: 'tree', x: 892, y: 632 },
    { sprite: 'tree', x: 600, y: 786 },
    { sprite: 'bush', x: 330, y: 470 },
    { sprite: 'bush', x: 856, y: 460 },
  ],
};
