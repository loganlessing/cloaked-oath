/* =================================================================
   InteriorSystem — renders a 2D side-view building interior into the
   right-30% side panel and hosts its clickable NPCs + dialogue.

   The map (left 70%) stays untouched: this system only ever owns the
   side panel host. Backdrops are drawn procedurally per `bg` style
   (tavern / home / forge). NPC sprites come from the character art
   builder, so adding races/roles needs no changes here.
   ================================================================= */

import { bus, Events } from '../core/EventBus.js';
import { character } from '../art/sprites/characters.js';
import { Palette } from '../art/palette.js';
import { DialogueSystem } from './DialogueSystem.js';

export class InteriorSystem {
  constructor(host) {
    this.host = host;
    this.data = null;
    this.placed = [];     // { npc, box:{x,y,w,h}, head:{x,y} }
    this.dialogue = null;
    this._onResize = () => this.draw();
  }

  open(interiorData) {
    this.data = interiorData;
    this.host.innerHTML = `
      <div class="interior-wrap" id="interior-wrap">
        <div class="interior-header">
          <h3>${interiorData.name}</h3>
          <button class="exit-btn" id="interior-exit">Leave &rsaquo;</button>
        </div>
        <canvas id="interior-canvas"></canvas>
      </div>`;
    this.wrap = this.host.querySelector('#interior-wrap');
    this.canvas = this.host.querySelector('#interior-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.dialogue = new DialogueSystem(this.wrap);

    this.host.querySelector('#interior-exit')
      .addEventListener('click', () => bus.emit(Events.INTERIOR_EXIT));
    this.canvas.addEventListener('click', (e) => this._click(e));
    window.addEventListener('resize', this._onResize);

    this.draw();
  }

  close() {
    window.removeEventListener('resize', this._onResize);
    this.dialogue?.close();
    this.host.innerHTML = '';
    this.data = null;
    this.placed = [];
  }

  /* ---------------- click handling ---------------- */
  _click(e) {
    const r = this.canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    for (const p of this.placed) {
      const b = p.box;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        bus.emit(Events.NPC_CLICK, { npc: p.npc.id });
        this.dialogue.open(p.npc, { x: p.head.x, y: p.head.y });
        return;
      }
    }
    this.dialogue.close();
  }

  /* ---------------- rendering ---------------- */
  draw() {
    if (!this.data) return;
    const rect = this.wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const W = Math.max(1, Math.floor(rect.width));
    const H = Math.max(1, Math.floor(rect.height));
    this.canvas.width = W * dpr;
    this.canvas.height = H * dpr;
    this.canvas.style.width = W + 'px';
    this.canvas.style.height = H + 'px';
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    this._drawRoom(ctx, W, H);
    this._drawNPCs(ctx, W, H);
    // Re-anchor any open dialogue bubble to the (possibly moved) NPC head.
    if (this.dialogue?.isOpen) {
      const p = this.placed.find((q) => q.npc.id === this.dialogue.npc.id);
      if (p) {
        this.dialogue.anchor = { x: p.head.x, y: p.head.y };
        this.dialogue.bubble.style.left = `${p.head.x}px`;
        this.dialogue.bubble.style.top = `${p.head.y}px`;
      }
    }
  }

