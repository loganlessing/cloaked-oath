# The Cloaked Oath

A 2D top-down, high-resolution pixel-art mystery RPG set in a medieval-fantasy
world. Everything — every sprite, tile, building, and character — is generated
**programmatically** via Canvas; there are no external image assets. The whole
game is pure HTML/CSS/JS using native ES modules, so it runs on **GitHub Pages**
with no build step.

> _You witness a cloaked cult wrong someone close to you, and set out to find the
> legendary warrior rumoured to defeat them — only to slowly discover the warrior
> **is** the cult's leader._

This repository contains the **base architecture**: the foundational systems that
all future features (combat, classes, quests, shops…) slot into without rewrites.

---

## Running it

Because it uses ES modules, open it through a web server (not `file://`):

```bash
# from the project root
python3 -m http.server 4173
# then visit http://127.0.0.1:4173
```

On GitHub Pages, just push and enable Pages — `index.html` is the entry point.

Dev shortcut: append `#play` to the URL to skip the menu and drop straight into
town (`…/index.html#play`).

---

## What's implemented (base build)

| Feature | Where |
|---|---|
| Main menu (title, Start, Settings placeholder, procedural backdrop) | `index.html`, `src/art/sprites/menuArt.js` |
| 70 / 30 game layout (persistent map + dynamic side panel) | `index.html`, `styles/main.css` |
| Pause menu overlay (Resume / Settings / Quit) + `Esc` | `src/core/Game.js` |
| Town map: pan, zoom, click-to-interact, opening cinematic | `src/systems/TownMapSystem.js`, `src/core/Camera.js` |
| Fog of war (revealed regions, extensible) | `src/systems/FogOfWar.js` |
| Procedural terrain, buildings, landmarks | `src/art/sprites/*` |
| Building interaction prompt (Enter / Look / Locked) | `src/systems/BuildingPrompt.js` |
| Side-view building interiors with clickable NPCs | `src/systems/InteriorSystem.js` |
| Branching dialogue bubbles (stateless, future-stateful shape) | `src/systems/DialogueSystem.js` |
| Character side panel (Character / Inventory / Skills / Equipment) | `src/systems/CharacterPanel.js` |
| Diverse fantasy races (dwarf/elf/human) sprite builder | `src/art/sprites/characters.js` |

Per the design, **no** combat, leveling, puzzles, or class selection are
implemented — but the architecture anticipates them (see _Future features_).

---

## Project structure

```
cloaked-oath/
├── index.html               # Entry: screens, panes, overlays
├── styles/
│   └── main.css             # All UI styling; enforces crisp pixel rendering
├── src/
│   ├── main.js              # Bootstraps the menu art + Game
│   ├── core/
│   │   ├── EventBus.js      # Pub/sub backbone + canonical Event names
│   │   ├── Game.js          # Orchestrator: state, loop, screens, pause
│   │   └── Camera.js        # Pan/zoom + cinematic tween for the map
│   ├── systems/
│   │   ├── TownMapSystem.js # Left-70% world: render + input + picking
│   │   ├── FogOfWar.js      # Hides unexplored world (offscreen layer)
│   │   ├── BuildingPrompt.js# Enter / Look / Locked popup
│   │   ├── SidePanel.js     # Right-30% mode switch (tabs ↔ interior)
│   │   ├── CharacterPanel.js# Tabbed character info
│   │   ├── InteriorSystem.js# Side-view interior + clickable NPCs
│   │   └── DialogueSystem.js# Branching dialogue bubbles
│   ├── art/
│   │   ├── palette.js       # Named colour ramps
│   │   ├── pixelArt.js      # Low-level pixel drawing primitives
│   │   └── sprites/
│   │       ├── tiles.js     # Terrain tiles
│   │       ├── structures.js# Top-down buildings + landmarks
│   │       ├── characters.js# Race/role side-view characters
│   │       └── menuArt.js   # Main-menu backdrop
│   └── data/
│       ├── townData.js      # First town layout (terrain, buildings, fog)
│       ├── npcData.js       # Interiors, NPCs, dialogue trees
│       └── playerData.js    # Player character (drives the tabs)
```

