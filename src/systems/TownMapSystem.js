/* =================================================================
   TownMapSystem — owns the persistent left-70% town map.

   Responsibilities:
     - Build the organic clearing geometry (shared with the fog).
     - Pre-render terrain (forest floor, grass clearing, farm soil,
       cobble pad, curved beaten paths) into a world buffer.
     - Scatter the surrounding forest procedurally.
     - Render terrain, depth-sorted buildings/props/trees, and the
       shaped fog each frame; handle pan/zoom and building picking.

   It never knows about interiors, dialogue, or the side panel — those
   react to its events. This keeps the map a self-contained system.
   ================================================================= */

import { bus, Events } from '../core/EventBus.js';
import { Camera } from '../core/Camera.js';
import { FogOfWar } from './FogOfWar.js';
import { tile } from '../art/sprites/tiles.js';
import { structure } from '../art/sprites/structures.js';
import { seeded } from '../art/pixelArt.js';
import { Palette } from '../art/palette.js';
import {
  makeBlob, buildSmoothPath, pointInPolygon, nearPolyline, scalePolygon,
} from '../core/geometry.js';

export class TownMapSystem {
  constructor(canvas, town) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.town = town;

    this.camera = new Camera(town.world);

    // Organic clearing outline — shared by terrain, fog, and forest.
    this.clearing = makeBlob(town.clearing);

    // Buildings (interactive) and props (decorative), with optional scale.
    this.buildings = town.buildings.map((b) => this._drawable(b, b.sprite, true));
    this.props = (town.props || []).map((p) => this._drawable(p, p.sprite, false));

    // Fog reveals a slightly grown clearing (so the tree line at the
    // edge half-shows) plus the exit roads, and a disc around each
    // building so they're always revealed even if the wobbly outline
    // dips inward near one.
    const { cx, cy } = town.clearing;
    this.fog = new FogOfWar({
      polygon: scalePolygon(this.clearing, cx, cy, 1.07),
      corridors: town.paths
        .filter((p) => p.exit)
        .map((p) => ({ points: p.points, width: p.width + 80 })),
      circles: this.buildings.map((b) => ({
        x: b.def.x + b.w / 2, y: b.def.y + b.h / 2, r: Math.max(b.w, b.h) * 0.75,
      })),
    });

    // Procedurally scattered forest, then one depth-sorted draw list.
    this.forestTrees = this._generateForest();
    this._drawables = [...this.buildings, ...this.props, ...this.forestTrees]
      .sort((a, b) => (a.def.y + a.h) - (b.def.y + b.h));

    this.hoverId = null;
    this._enabled = false;
    this._terrain = this._renderTerrain();

