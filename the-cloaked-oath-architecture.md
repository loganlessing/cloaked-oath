# The Cloaked Oath — Game Architecture & Context

## Context for Claude Code

### Role

You are an expert game developer specializing in 2D RPGs, pixel art rendering, and modular game architecture. You have deep experience building browser-based games with clean, extensible codebases designed to grow incrementally over time.

### Project Overview

We are building a **2D top-down high-resolution pixel art RPG** set in a **medieval fantasy world** called **"The Cloaked Oath"**, hosted on GitHub Pages. The game features diverse fantasy races — dwarves, elves, humans, and more — each with distinct visual styles and cultural details rendered in highly detailed, high-resolution pixel art.

The game is a mystery-driven detective RPG where the player witnesses a cloaked cult wronging someone close to them, seeks out a legendary warrior rumored to help defeat the cult, and gradually discovers that the warrior *is* the cult leader. The overarching mystery unfolds through exploration, environmental clues, NPC dialogue, and backtracking — with a misdirection structure where clues lead the player one way before revealing a deeper truth.

The codebase must be **modular by design** — each feature is a self-contained system that integrates cleanly with all others. When new features are added in future sessions, they slot into the existing architecture without requiring rewrites.

### Technical Requirements

- GitHub Pages compatible — pure HTML, CSS, and JavaScript (or React if it fits cleanly)
- Code must be clean, commented, and modular — each system in its own file or clearly separated module
- No external asset dependencies — all pixel art must be generated programmatically via Canvas or CSS
- High-resolution pixel art must be achievable within canvas/CSS constraints — no bloated file sizes
- No combat, leveling, puzzles, or class selection in this build — architecture should *anticipate* these but not implement them
- All features must work together as one cohesive codebase — no isolated demos

---

## Game Architecture & Features

### Main Menu Screen
- Game title: *"The Cloaked Oath"*
- Start Game button
- Settings button (placeholder, no functionality yet)
- Clean medieval fantasy pixel art aesthetic

### Core Game View (70/30 Split Layout)
- Left 70%: The town map — always visible, always occupying the full 70%. This panel never changes. The player scrolls, pans, and explores the world here at all times
- Right 30%: Dynamic side panel — when not in a building, shows tabbed character info (Character, Inventory, Skills, Equipment). When the player enters a building, this panel switches to show the 2D side-view interior. The map always remains visible in the 70%
- Pause button in top-left corner of the game view

### Pause Menu
- Overlay that freezes the game
- Resume, Settings, and Quit to Menu buttons

### Town Map System
- Opening cinematic: camera starts zoomed-in on the town, then pulls back to show the surrounding world before gameplay begins
- Fog of war: unexplored areas beyond the starting town are hidden
- Clickable buildings and objects on the map
- Pan and scroll to navigate the map
- Placeholder first town layout: central golden statue/fountain, surrounding buildings (tavern, homestead, blacksmith, locked building), two paths leading out of town (one toward a gate, one toward a forest edge) — both gated/inaccessible for now
- High-resolution pixel art rendering that conveys medieval fantasy detail and atmosphere

### Building Interior System
- Clicking a building shows an option (Enter / Look Inside / Locked)
- Entering a building renders a 2D side-view interior in the **right 30% panel** — the map in the left 70% remains unchanged and always visible
- Interior contains placeholder NPC sprites (dwarf bartender, seated patrons, etc.) that are clickable
- High-resolution pixel art interiors with detailed environments
- Clicking an NPC opens a dialogue bubble above them
- Exiting a building returns the right panel to the character tabs

### Dialogue System
- Basic branching dialogue tree: NPC speaks, player sees 2-3 response options, NPC responds
- Dialogue is stateless for now (no memory between conversations) but architecture must support stateful dialogue in future (quest flags, NPC memory, cross-NPC clue chains)

### Art Style & Fantasy Races
- High-resolution pixel art throughout — detailed enough to convey character, emotion, and medieval fantasy worldbuilding even at small scale
- Diverse fantasy races with distinct visual styles: dwarves (stocky, bearded, crafted aesthetics), elves (tall, graceful, nature-aligned), humans, and more
- Colorful, detailed town buildings reflecting medieval fantasy architecture
- Distinct NPC character sprites (placeholder but styled to their race and role)
- Fog of war rendering for unexplored areas

---

## Future Implementations

The following features will be added incrementally in future sessions and integrated into this architecture:

- **Classes** — multiple character classes with distinct playstyles
- **Weapons and Armor** — unique variants with different stats and aesthetics
- **Battle System** — combat mechanics and enemy encounters
- **Healing Mechanics** — potions, spells, and recovery systems
- **Spells** — magical abilities tied to classes and progression
- **More Towns and World Expansion** — additional explorable areas and story locations
- **Story Implementation** — dialogue chains, quest progression, and narrative content
- **Puzzles** — environmental puzzles like the fountain mechanism that gate progression
- **Backtracking Mechanics** — returning to earlier areas with new abilities to access previously locked content
- **Quest System** — NPC quest chains that send players between locations and NPCs
- **Shops** — blacksmith, general stores, and merchant systems
- **Gold/Currency System** — economy for buying and selling items
- **Skills System** — character abilities and skill trees
- **Save/Load System** — persistent game state across sessions

---

## Output Specifications

When building features, produce the following:

**1. Project file structure** — a clear directory tree showing how the codebase is organized

**2. Core architecture document** — a brief description of each system, what it does, and how it connects to other systems

**3. Full working code** — every file needed to run the game in a browser, complete, commented, and immediately runnable

**4. A feature integration guide** — explanation of how the new feature slots into the existing architecture

---

## Usage Notes

**Recommended model:** Claude Opus 4.6 — complex, multi-system architecture requiring deep reasoning and coherent code generation.

**Recommended tools:** Use Claude Code so the project persists and Claude can read your codebase directly in future sessions.

**Tip:** When adding new features, reference this document and tell Claude "add [feature] to the existing codebase." Claude will integrate cleanly without rewriting what's already built.
