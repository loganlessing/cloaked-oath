/* =================================================================
   DialogueSystem — branching dialogue bubbles over an NPC.

   Stateless today: each conversation starts at node 'start' and the
   tree has no memory. The node/option shape, however, already carries
   optional `set` / `require` hooks so a future Quest/Flag system can
   make dialogue stateful without changing this renderer.

   The bubble is a DOM element anchored above the NPC inside the
   interior host, so it scales naturally with the side panel.
   ================================================================= */

import { bus, Events } from '../core/EventBus.js';

export class DialogueSystem {
  constructor(host) {
    this.host = host;       // positioned container (interior wrap)
    this.bubble = null;
    this.npc = null;
  }

  /**
   * Open a conversation.
   * @param {object} npc   - npc data (has name + dialogue tree)
   * @param {{x:number,y:number}} anchor - host-relative px (NPC head)
   */
  open(npc, anchor) {
    this.close();
    this.npc = npc;
    this.anchor = anchor;
    this.bubble = document.createElement('div');
    this.bubble.className = 'dialogue-bubble';
    this.host.appendChild(this.bubble);
    this._render('start');
    bus.emit(Events.DIALOGUE_OPEN, { npc: npc.id });
  }

  _render(nodeId) {
    const node = this.npc.dialogue[nodeId];
    if (!node) return this.close();

    this.bubble.style.left = `${this.anchor.x}px`;
    this.bubble.style.top = `${this.anchor.y}px`;
    this.bubble.innerHTML = `
      <div class="dialogue-speaker">${node.speaker || this.npc.name}</div>
      <div class="dialogue-text">${node.text}</div>
      <div class="dialogue-options"></div>
    `;
    const opts = this.bubble.querySelector('.dialogue-options');
    for (const opt of node.options || []) {
      const btn = document.createElement('button');
      btn.textContent = opt.label;
      if (opt.end) btn.classList.add('end');
      btn.addEventListener('click', () => {
        // (Future) honour opt.set / opt.require here for quest flags.
        if (opt.end || !opt.goto) this.close();
        else this._render(opt.goto);
      });
      opts.appendChild(btn);
    }
  }

  close() {
    if (this.bubble) {
      this.bubble.remove();
      this.bubble = null;
      bus.emit(Events.DIALOGUE_CLOSE, { npc: this.npc?.id });
    }
    this.npc = null;
  }

  get isOpen() { return !!this.bubble; }
}
