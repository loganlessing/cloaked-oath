/* =================================================================
   BuildingPrompt — the floating Enter / Look Inside / Locked popup
   shown when the player clicks a building on the map.

   It positions itself above the clicked building (screen coords from
   the map camera) and emits BUILDING_ENTER when the player chooses to
   go in. Look/Locked buildings just show flavour text. New interaction
   types (e.g. 'shop') are added by extending the switch below.
   ================================================================= */

import { bus, Events } from '../core/EventBus.js';

export class BuildingPrompt {
  constructor(el) {
    this.el = el;
    bus.on(Events.BUILDING_CLICK, (data) => {
      if (!data) return this.hide();
      this.show(data.def, data.screen);
    });
    // Dismiss when entering a building or leaving for menu.
    bus.on(Events.BUILDING_ENTER, () => this.hide());
    bus.on(Events.GAME_PAUSE, () => this.hide());
  }

  show(def, screen) {
    let actions = '';
    switch (def.interaction) {
      case 'enter':
        actions = `<button data-do="enter">Enter</button>
                   <button data-do="cancel">Step Back</button>`;
        break;
      case 'look':
        actions = `<p class="muted" style="font-size:.82rem;line-height:1.4">${def.lookText || 'Nothing of note.'}</p>
                   <button data-do="cancel">Close</button>`;
        break;
      case 'locked':
        actions = `<button class="locked" disabled>Locked</button>
                   <p class="muted" style="font-size:.82rem;line-height:1.4">${def.lockedText || 'It will not open.'}</p>
                   <button data-do="cancel">Close</button>`;
        break;
      default:
        actions = `<button data-do="cancel">Close</button>`;
    }

    this.el.innerHTML = `<h4>${def.name}</h4><div class="prompt-actions">${actions}</div>`;
    this.el.style.left = `${screen.x}px`;
    this.el.style.top = `${screen.y - 12}px`;
    this.el.classList.remove('hidden');

    this.el.querySelectorAll('button[data-do]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.do;
        if (action === 'enter') bus.emit(Events.BUILDING_ENTER, { id: def.id });
        this.hide();
      });
    });
  }

  hide() { this.el.classList.add('hidden'); this.el.innerHTML = ''; }
}
