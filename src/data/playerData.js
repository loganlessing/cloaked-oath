/* =================================================================
   playerData.js — the player character (drives the side-panel tabs).

   Stats/equipment/skills are placeholders shaped to anticipate the
   future Classes / Weapons / Skills systems without implementing them.
   The CharacterPanel reads this; future systems will mutate it.
   ================================================================= */

export const player = {
  name: 'Wanderer',
  race: 'human',
  title: 'The Unsworn',
  // Portrait sprite descriptor (reuses the character art builder).
  portrait: { race: 'human', role: 'villager', cloth: ['#2a2438', '#3a3150', '#4d4268', '#615484'], hair: ['#3a2616', '#52361f', '#6e492f', '#8a5e3d'] },

  // Placeholder stats — no leveling/combat yet, but the UI is ready.
  stats: {
    Health: '20 / 20',
    Stamina: '15 / 15',
    Resolve: '—',
    Class: 'Unchosen',
  },

  // Empty slots until Weapons/Armor systems arrive.
  equipment: ['Weapon', 'Shield', 'Head', 'Body', 'Hands', 'Feet', 'Ring', 'Charm'],

  // Skills tab placeholder.
  skills: [],

  // Inventory grid (number of empty slots to render).
  inventorySlots: 16,
};
