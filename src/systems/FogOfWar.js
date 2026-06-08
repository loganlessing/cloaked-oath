/* =================================================================
   FogOfWar — hides the world outside revealed regions.

   Revealed regions are world-space circles. The system renders a dark
   overlay and "punches" soft holes where the world is known. Future
   systems reveal more by emitting Events.FOG_REVEAL with { x, y, r },
   enabling exploration/backtracking gates without touching this file.
   ================================================================= */

import { bus, Events } from '../core/EventBus.js';

export class FogOfWar {
  constructor(regions = []) {
    this.regions = regions.map((r) => ({ ...r })); // clone
    // Offscreen layer so "punching" holes only erases the veil, never
    // the terrain/buildings beneath it on the main canvas.
    this._layer = document.createElement('canvas');
    this._lctx = this._layer.getContext('2d');
    bus.on(Events.FOG_REVEAL, (region) => this.reveal(region));
  }

  reveal(region) {
    this.regions.push({ ...region });
  }

  /** Is a world point currently visible? */
  isRevealed(wx, wy) {
    return this.regions.some(
      (r) => (wx - r.x) ** 2 + (wy - r.y) ** 2 <= r.r * r.r
    );
  }

  /**
   * Draw fog over the map. Called after terrain/buildings so it sits
   * on top. `ctx` is the map canvas 2D context (screen space).
   */
  render(ctx, camera) {
    const { w, h } = camera.viewport;
    const lctx = this._lctx;

    // Size the fog layer to the viewport (in CSS px; ctx is already
    // DPR-scaled, so we match the camera viewport dimensions).
    if (this._layer.width !== w || this._layer.height !== h) {
      this._layer.width = Math.max(1, w);
      this._layer.height = Math.max(1, h);
    }

    // 1) Dark veil over the whole fog layer.
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, w, h);
    lctx.fillStyle = 'rgba(6, 5, 12, 0.96)';
    lctx.fillRect(0, 0, w, h);

    // 2) Punch soft holes for revealed regions — only erases the veil
    //    on this layer, so terrain underneath is untouched.
    lctx.globalCompositeOperation = 'destination-out';
    for (const r of this.regions) {
      const c = camera.toScreen(r.x, r.y);
      const rad = r.r * camera.zoom;
      const grad = lctx.createRadialGradient(c.x, c.y, rad * 0.6, c.x, c.y, rad);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = grad;
      lctx.beginPath();
      lctx.arc(c.x, c.y, rad, 0, Math.PI * 2);
      lctx.fill();
    }

    // 3) Composite the finished fog layer over the world.
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this._layer, 0, 0, w, h);
  }
}
