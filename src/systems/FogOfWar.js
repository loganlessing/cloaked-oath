/* =================================================================
   FogOfWar — hides the world outside the explored area.

   The revealed region is shape-based, not a flat circle: it follows
   the town clearing outline plus the exit roads, so the fog hugs the
   organic town/forest silhouette. It is rendered on an offscreen
   layer and blurred, giving a soft, gradual fade into darkness.

   Future systems reveal more by emitting Events.FOG_REVEAL with a
   { x, y, r } circle (e.g. opening a gate or entering a new area).
   ================================================================= */

import { bus, Events } from '../core/EventBus.js';
import { buildSmoothPath, pointInPolygon, nearPolyline } from '../core/geometry.js';

export class FogOfWar {
  /**
   * @param {object} mask
   *   polygon   - world-space clearing outline (revealed area)
   *   corridors - [{ points, width }] roads revealed into the forest
   *   circles   - [{ x, y, r }] extra revealed discs (dynamic)
   */
  constructor({ polygon = [], corridors = [], circles = [] } = {}) {
    this.polygon = polygon;
    this.corridors = corridors;
    this.circles = circles.map((c) => ({ ...c }));
    this.blur = 30;             // softness of the fade (screen px)

    this._layer = document.createElement('canvas');
    this._lctx = this._layer.getContext('2d');

    bus.on(Events.FOG_REVEAL, (region) => this.circles.push({ ...region }));
  }

  /** Is a world point currently within the revealed area? */
  isRevealed(wx, wy) {
    const p = { x: wx, y: wy };
    if (this.polygon.length && pointInPolygon(p, this.polygon)) return true;
    for (const c of this.corridors) if (nearPolyline(p, c.points, c.width / 2)) return true;
    for (const c of this.circles) if ((wx - c.x) ** 2 + (wy - c.y) ** 2 <= c.r * c.r) return true;
    return false;
  }

  /** Draw the fog over the map (called after terrain/props/buildings). */
  render(ctx, camera) {
    const { w, h } = camera.viewport;
    const lc = this._lctx;
    if (this._layer.width !== w || this._layer.height !== h) {
      this._layer.width = Math.max(1, w);
      this._layer.height = Math.max(1, h);
    }

    // 1) Solid veil over the whole viewport.
    lc.globalCompositeOperation = 'source-over';
    lc.filter = 'none';
    lc.clearRect(0, 0, w, h);
    lc.fillStyle = 'rgba(5, 4, 10, 0.98)';
    lc.fillRect(0, 0, w, h);

    // 2) Erase the revealed shape with a blur, so the veil fades
    //    smoothly along the town/forest silhouette.
    lc.globalCompositeOperation = 'destination-out';
    lc.filter = `blur(${this.blur}px)`;
    lc.fillStyle = '#000';
    lc.strokeStyle = '#000';
    lc.lineCap = 'round';
    lc.lineJoin = 'round';

    if (this.polygon.length) {
      const sp = this.polygon.map((p) => camera.toScreen(p.x, p.y));
      lc.fill(buildSmoothPath(sp, true));
    }
    for (const c of this.corridors) {
      const cs = c.points.map((p) => camera.toScreen(p.x, p.y));
      lc.lineWidth = (c.width || 60) * camera.zoom;
      lc.stroke(buildSmoothPath(cs, false));
    }
    for (const c of this.circles) {
      const s = camera.toScreen(c.x, c.y);
      lc.beginPath();
      lc.arc(s.x, s.y, c.r * camera.zoom, 0, Math.PI * 2);
      lc.fill();
    }

    // 3) Composite the finished fog over the world.
    lc.filter = 'none';
    lc.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this._layer, 0, 0, w, h);
  }
}
