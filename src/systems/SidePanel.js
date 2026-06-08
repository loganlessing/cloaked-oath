/* =================================================================
   SidePanel — controls what the right-30% panel shows.

   Two modes:
     - 'tabs'     : the CharacterPanel (default)
     - 'interior' : an InteriorSystem for the building being visited

   It listens for BUILDING_ENTER / INTERIOR_EXIT and swaps modes,
   keeping the left-70% map completely untouched. This is the single
   place that decides side-panel content, so future panel modes (shop,
   quest log) slot in here.
   ================================================================= */

import { bus, Events } from '../core/EventBus.js';
import { CharacterPanel } from './CharacterPanel.js';
import { InteriorSystem } from './InteriorSystem.js';
import { interiors } from '../data/npcData.js';

export class SidePanel {
  constructor(host, player) {
    this.host = host;
    this.character = new CharacterPanel(host, player);
    this.interior = new InteriorSystem(host);
    this.mode = 'tabs';

    bus.on(Events.BUILDING_ENTER, ({ id }) => this.showInterior(id));
    bus.on(Events.INTERIOR_EXIT, () => this.showTabs());
  }

  /** Show the default character tabs. */
  showTabs() {
    if (this.mode === 'interior') this.interior.close();
    this.mode = 'tabs';
    this.character.mount();
  }

  showInterior(buildingId) {
    const data = interiors[buildingId];
    if (!data) return;
    this.mode = 'interior';
    this.interior.open(data);
  }
}
