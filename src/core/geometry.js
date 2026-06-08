/* =================================================================
   geometry.js — small 2D helpers shared by terrain, fog, and forest
   generation so the town's organic shape is defined in one place.

   - makeBlob:        an irregular closed outline (the town clearing)
   - buildSmoothPath: a Path2D smoothed through points (curved roads,
                      blobby outlines) — works in whatever space the
                      points are given (world for terrain, screen for fog)
   - pointInPolygon / nearPolyline: containment tests for placement
   - scalePolygon:    grow/shrink a polygon about a centre
   ================================================================= */

import { seeded } from '../art/pixelArt.js';

/**
 * An organic closed outline built from a few sine harmonics so the
 * radius wobbles smoothly around the centre. Deterministic per seed.
 * @returns {{x:number,y:number}[]} polygon vertices
 */
export function makeBlob({ cx, cy, radius, variation = 0.15, points = 16, seed = 1 }) {
  const rnd = seeded(seed);
  const harmonics = [
    { k: 2, a: 0.55, p: rnd() * Math.PI * 2 },
    { k: 3, a: 0.30, p: rnd() * Math.PI * 2 },
    { k: 5, a: 0.18, p: rnd() * Math.PI * 2 },
  ];
  const pts = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    let n = 0;
    for (const { k, a, p } of harmonics) n += a * Math.sin(k * t + p);
    const r = radius * (1 + variation * n);
    pts.push({ x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r });
  }
  return pts;
}

/**
 * Build a Path2D smoothed through the given points using quadratic
 * midpoint interpolation (cheap, no overshoot). Set `closed` for loops.
 */
export function buildSmoothPath(pts, closed) {
  const path = new Path2D();
  const n = pts.length;
  if (n === 0) return path;
  if (n === 1) { path.moveTo(pts[0].x, pts[0].y); return path; }
  if (n === 2) {
    path.moveTo(pts[0].x, pts[0].y);
    path.lineTo(pts[1].x, pts[1].y);
    return path;
  }
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  if (closed) {
    let start = mid(pts[n - 1], pts[0]);
    path.moveTo(start.x, start.y);
    for (let i = 0; i < n; i++) {
      const curr = pts[i];
      const m = mid(curr, pts[(i + 1) % n]);
      path.quadraticCurveTo(curr.x, curr.y, m.x, m.y);
    }
    path.closePath();
  } else {
    path.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < n - 1; i++) {
      const m = mid(pts[i], pts[i + 1]);
      path.quadraticCurveTo(pts[i].x, pts[i].y, m.x, m.y);
    }
    path.lineTo(pts[n - 1].x, pts[n - 1].y);
  }
  return path;
}

/** Ray-casting point-in-polygon test. */
export function pointInPolygon(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect =
      (yi > pt.y) !== (yj > pt.y) &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Squared distance from a point to a segment. */
function distSqToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx, cy = a.y + t * dy;
  return (p.x - cx) ** 2 + (p.y - cy) ** 2;
}

/** True if `pt` is within `dist` of any segment of the polyline. */
export function nearPolyline(pt, points, dist) {
  const d2 = dist * dist;
  for (let i = 0; i < points.length - 1; i++) {
    if (distSqToSegment(pt, points[i], points[i + 1]) <= d2) return true;
  }
  return false;
}

/** Scale a polygon about a centre (grow with f>1, shrink with f<1). */
export function scalePolygon(poly, cx, cy, f) {
  return poly.map((p) => ({ x: cx + (p.x - cx) * f, y: cy + (p.y - cy) * f }));
}
