/* =================================================================
   TownMapSystem — owns the persistent left-70% town map.

   Responsibilities:
     - Pre-render terrain (base + patches) into a world buffer.
     - Render terrain, buildings, fog, and the cinematic each frame.
     - Handle pan (drag), zoom (wheel), and building picking (click).
     - Emit Events.BUILDING_CLICK so the UI can show Enter/Look/Locked.

   It never knows about interiors, dialogue, or the side panel — those
   react to its events. This keeps the map a self-contained system.
   ================================================================= */

import { bus, Events } from '../core/EventBus.js';
import { Camera } from '../core/Camera.js';
import { FogOfWar } from './FogOfWar.js';
import { tile, TILE_SIZE } from '../art/sprites/tiles.js';
import { structure } from '../art/sprites/structures.js';

export class TownMapSystem {
  constructor(canvas, town) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.town = town;

    this.camera = new Camera(town.world);
    this.fog = new FogOfWar(town.revealed);

    // Resolve building sprite buffers + world rects up front.
    this.buildings = town.buildings.map((b) => {
      const buf = structure(b.sprite);
      return { def: b, buf, w: buf ? buf.w : 32, h: buf ? buf.h : 32, interactive: true };
    });

    // Decorative props (non-interactive).
    this.props = (town.props || []).map((p) => {
      const buf = structure(p.sprite);
      return { def: p, buf, w: buf ? buf.w : 16, h: buf ? buf.h : 16, interactive: false };
    });

    // Combined draw list, sorted by base-Y so nearer sprites overlap
    // farther ones (simple painter's depth for the oblique view).
    this._drawables = [...this.buildings, ...this.props]
      .sort((a, b) => (a.def.y + a.h) - (b.def.y + b.h));

    this.hoverId = null;
    this._enabled = false;
    this._terrain = this._renderTerrain();

    this._bindInput();
    this.resize();
  }

  /* ---------------- terrain pre-render ---------------- */
  _renderTerrain() {
    const { w, h } = this.town.world;
    const buf = document.createElement('canvas');
    buf.width = w; buf.height = h;
    const c = buf.getContext('2d');
    c.imageSmoothingEnabled = false;

    const paint = (kind, x, y, pw, ph) => {
      const t = tile(kind);
      for (let yy = y; yy < y + ph; yy += TILE_SIZE) {
        for (let xx = x; xx < x + pw; xx += TILE_SIZE) {
          c.drawImage(t, xx, yy);
        }
      }
    };
    paint(this.town.terrain.base, 0, 0, w, h);
    for (const p of this.town.terrain.patches) paint(p.kind, p.x, p.y, p.w, p.h);
    return buf;
  }

  /* ---------------- lifecycle ---------------- */
  enable() {
    this._enabled = true;
    this.camera.cinematic(this.town.cinematic);
    bus.emit('cinematic:start');
  }
  disable() { this._enabled = false; }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    this.camera.setViewport(rect.width, rect.height);
  }

  /* ---------------- input ---------------- */
  _bindInput() {
    const cv = this.canvas;
    let dragging = false, moved = false, lastX = 0, lastY = 0;

    cv.addEventListener('mousedown', (e) => {
      if (!this._interactive()) return;
      dragging = true; moved = false;
      lastX = e.clientX; lastY = e.clientY;
      cv.classList.add('panning');
    });
    window.addEventListener('mousemove', (e) => {
      if (this._interactive()) this._updateHover(e);
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      this.camera.panByScreen(dx, dy);
      lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('mouseup', (e) => {
      if (dragging && !moved && this._interactive()) this._pick(e);
      dragging = false;
      cv.classList.remove('panning');
    });
    cv.addEventListener('wheel', (e) => {
      if (!this._interactive()) return;
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      this.camera.zoomAt(e.clientX - r.left, e.clientY - r.top, factor);
    }, { passive: false });
  }

  /** Interactive only when enabled and the cinematic has finished. */
  _interactive() { return this._enabled && !this.camera.inCinematic; }

  _localPoint(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  _buildingAt(sx, sy) {
    const wpt = this.camera.toWorld(sx, sy);
    // topmost first
    for (let i = this.buildings.length - 1; i >= 0; i--) {
      const b = this.buildings[i];
      const { x, y } = b.def;
      if (!this.fog.isRevealed(x + b.w / 2, y + b.h / 2)) continue;
      if (wpt.x >= x && wpt.x <= x + b.w && wpt.y >= y && wpt.y <= y + b.h) return b;
    }
    return null;
  }

  _updateHover(e) {
    const p = this._localPoint(e);
    const b = this._buildingAt(p.x, p.y);
    const id = b ? b.def.id : null;
    this.hoverId = id;
    this.canvas.style.cursor = id ? 'pointer' : '';
  }

  _pick(e) {
    const p = this._localPoint(e);
    const b = this._buildingAt(p.x, p.y);
    if (!b) { bus.emit(Events.BUILDING_CLICK, null); return; }
    const screen = this.camera.toScreen(b.def.x + b.w / 2, b.def.y);
    bus.emit(Events.BUILDING_CLICK, { def: b.def, screen });
  }

  /* ---------------- render ---------------- */
  update(dt) { this.camera.update(dt); }

  render() {
    const ctx = this.ctx;
    const { w, h } = this.camera.viewport;
    ctx.clearRect(0, 0, w, h);

    // Terrain: blit whole world buffer through the camera transform.
    const origin = this.camera.toScreen(0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this._terrain,
      origin.x, origin.y,
      this.town.world.w * this.camera.zoom,
      this.town.world.h * this.camera.zoom
    );

    // Buildings + props, depth-sorted, only those whose centre is
    // revealed by the fog.
    for (const d of this._drawables) {
      if (!d.buf) continue;
      const cxw = d.def.x + d.w / 2, cyw = d.def.y + d.h / 2;
      if (!this.fog.isRevealed(cxw, cyw)) continue;
      const s = this.camera.toScreen(d.def.x, d.def.y);
      const dw = d.w * this.camera.zoom, dh = d.h * this.camera.zoom;

      if (d.interactive && this.hoverId === d.def.id) {
        ctx.save();
        ctx.shadowColor = 'rgba(243,196,74,0.9)';
        ctx.shadowBlur = 18;
        ctx.drawImage(d.buf.canvas, s.x, s.y, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(d.buf.canvas, s.x, s.y, dw, dh);
      }
    }

    // Fog of war on top of the world.
    this.fog.render(ctx, this.camera);
  }
}
