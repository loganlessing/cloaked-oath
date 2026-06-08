/* =================================================================
   townData.js — the first town's layout (pure data).

   World coordinates are "art pixels". The TownMap system reads this
   to render terrain, place buildings, draw paths, and configure fog
   of war. New towns = new data files of the same shape (anticipating
   the "More Towns / World Expansion" future feature).
   ================================================================= */

export const town = {
  id: 'oakhollow',
  name: 'Oakhollow',
  world: { w: 1200, h: 900 },

  // Camera cinematic: start tight on the centre, pull back to this view.
  cinematic: {
    startZoom: 2.4,
    endZoom: 1.0,
    focus: { x: 600, y: 450 }, // fountain
    durationMs: 3200,
  },

  // Fog of war: everything outside these revealed regions starts hidden.
  // Future systems push more regions via Events.FOG_REVEAL.
  revealed: [
    { x: 600, y: 450, r: 360 }, // the town proper
  ],

  // Terrain painting instructions, resolved in order (later = on top).
  terrain: {
    base: 'grass',
    patches: [
      // central cobbled plaza
      { kind: 'cobble', x: 470, y: 320, w: 260, h: 260 },
      // north path to the gate
      { kind: 'path', x: 565, y: 60, w: 70, h: 280 },
      // south path to the forest
      { kind: 'path', x: 565, y: 560, w: 70, h: 300 },
      // forest fringe (south)
      { kind: 'forest', x: 360, y: 820, w: 480, h: 80 },
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
      x: 250, y: 240, interaction: 'enter', interior: 'tavern',
    },
    {
      id: 'homestead', name: 'Maren\'s Homestead', sprite: 'homestead',
      x: 820, y: 250, interaction: 'enter', interior: 'homestead',
    },
    {
      id: 'blacksmith', name: 'Emberfall Smithy', sprite: 'blacksmith',
      x: 280, y: 560, interaction: 'enter', interior: 'blacksmith',
    },
    {
      id: 'locked', name: 'The Shuttered Hall', sprite: 'locked',
      x: 820, y: 560, interaction: 'locked', interior: null,
      lockedText: 'The door is chained and the windows boarded. ' +
                  'Whatever happened here, the town would rather forget it.',
    },
    // Gated exits — visible but inaccessible for now.
    {
      id: 'gate', name: 'North Gate', sprite: 'gate',
      x: 568, y: 40, interaction: 'locked', interior: null,
      lockedText: 'The portcullis is lowered. The road beyond winds out of Oakhollow ' +
                  'toward lands you are not yet ready to walk.',
    },
    {
      id: 'forest', name: 'Forest Trail', sprite: 'forest',
      x: 560, y: 800, interaction: 'locked', interior: null,
      lockedText: 'The forest path is overgrown and dark. You sense it leads somewhere ' +
                  'important — but not today.',
    },
  ],
};
