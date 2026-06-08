/* =================================================================
   CharacterPanel — the default right-30% content: tabbed character
   info (Character, Inventory, Skills, Equipment).

   Renders into a host element. Builds the portrait from the same
   programmatic character art used for NPCs. Tabs are placeholders
   shaped for future Classes/Weapons/Skills systems.
   ================================================================= */

import { character } from '../art/sprites/characters.js';
import { blit } from '../art/pixelArt.js';

const TABS = ['Character', 'Inventory', 'Skills', 'Equipment'];

export class CharacterPanel {
  constructor(host, player) {
    this.host = host;
    this.player = player;
    this.active = 'Character';
  }

  mount() {
    this.host.innerHTML = `
      <div class="tabs">
        ${TABS.map((t) => `<button class="tab" data-tab="${t}">${t}</button>`).join('')}
      </div>
      <div class="tab-body" id="tab-body"></div>
    `;
    this.host.querySelectorAll('.tab').forEach((btn) => {
      btn.addEventListener('click', () => this.select(btn.dataset.tab));
    });
    this.select(this.active);
  }

  select(tab) {
    this.active = tab;
    this.host.querySelectorAll('.tab').forEach((b) =>
      b.classList.toggle('active', b.dataset.tab === tab));
    const body = this.host.querySelector('#tab-body');
    body.innerHTML = this._content(tab);
    if (tab === 'Character') this._drawPortrait();
  }

  _drawPortrait() {
    const cv = this.host.querySelector('#portrait');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const sprite = character(this.player.portrait);
    const scale = Math.floor(cv.width / sprite.w);
    const ox = (cv.width - sprite.w * scale) / 2;
    blit(ctx, sprite, ox, 4, scale);
  }

  _content(tab) {
    const p = this.player;
    switch (tab) {
      case 'Character':
        return `
          <canvas id="portrait" class="char-portrait" width="128" height="128"></canvas>
          <div class="char-name">${p.name}</div>
          <div class="char-race">${p.title} &middot; ${cap(p.race)}</div>
          ${Object.entries(p.stats).map(([k, v]) =>
            `<div class="stat-row"><span>${k}</span><span>${v}</span></div>`).join('')}
          <p class="placeholder-note">Your story has only begun.</p>`;
      case 'Inventory':
        return `
          <div class="grid-slots">
            ${Array.from({ length: p.inventorySlots }, () => `<div class="slot"></div>`).join('')}
          </div>
          <p class="placeholder-note">Your pack is empty.</p>`;
      case 'Skills':
        return `<p class="placeholder-note">No skills learned yet.<br>
                Skills arrive with your first class.</p>`;
      case 'Equipment':
        return `
          <div class="grid-slots">
            ${p.equipment.map(() => `<div class="slot"></div>`).join('')}
          </div>
          <p class="placeholder-note">Nothing equipped.<br>
            Visit the smithy when the time comes.</p>`;
      default:
        return '';
    }
  }
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
