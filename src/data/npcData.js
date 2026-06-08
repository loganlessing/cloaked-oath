/* =================================================================
   npcData.js — building interiors, NPC sprites, and dialogue trees.

   Each interior describes:
     - a side-view scene (background style + furniture)
     - NPCs placed at x/y (fractions of the interior viewport)
     - each NPC's dialogue tree

   Dialogue trees are nodes keyed by id. A node has `text`, a
   `speaker`, and `options` (each: label + `goto` node id, or `end`).
   Stateless today, but the shape already supports future flags:
   an option may carry `set`/`require` keys for a quest system to read.
   ================================================================= */

export const interiors = {
  tavern: {
    name: 'The Salted Hart',
    bg: 'tavern',            // interior backdrop style (see InteriorSystem)
    npcs: [
      {
        id: 'barkeep',
        name: 'Borin Stoutarm',
        sprite: { race: 'dwarf', role: 'bartender', cloth: ['#3a2a3e', '#4d3a52', '#5f4a66', '#71597a'], beard: ['#6a4a1e', '#8a6428', '#a67e36', '#c09a4e'] },
        x: 0.30, y: 0.62,
        dialogue: {
          start: {
            speaker: 'Borin Stoutarm',
            text: 'Aye, you look like trouble found you. Sit. What\'ll it be?',
            options: [
              { label: 'I\'m looking for someone who can fight the cloaked ones.', goto: 'cult' },
              { label: 'What happened to the boarded-up hall outside?', goto: 'hall' },
              { label: 'Nothing. Just passing through.', end: true },
            ],
          },
          cult: {
            speaker: 'Borin Stoutarm',
            text: 'The Cloaked Oath? Hah. Only one soul ever stood against them and lived — ' +
                  'the Warden of Ash. Folk say she still takes petitioners. If you can find her.',
            options: [
              { label: 'Where do I find the Warden?', goto: 'warden' },
              { label: 'You don\'t sound convinced.', goto: 'doubt' },
              { label: 'Thank you.', end: true },
            ],
          },
          warden: {
            speaker: 'Borin Stoutarm',
            text: 'Past the north gate, when it opens. Smith might know more — Emberfall forged ' +
                  'her old blade, or so the story goes.',
            options: [{ label: 'I\'ll ask the smith.', end: true }],
          },
          doubt: {
            speaker: 'Borin Stoutarm',
            text: '...Let\'s just say heroes and villains wear the same cloak in the dark. ' +
                  'Watch who you trust, friend.',
            options: [{ label: 'I\'ll remember that.', end: true }],
          },
          hall: {
            speaker: 'Borin Stoutarm',
            text: 'Don\'t. That\'s where it started. We don\'t speak of it, and neither should you.',
            options: [{ label: 'Understood.', end: true }],
          },
        },
      },
      {
        id: 'patron',
        name: 'Hooded Patron',
        sprite: { race: 'human', role: 'patron', cloth: ['#16131f', '#211b2e', '#2f2740', '#3d3454'] },
        x: 0.70, y: 0.66,
        dialogue: {
          start: {
            speaker: 'Hooded Patron',
            text: 'You ask a great many questions for someone new to Oakhollow.',
            options: [
              { label: 'Who are you?', goto: 'who' },
              { label: 'Sorry to bother you.', end: true },
            ],
          },
          who: {
            speaker: 'Hooded Patron',
            text: 'No one of consequence. ...Yet.',
            options: [{ label: 'Right.', end: true }],
          },
        },
      },
    ],
  },

  homestead: {
    name: 'Maren\'s Homestead',
    bg: 'home',
    npcs: [
      {
        id: 'maren',
        name: 'Maren',
        sprite: { race: 'human', role: 'villager', cloth: ['#3a3a1f', '#52522b', '#6e6e3a', '#8a8a4e'], hair: ['#5a3a1e', '#7a5028', '#9a6a36', '#b88a4e'] },
        x: 0.5, y: 0.62,
        dialogue: {
          start: {
            speaker: 'Maren',
            text: 'You saw it too, didn\'t you. The cloaks. They took my brother and called it ' +
                  '"the Oath." No one will help.',
            options: [
              { label: 'I\'ll help you. Tell me everything.', goto: 'help' },
              { label: 'Where did they take him?', goto: 'where' },
              { label: 'I\'m sorry for your loss.', end: true },
            ],
          },
          help: {
            speaker: 'Maren',
            text: 'Then find the Warden of Ash. She\'s the only one the cult fears. ' +
                  'Please — before it\'s too late for him.',
            options: [{ label: 'I will find her.', end: true }],
          },
          where: {
            speaker: 'Maren',
            text: 'North, past the gate, toward the old shrine. But the way is barred, ' +
                  'and the guard answers to... them.',
            options: [{ label: 'I\'ll find another way.', end: true }],
          },
        },
      },
    ],
  },

  blacksmith: {
    name: 'Emberfall Smithy',
    bg: 'forge',
    npcs: [
      {
        id: 'smith',
        name: 'Dagna Emberfall',
        sprite: { race: 'dwarf', role: 'villager', cloth: ['#3a261a', '#523623', '#6e492f', '#8a5e3d'], beard: ['#45403e', '#5e5850', '#807a70', '#a7a190'] },
        x: 0.42, y: 0.62,
        dialogue: {
          start: {
            speaker: 'Dagna Emberfall',
            text: 'Mind the sparks. I forge for those who fight — not that there are many left ' +
                  'with the spine for it.',
            options: [
              { label: 'I heard you forged the Warden of Ash\'s blade.', goto: 'warden' },
              { label: 'Can you make me a weapon?', goto: 'weapon' },
              { label: 'Just looking. Good day.', end: true },
            ],
          },
          warden: {
            speaker: 'Dagna Emberfall',
            text: 'Aye. Black steel, ash-quenched. She paid in silence and never told me ' +
                  'her name. If you mean to find her... be certain she\'s what you think she is.',
            options: [
              { label: 'What do you mean by that?', goto: 'cryptic' },
              { label: 'I understand. Thank you.', end: true },
            ],
          },
          cryptic: {
            speaker: 'Dagna Emberfall',
            text: 'A blade doesn\'t care whose hand swings it. Neither, I\'ve learned, does a hero.',
            options: [{ label: '...', end: true }],
          },
          weapon: {
            speaker: 'Dagna Emberfall',
            text: 'Not yet. Come back when there\'s coin in your purse and steel in your nerve.',
            options: [{ label: 'Fair enough.', end: true }],
          },
        },
      },
    ],
  },
};
