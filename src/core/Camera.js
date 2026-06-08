/* =================================================================
   Camera — pan/zoom for the top-down town map, plus a tweenable
   cinematic mode used by the opening pull-back shot.

   Coordinates: world space (art pixels) <-> screen space (canvas px).
   ================================================================= */

export class Camera {
  constructor(world) {
    this.world = world;          // { w, h }
    this.x = world.w / 2;        // world point at viewport centre
    this.y = world.h / 2;
    this.zoom = 1;
    this.viewport = { w: 1, h: 1 };
    this._tween = null;          // active cinematic tween
  }

  setViewport(w, h) { this.viewport.w = w; this.viewport.h = h; }

  /** World -> screen. */
  toScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.zoom + this.viewport.w / 2,
      y: (wy - this.y) * this.zoom + this.viewport.h / 2,
    };
  }

  /** Screen -> world. */
  toWorld(sx, sy) {
    return {
      x: (sx - this.viewport.w / 2) / this.zoom + this.x,
      y: (sy - this.viewport.h / 2) / this.zoom + this.y,
    };
  }

  /** Pan by a screen-space delta (used while dragging). */
  panByScreen(dx, dy) {
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
    this._clamp();
  }

  zoomAt(sx, sy, factor) {
    const before = this.toWorld(sx, sy);
    this.zoom = Math.max(0.6, Math.min(3, this.zoom * factor));
    const after = this.toWorld(sx, sy);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
    this._clamp();
  }

  /** Keep the camera within the world bounds (with a small margin). */
  _clamp() {
    const halfW = this.viewport.w / 2 / this.zoom;
    const halfH = this.viewport.h / 2 / this.zoom;
    const m = 80;
    this.x = Math.max(halfW - m, Math.min(this.world.w - halfW + m, this.x));
    this.y = Math.max(halfH - m, Math.min(this.world.h - halfH + m, this.y));
  }

  /** Start a cinematic tween from current state to a target. */
  cinematic({ startZoom, endZoom, focus, durationMs }) {
    this.zoom = startZoom;
    this.x = focus.x;
    this.y = focus.y;
    this._tween = {
      t: 0, dur: durationMs,
      fromZoom: startZoom, toZoom: endZoom,
    };
  }

  get inCinematic() { return !!this._tween; }

  /** Advance any active tween. dt in ms. */
  update(dt) {
    if (!this._tween) return;
    const tw = this._tween;
    tw.t = Math.min(tw.dur, tw.t + dt);
    const p = tw.t / tw.dur;
    const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
    this.zoom = tw.fromZoom + (tw.toZoom - tw.fromZoom) * ease;
    if (p >= 1) this._tween = null;
  }
}