  _drawRoom(ctx, W, H) {
    const floorY = H * 0.72;
    const style = this.data.bg;

    // Wall wash by style
    const wall = {
      tavern: ['#2a1d14', '#3a2a1c'],
      home:   ['#2c2418', '#3c3221'],
      forge:  ['#1c1a1f', '#2a2630'],
    }[style] || ['#241c2c', '#322640'];

    const g = ctx.createLinearGradient(0, 0, 0, floorY);
    g.addColorStop(0, wall[0]); g.addColorStop(1, wall[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, floorY);

    // Floorboards
    ctx.fillStyle = Palette.wood[1];
    ctx.fillRect(0, floorY, W, H - floorY);
    ctx.fillStyle = Palette.wood[0];
    for (let y = floorY; y < H; y += 14) ctx.fillRect(0, y, W, 2);
    for (let x = (W % 40) / 2; x < W; x += 40) ctx.fillRect(x, floorY, 2, H - floorY);

    // Back-wall trim
    ctx.fillStyle = Palette.wood[2];
    ctx.fillRect(0, floorY - 8, W, 8);

    // Style-specific furnishings
    if (style === 'tavern') {
      // barrels
      this._barrel(ctx, W * 0.08, floorY - 30, 28);
      this._barrel(ctx, W * 0.08 + 34, floorY - 26, 24);
      // bar counter
      ctx.fillStyle = Palette.woodLite[1];
      ctx.fillRect(W * 0.18, floorY - 40, W * 0.30, 40);
      ctx.fillStyle = Palette.woodLite[3];
      ctx.fillRect(W * 0.18, floorY - 40, W * 0.30, 6);
      // warm hanging lantern
      this._lantern(ctx, W * 0.5, H * 0.16);
      this._lantern(ctx, W * 0.82, H * 0.22);
      // shelf with bottles
      ctx.fillStyle = Palette.wood[0];
      ctx.fillRect(W * 0.62, floorY - 86, W * 0.30, 6);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = [Palette.roofGreen[2], Palette.water[2], Palette.gold[2]][i % 3];
        ctx.fillRect(W * 0.63 + i * 14, floorY - 100, 6, 14);
      }
    } else if (style === 'home') {
      // window with daylight
      ctx.fillStyle = Palette.water[3];
      ctx.fillRect(W * 0.62, H * 0.18, W * 0.26, H * 0.26);
      ctx.fillStyle = Palette.wood[2];
      ctx.fillRect(W * 0.62, H * 0.18, W * 0.26, 4);
      ctx.fillRect(W * 0.62 + (W * 0.26) / 2 - 2, H * 0.18, 4, H * 0.26);
      // hearth
      ctx.fillStyle = '#1a120c';
      ctx.fillRect(W * 0.1, floorY - 46, 54, 46);
      ctx.fillStyle = Palette.roofRed[3];
      ctx.fillRect(W * 0.1 + 14, floorY - 22, 26, 22);
      // table
      ctx.fillStyle = Palette.woodLite[1];
      ctx.fillRect(W * 0.4, floorY - 6, W * 0.24, 6);
      ctx.fillRect(W * 0.42, floorY - 6, 5, 20);
      ctx.fillRect(W * 0.62, floorY - 6, 5, 20);
    } else if (style === 'forge') {
      // forge with glowing coals
      ctx.fillStyle = '#0f0c0a';
      ctx.fillRect(W * 0.1, floorY - 56, 70, 56);
      const fg = ctx.createRadialGradient(W * 0.1 + 35, floorY - 22, 4, W * 0.1 + 35, floorY - 22, 30);
      fg.addColorStop(0, '#ffd27a'); fg.addColorStop(0.5, Palette.roofRed[3]); fg.addColorStop(1, 'transparent');
      ctx.fillStyle = fg;
      ctx.fillRect(W * 0.1, floorY - 50, 70, 50);
      // anvil
      ctx.fillStyle = Palette.iron[2];
      ctx.fillRect(W * 0.42, floorY - 14, 40, 8);
      ctx.fillRect(W * 0.46, floorY - 22, 24, 10);
      ctx.fillRect(W * 0.5, floorY - 6, 12, 6);
      // tool rack
      ctx.fillStyle = Palette.iron[3];
      for (let i = 0; i < 4; i++) ctx.fillRect(W * 0.7 + i * 16, H * 0.22, 4, 40);
    }
  }

  _barrel(ctx, x, y, h) {
    ctx.fillStyle = Palette.wood[2]; ctx.fillRect(x, y, 22, h);
    ctx.fillStyle = Palette.iron[2]; ctx.fillRect(x, y + 4, 22, 3); ctx.fillRect(x, y + h - 7, 22, 3);
    ctx.fillStyle = Palette.wood[3]; ctx.fillRect(x + 3, y, 2, h);
  }
  _lantern(ctx, x, y) {
    ctx.fillStyle = Palette.iron[1]; ctx.fillRect(x - 1, 0, 2, y);
    const g = ctx.createRadialGradient(x, y + 6, 2, x, y + 6, 26);
    g.addColorStop(0, 'rgba(255,210,120,0.85)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y + 6, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = Palette.gold[2]; ctx.fillRect(x - 5, y, 10, 12);
    ctx.fillStyle = Palette.glassLit[3]; ctx.fillRect(x - 3, y + 2, 6, 8);
  }

  _drawNPCs(ctx, W, H) {
    this.placed = [];
    const floorY = H * 0.72;
    for (const npc of this.data.npcs) {
      const sprite = character(npc.sprite);
      // Scale so NPCs read clearly but fit the panel.
      const scale = Math.max(2, Math.round((H * 0.32) / sprite.h));
      const sw = sprite.w * scale, sh = sprite.h * scale;
      const cx = npc.x * W;
      const feetY = floorY + (H - floorY) * 0.5;
      const x = cx - sw / 2;
      const y = feetY - sh;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite.canvas, x, y, sw, sh);

      // name tag
      ctx.fillStyle = 'rgba(12,10,18,0.8)';
      const tagW = Math.max(46, npc.name.length * 6.4);
      ctx.fillRect(cx - tagW / 2, y - 16, tagW, 13);
      ctx.fillStyle = '#e3b341';
      ctx.font = '10px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, cx, y - 6);

      this.placed.push({
        npc,
        box: { x, y, w: sw, h: sh },
        head: { x: cx, y: y - 4 },
      });
    }
  }
}