---

## Architecture overview

The game is organized as **decoupled systems that communicate through a single
`EventBus`** rather than holding references to each other. `Game` owns the
high-level state (`menu` | `playing`, with a `paused` sub-flag) and the single
`requestAnimationFrame` loop; everything else reacts to events.

**Data flows like this:**

```
Click on map
  → TownMapSystem picks a building, emits BUILDING_CLICK
    → BuildingPrompt shows Enter/Look/Locked
      → (Enter) emits BUILDING_ENTER
        → SidePanel swaps the right pane to InteriorSystem
          → click an NPC → NPC_CLICK → DialogueSystem opens a bubble
      → (Leave) emits INTERIOR_EXIT → SidePanel restores CharacterPanel
```

Key design choices:

- **The map (left 70%) is never replaced.** Entering a building only changes the
  right 30% panel; the world stays live and visible, exactly as specified.
- **Art is data-driven.** Sprite builders are keyed by ids/descriptors and cached,
  so new buildings/races are added by adding a builder + a data entry — no renderer
  changes.
- **Fog of war renders on its own offscreen layer**, then composites over the
  world. (Punching holes directly on the map canvas would erase the terrain too.)
- **Dialogue is stateless now but stateful-ready**: nodes/options already carry
  optional `set`/`require` hooks for a future quest-flag system.

### Canonical events (`src/core/EventBus.js`)

`SCENE_CHANGE`, `GAME_PAUSE`, `GAME_RESUME`, `BUILDING_CLICK`, `BUILDING_ENTER`,
`INTERIOR_EXIT`, `NPC_CLICK`, `DIALOGUE_OPEN`, `DIALOGUE_CLOSE`, `FOG_REVEAL`.

---

## Adding a feature (integration guide)

The codebase is built so new systems "slot in." General recipe:

1. **New system** → add a file in `src/systems/`. Subscribe to the events it
   cares about in its constructor; emit new events for others to react to. Add any
   new event names to `Events` in `EventBus.js`.
2. **New data** → add/extend a file in `src/data/`. Keep the same shape as the
   existing town/npc/player data.
3. **New art** → add a builder in `src/art/sprites/` and reference it by id from
   data. Reuse `pixelArt.js` primitives and `palette.js` ramps.
4. **Wire it** → instantiate the system once in `Game._initSystems()`.

Worked examples for the planned features:

- **New town / world expansion** — copy `townData.js` to a new file with the same
  shape; have a (future) `WorldSystem` swap which town `TownMapSystem` loads.
  Use `FOG_REVEAL` events to open the gates/forest paths.
- **Quest system** — a `QuestSystem` subscribes to `DIALOGUE_CLOSE` / `NPC_CLICK`,
  reads the `set`/`require` fields already present on dialogue options, and emits
  `FOG_REVEAL` to unlock areas. No dialogue-renderer changes needed.
- **Shops** — add a `'shop'` `interaction` type in `BuildingPrompt`, and a `'shop'`
  side-panel mode in `SidePanel` (mirroring `InteriorSystem`).
- **Classes / Weapons / Skills** — these surface in the existing
  `CharacterPanel` tabs; populate `playerData.js` and let the panel render it.
- **Battle system** — a new `playing` sub-state in `Game`, rendered into the
  map pane (or an overlay), driven by its own system + events.

---

## Future features (anticipated, not yet built)

Classes · Weapons & Armor · Battle System · Healing · Spells · More Towns ·
Story/Quests · Puzzles (e.g. the fountain mechanism) · Backtracking · Shops ·
Gold/Currency · Skills trees · Save/Load.

Each is designed to attach to the systems above without rewriting them.