    this._bindInput();
    this.resize();
  }

  /** Resolve a sprite + scaled world size for a data entry. */
  _drawable(def, spriteId, interactive) {
    const buf = structure(spriteId);
    const scale = def.scale || 1;
    return {
      def, buf, interactive,
      w: (buf ? buf.w : 24) * scale,
      h: (buf ? buf.h : 24) * scale,
    };
  }

  /* ---------------- forest scatter ---------------- */
  _generateForest() {
    const f = this.town.forest;
    if (!f) return [];
    const rnd = seeded(f.seed);
    const { w, h } = this.town.world;
    const exits = this.town.paths.filter((p) => p.exit);
    // Keep trees off structures (buildings sitting at the clearing edge).
    const keepClear = this.buildings.map((b) => ({
      x: b.def.x + b.w / 2, y: b.def.y + b.h / 2, r: Math.max(b.w, b.h) * 0.7,
    }));
    const out = [];

    for (let gy = 0; gy < h; gy += f.cellSize) {
      for (let gx = 0; gx < w; gx += f.cellSize) {
        if (rnd() > f.density) continue;
        const x = gx + (rnd() - 0.5) * f.jitter;
        const y = gy + (rnd() - 0.5) * f.jitter;
        if (pointInPolygon({ x, y }, this.clearing)) continue;     // keep clearing open
        let onRoad = false;                                         // keep roads clear
        for (const p of exits) {
          if (nearPolyline({ x, y }, p.points, p.width * 1.7)) { onRoad = true; break; }
        }
        if (onRoad) continue;
        let onBuilding = false;
        for (const k of keepClear) {
          if ((x - k.x) ** 2 + (y - k.y) ** 2 < k.r * k.r) { onBuilding = true; break; }
        }
        if (onBuilding) continue;
        const sprite = rnd() < 0.5 ? 'pineTree' : 'tree';
        const buf = structure(sprite);
        out.push({ def: { x, y, sprite }, buf, w: buf.w, h: buf.h, interactive: false });
      }
    }
    return out;
  }

  /* ---------------- terrain pre-render ---------------- */
  _renderTerrain() {
    const { w, h } = this.town.world;
    const buf = document.createElement('canvas');
    buf.width = w; buf.height = h;
    const c = buf.getContext('2d');
    c.imageSmoothingEnabled = false;
    const pat = (kind) => c.createPattern(tile(kind), 'repeat');

    // 1) Forest floor everywhere.
    c.fillStyle = pat('forest');
    c.fillRect(0, 0, w, h);

    // 2) Grass inside the clearing.
    const blob = buildSmoothPath(this.clearing, true);
    c.save(); c.clip(blob); c.fillStyle = pat('grass'); c.fillRect(0, 0, w, h); c.restore();
    c.save(); c.globalAlpha = 0.45; c.lineWidth = 12; c.strokeStyle = Palette.grass[0];
    c.stroke(blob); c.restore(); // soften the grass/forest seam

    // 3) Farm soil.
    const f = this.town.farm;
    if (f) {
      c.save(); c.beginPath(); c.rect(f.x, f.y, f.w, f.h); c.clip();
      c.fillStyle = pat('soil'); c.fillRect(f.x, f.y, f.w, f.h); c.restore();
      c.strokeStyle = Palette.dirt[0]; c.lineWidth = 2; c.strokeRect(f.x, f.y, f.w, f.h);
    }

    // 4) Curved beaten paths (drawn under the pad so ends tuck in).
    for (const p of this.town.paths) this._paintPath(c, p);

    // 5) Cobble pad ringing the fountain.
    const pad = this.town.fountainPad;
    c.save(); c.beginPath(); c.arc(pad.x, pad.y, pad.r, 0, Math.PI * 2); c.clip();
    c.fillStyle = pat('cobble'); c.fillRect(pad.x - pad.r, pad.y - pad.r, pad.r * 2, pad.r * 2);
    c.restore();
    c.lineWidth = 4; c.strokeStyle = Palette.stone[0];
    c.beginPath(); c.arc(pad.x, pad.y, pad.r, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.strokeStyle = Palette.stone[3];
    c.beginPath(); c.arc(pad.x, pad.y, pad.r - 3, 0, Math.PI * 2); c.stroke();

    return buf;
  }

  _paintPath(c, p) {
    const path = buildSmoothPath(p.points, false);
    c.save();
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = Palette.dirt[0]; c.lineWidth = p.width + 7; c.stroke(path); // worn edge
    c.strokeStyle = c.createPattern(tile('path'), 'repeat'); c.lineWidth = p.width; c.stroke(path);
    c.globalAlpha = 0.3; c.strokeStyle = Palette.dirt[0];
    c.lineWidth = Math.max(2, p.width * 0.4); c.stroke(path);                   // rut down the middle
    c.restore();
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
    this.hoverId = b ? b.def.id : null;
    this.canvas.style.cursor = this.hoverId ? 'pointer' : '';
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
    const zoom = this.camera.zoom;
    ctx.clearRect(0, 0, w, h);

    // Terrain: blit the whole world buffer through the camera transform.
    const origin = this.camera.toScreen(0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this._terrain, origin.x, origin.y,
      this.town.world.w * zoom, this.town.world.h * zoom);

    // Depth-sorted sprites, viewport-culled (the fog overlay handles
    // visibility, so fogged-but-onscreen sprites still fade naturally).
    const m = 90;
    for (const d of this._drawables) {
      if (!d.buf) continue;
      const s = this.camera.toScreen(d.def.x, d.def.y);
      const dw = d.w * zoom, dh = d.h * zoom;
      if (s.x + dw < -m || s.y + dh < -m || s.x > w + m || s.y > h + m) continue;

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

    // Shaped fog of war on top of the world.
    this.fog.render(ctx, this.camera);
  }
}
