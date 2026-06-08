/* =================================================================
   townData.js — the first town's layout (pure data).

   The town is an organic forest *clearing*: grass inside an irregular
   outline, dense forest all around, with two roads breaking the tree
   line to lead the player out. A circular cobbled pad rings the
   fountain and beaten dirt paths curve out to each building's front
   door. Smaller props are placed where they'd actually belong (farm
   clutter by the farm, barrels by the tavern, and so on).

   New towns = new files of this shape (future "World Expansion").
   ================================================================= */

const pt = (x, y) => ({ x, y });
const C = { x: 700, y: 520 }; // town centre / fountain

export const town = {
  id: 'oakhollow',
  name: 'Oakhollow',
  world: { w: 1400, h: 1040 },
  center: C,

  // Camera cinematic: start tight on the fountain, pull back to town.
  cinematic: { startZoom: 1.9, endZoom: 0.8, focus: C, durationMs: 3200 },

  // Irregular clearing outline (grass inside, forest outside). A higher
  // variation gives lobes/bays so the town doesn't read as a circle.
  clearing: { cx: C.x, cy: C.y, radius: 360, variation: 0.26, points: 16, seed: 4 },

  // Circular cobbled plaza around the fountain (kept modest so the
  // square reads as a plaza, not a roundabout).
  fountainPad: { x: C.x, y: C.y, r: 100 },

  // Aesthetic farm field (north-east, by the windmill).
  farm: { x: 812, y: 352, w: 176, h: 104 },

  // Procedural forest scatter (the system places trees from this).
  forest: { seed: 21, cellSize: 56, jitter: 30, density: 0.72 },

  // Curved, beaten dirt paths (world coords). `exit:true` paths break
  // the tree line and are also revealed through the fog.
  paths: [
    // North road out to the gate and beyond (weaves a little)
    { exit: true, width: 28, points: [pt(700, 432), pt(686, 330), pt(712, 214), pt(696, 112), pt(700, 24)] },
    // South road winding into the deep forest
    { exit: true, width: 28, points: [pt(700, 610), pt(724, 724), pt(680, 856), pt(708, 1016)] },
    // Curved connectors to each building's front door (door = bottom-centre)
    { width: 18, points: [pt(648, 488), pt(548, 506), pt(456, 480), pt(412, 466)] },        // tavern
    { width: 18, points: [pt(786, 512), pt(880, 540), pt(976, 520), pt(1032, 512)] },       // homestead
    { width: 18, points: [pt(650, 596), pt(560, 646), pt(486, 724), pt(465, 756)] },        // blacksmith
    { width: 18, points: [pt(792, 556), pt(900, 628), pt(1004, 704), pt(1036, 734)] },      // shuttered hall
    // Spur up to the farm / windmill
    { width: 14, points: [pt(744, 452), pt(812, 418), pt(884, 392), pt(916, 374)] },
  ],

  // Interactive structures. `door` is the world point a path leads to.
  buildings: [
    {
      id: 'fountain', name: 'Golden Fountain', sprite: 'fountain', scale: 1.5,
      x: 644, y: 462, interaction: 'look', interior: null,
      lookText: 'A gilded statue of a hooded figure presides over the fountain. ' +
                'Coins glint beneath the water. Something about the figure unsettles you.',
    },
    {
      id: 'tavern', name: 'The Salted Hart', sprite: 'tavern',
      x: 372, y: 394, interaction: 'enter', interior: 'tavern', door: pt(412, 466),
    },
    {
      id: 'homestead', name: 'Maren\'s Homestead', sprite: 'homestead',
      x: 1000, y: 452, interaction: 'enter', interior: 'homestead', door: pt(1032, 512),
    },
    {
      id: 'blacksmith', name: 'Emberfall Smithy', sprite: 'blacksmith',
      x: 430, y: 694, interaction: 'enter', interior: 'blacksmith', door: pt(465, 756),
    },
    {
      id: 'locked', name: 'The Shuttered Hall', sprite: 'locked',
      x: 1006, y: 676, interaction: 'locked', interior: null, door: pt(1036, 734),
      lockedText: 'The door is chained and the windows boarded. ' +
                  'Whatever happened here, the town would rather forget it.',
    },
    {
      id: 'gate', name: 'North Gate', sprite: 'gate',
      x: 668, y: 86, interaction: 'locked', interior: null,
      lockedText: 'The portcullis is lowered. The road beyond winds out of Oakhollow ' +
                  'toward lands you are not yet ready to walk.',
    },
  ],

  // Non-interactive decorative props. `scale` optional. Drawn (with
  // buildings) sorted by base-Y for depth.
  props: [
    // The windmill presiding over the farm
    { sprite: 'windmill', x: 880, y: 232 },

    // Farm field: crop rows, a fringing fence, and stored hay
    { sprite: 'crop', x: 818, y: 366 }, { sprite: 'crop', x: 872, y: 366 }, { sprite: 'crop', x: 926, y: 366 },
    { sprite: 'crop', x: 818, y: 396 }, { sprite: 'crop', x: 872, y: 396 }, { sprite: 'crop', x: 926, y: 396 },
    { sprite: 'crop', x: 818, y: 426 }, { sprite: 'crop', x: 872, y: 426 }, { sprite: 'crop', x: 926, y: 426 },
    { sprite: 'fence', x: 812, y: 452 }, { sprite: 'fence', x: 836, y: 452 }, { sprite: 'fence', x: 860, y: 452 },
    { sprite: 'fence', x: 884, y: 452 }, { sprite: 'fence', x: 908, y: 452 }, { sprite: 'fence', x: 932, y: 452 },
    { sprite: 'fence', x: 956, y: 452 },
    { sprite: 'hayBale', x: 806, y: 470 }, { sprite: 'hayBale', x: 968, y: 466 },

    // Plaza lamp posts ringing the fountain pad
    { sprite: 'lamppost', x: 694, y: 384 }, { sprite: 'lamppost', x: 694, y: 648 },
    { sprite: 'lamppost', x: 566, y: 514 }, { sprite: 'lamppost', x: 822, y: 514 },
    // Lamps lining the north road
    { sprite: 'lamppost', x: 656, y: 300 }, { sprite: 'lamppost', x: 742, y: 220 },

    // Benches & flower beds facing the fountain
    { sprite: 'bench', x: 628, y: 596 }, { sprite: 'bench', x: 748, y: 596 },
    { sprite: 'flowerbed', x: 596, y: 632 }, { sprite: 'flowerbed', x: 778, y: 632 },

    // Market stalls flanking the north road into the square
    { sprite: 'stallRed', x: 600, y: 360 }, { sprite: 'stallGreen', x: 740, y: 360 },

    // Tavern clutter (barrels & a crate by the door)
    { sprite: 'barrel', x: 458, y: 470 }, { sprite: 'barrel', x: 474, y: 478 },
    { sprite: 'crateStack', x: 360, y: 468 },

    // Smithy clutter (woodpile & crates)
    { sprite: 'woodpile', x: 398, y: 742 }, { sprite: 'crateStack', x: 512, y: 740 },

    // Homestead surrounds (cart & signpost)
    { sprite: 'cart', x: 1070, y: 470 },
    { sprite: 'signpost', x: 636, y: 432 },

    // Ornamental greenery softening the clearing edge
    { sprite: 'bush', x: 506, y: 332 }, { sprite: 'bush', x: 900, y: 600 },
    { sprite: 'bush', x: 540, y: 760 }, { sprite: 'bush', x: 980, y: 360 },
    { sprite: 'tree', x: 520, y: 286 }, { sprite: 'tree', x: 360, y: 580 },
  ],
};
