// Everything drawn on a canvas: pixel sprites and tiles, badges, the math Figures, and looping animations.
// Figures follow each pattern's exact rule (mirroring, 60° turns, regular polygons, the golden angle).
import { POLY } from "./questions.js";

export const TILE = 16;
export const px = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

// ---------- people ----------
export function drawPerson(c, x, y, p, frame = 0, dir = "down") { // frames 1 and 2 lift one leg for the walk cycle
  const skin = "#f8c8a0", eye = "#202830";
  px(c, p.hat, x + 4, y + 1, 8, 3);
  if (dir === "up") px(c, p.hat, x + 4, y + 4, 8, 5); // back of the head
  else {
    px(c, p.hat, x + (dir === "left" ? 2 : dir === "right" ? 4 : 3), y + 3, 10, 1); // the brim points the way you face
    px(c, skin, x + 5, y + 4, 6, 5);
    if (p.glasses) px(c, eye, x + (dir === "right" ? 7 : 5), y + 6, dir === "down" ? 6 : 4, 1);
    else if (dir === "left") px(c, eye, x + 6, y + 6, 1, 1);
    else if (dir === "right") px(c, eye, x + 9, y + 6, 1, 1);
    else { px(c, eye, x + 6, y + 6, 1, 1); px(c, eye, x + 9, y + 6, 1, 1); }
  }
  px(c, p.shirt, x + 4, y + 9, 8, 4); px(c, skin, x + 3, y + 9, 1, 3); px(c, skin, x + 12, y + 9, 1, 3);
  if (p.coat) { px(c, "#a0a8b8", x + 4, y + 9, 1, 4); px(c, "#a0a8b8", x + 11, y + 9, 1, 4); }
  px(c, p.pants, x + 5, y + 13, 2, frame === 1 ? 2 : 3); px(c, p.pants, x + 9, y + 13, 2, frame === 2 ? 2 : 3);
}
export function drawBang(c, X, Y) { px(c, "#283040", X + 4, Y - 11, 8, 10); px(c, "#fff", X + 5, Y - 10, 6, 8); px(c, "#d04030", X + 7, Y - 9, 2, 4); px(c, "#d04030", X + 7, Y - 4, 2, 1); }

// ---------- tiles ----------
export const PALETTES = {
  town: { grass: "#88d070", dot: "#70b858", tall: "#68b048", blade: "#3f8a30", path: "#e8d4a0", pathDot: "#d4bc84" },
  garden: { grass: "#98d878", dot: "#78c060", tall: "#70b850", blade: "#3f8a30", path: "#ecd8b0", pathDot: "#d8c090" },
  hive: { grass: "#c8d070", dot: "#b0b858", tall: "#a8b048", blade: "#707a28", path: "#f0d890", pathDot: "#d8bc70" },
  field: { grass: "#a8d060", dot: "#90b848", tall: "#88b040", blade: "#4a7a20", path: "#e8d4a0", pathDot: "#d4bc84" },
  lab: { floor: "#d8c8a8", floorDot: "#c8b898", wall: "#8a7a68", wallTop: "#a89880", rug: "#b05040" },
};
export function drawTile(c, t, X, Y, pal) {
  const P = PALETTES[pal];
  if (pal === "lab") return labTile(c, t, X, Y, P);
  if (t === "=" || t === "E") { px(c, P.path, X, Y, 16, 16); px(c, P.pathDot, X + 3, Y + 5, 2, 1); px(c, P.pathDot, X + 11, Y + 11, 2, 1); }
  else if (t === ",") { px(c, P.tall, X, Y, 16, 16); for (const [a, b] of [[2, 3], [9, 2], [5, 9], [12, 10]]) { px(c, P.blade, X + a, Y + b, 1, 4); px(c, P.blade, X + a + 2, Y + b, 1, 4); } }
  else { px(c, P.grass, X, Y, 16, 16); px(c, P.dot, X + 3, Y + 4, 2, 1); px(c, P.dot, X + 11, Y + 9, 2, 1); px(c, P.dot, X + 6, Y + 13, 2, 1); }
  if (t === "E") { px(c, "#a07848", X + 2, Y + 12, 12, 3); px(c, "#806038", X + 7, Y + 6, 2, 6); px(c, "#806038", X + 5, Y + 9, 6, 1); } // arrow out
  if (t === "T") { px(c, "#6b4a2a", X + 6, Y + 11, 4, 5); c.fillStyle = "#2f7d3a"; c.beginPath(); c.arc(X + 8, Y + 7, 7, 0, 7); c.fill(); px(c, "#48a050", X + 4, Y + 3, 3, 2); }
  if (t === "I") { px(c, "#7a5a32", X + 7, Y + 9, 2, 7); px(c, "#c89858", X + 2, Y + 3, 12, 7); px(c, "#7a5a32", X + 4, Y + 5, 8, 1); px(c, "#7a5a32", X + 4, Y + 7, 6, 1); }
  if (t === "G") flowers(c, X, Y);
  if (t === "V" || (t === "Q" && pal === "hive")) hive(c, X, Y);
  if (t === "S" || (t === "Q" && pal === "field")) sunflowerTile(c, X, Y);
  if (t === "Q" && pal === "garden") { px(c, "#58a8e0", X, Y, 16, 16); px(c, "#90cff0", X + 3, Y + 5, 5, 1); px(c, "#90cff0", X + 9, Y + 11, 4, 1); }
  if (t === "q") {
    if (pal === "garden") flowers(c, X, Y);
    if (pal === "hive") for (const [a, b] of [[4, 5], [11, 10]]) { px(c, "#f8e060", X + a - 1, Y + b, 3, 1); px(c, "#f8e060", X + a, Y + b - 1, 1, 3); }
    if (pal === "field") for (const [a, b] of [[4, 6], [11, 11]]) { px(c, "#4a7a20", X + a, Y + b, 1, 4); px(c, "#f8d030", X + a - 1, Y + b - 2, 3, 2); }
  }
}
function flowers(c, X, Y) { for (const [a, b, col] of [[3, 3, "#f080a0"], [10, 4, "#fff"], [6, 10, "#f0d040"], [12, 11, "#f080a0"]]) { px(c, col, X + a - 1, Y + b, 3, 1); px(c, col, X + a, Y + b - 1, 1, 3); } }
function hive(c, X, Y) { c.fillStyle = "#e8b830"; c.beginPath(); c.ellipse(X + 8, Y + 9, 6, 6, 0, 0, 7); c.fill(); px(c, "#a87818", X + 3, Y + 7, 10, 1); px(c, "#a87818", X + 3, Y + 11, 10, 1); px(c, "#402810", X + 7, Y + 12, 2, 2); }
function sunflowerTile(c, X, Y) { px(c, "#3f8a30", X + 7, Y + 8, 2, 8); c.fillStyle = "#f8d030"; c.beginPath(); c.arc(X + 8, Y + 6, 5, 0, 7); c.fill(); c.fillStyle = "#6b3a1a"; c.beginPath(); c.arc(X + 8, Y + 6, 2, 0, 7); c.fill(); }
function labTile(c, t, X, Y, P) {
  if ("WKA".includes(t)) {
    px(c, P.wall, X, Y, 16, 16); px(c, P.wallTop, X, Y, 16, 3);
    if (t === "K") { px(c, "#6b4a2a", X + 1, Y + 3, 14, 13); for (const [x, col] of [[2, "#c04830"], [5, "#3878c8"], [8, "#48a050"], [11, "#e0a020"]]) { px(c, col, X + x, Y + 5, 2, 4); px(c, col, X + x + 1, Y + 11, 2, 4); } }
    if (t === "A") { px(c, "#a8d8f0", X + 2, Y + 4, 12, 9); px(c, P.wallTop, X + 7, Y + 4, 2, 9); }
    return;
  }
  px(c, P.floor, X, Y, 16, 16); px(c, P.floorDot, X + 3, Y + 5, 2, 1); px(c, P.floorDot, X + 11, Y + 11, 2, 1);
  if (t === "B") { px(c, "#8a5a32", X, Y + 2, 16, 12); px(c, "#a8784a", X, Y + 2, 16, 2); px(c, "#f8f0d8", X + 4, Y + 5, 6, 4); }
  if (t === "R") { px(c, P.rug, X, Y, 16, 16); px(c, "#e0b050", X + 2, Y + 2, 12, 1); px(c, "#e0b050", X + 2, Y + 13, 12, 1); }
  if (t === "E") { px(c, "#3f7d5a", X + 1, Y + 1, 14, 14); px(c, "#58a070", X + 3, Y + 3, 10, 10); }
}
export function drawLock(c, X, Y) { c.fillStyle = "rgba(20,30,40,.45)"; c.fillRect(X, Y, 16, 16); px(c, "#c0c8d0", X + 5, Y + 7, 6, 6); px(c, "#c0c8d0", X + 6, Y + 4, 1, 3); px(c, "#c0c8d0", X + 9, Y + 4, 1, 3); px(c, "#c0c8d0", X + 6, Y + 4, 4, 1); }
export function drawStar(c, X, Y) { px(c, "#f8d030", X + 12, Y + 1, 3, 3); }
export function drawLab(c, X, Y) { // 3 × 2 tiles with the door in the middle of the bottom row
  px(c, "#c04830", X - 1, Y + 1, 50, 10); px(c, "#e06848", X - 1, Y + 1, 50, 2);
  px(c, "#f0f0e8", X, Y + 11, 48, 21); px(c, "#78b8e8", X + 4, Y + 15, 8, 6); px(c, "#78b8e8", X + 36, Y + 15, 8, 6);
  px(c, "#6b4a2a", X + 20, Y + 20, 8, 12); px(c, "#283040", X + 9, Y + 3, 30, 6); px(c, "#f8f8f0", X + 11, Y + 5, 26, 2);
}
export function drawStore(c, X, Y) { // the sari-sari store, 2 × 2 tiles
  px(c, "#6aa0d8", X - 1, Y + 1, 34, 8); for (let i = 0; i < 34; i += 6) px(c, "#f0f0e8", X - 1 + i, Y + 1, 3, 8);
  px(c, "#c89858", X, Y + 9, 32, 23); px(c, "#5a3a20", X + 3, Y + 13, 26, 8); px(c, "#f0c040", X + 5, Y + 15, 4, 4); px(c, "#e05050", X + 11, Y + 15, 4, 4); px(c, "#58a070", X + 17, Y + 15, 4, 4); px(c, "#f0f0e8", X + 23, Y + 15, 4, 4);
  px(c, "#8a5a32", X + 2, Y + 22, 28, 3);
}
export function drawJeep(c, X, Y) { // a jeepney, 2 × 1 tiles
  px(c, "#d8d8e0", X + 1, Y + 3, 30, 9); px(c, "#e04040", X + 1, Y + 7, 30, 2); px(c, "#3878c8", X + 1, Y + 10, 30, 1);
  px(c, "#78b8e8", X + 4, Y + 4, 5, 3); px(c, "#78b8e8", X + 11, Y + 4, 5, 3); px(c, "#78b8e8", X + 18, Y + 4, 5, 3); px(c, "#78b8e8", X + 25, Y + 4, 4, 3);
  px(c, "#f0c040", X + 9, Y + 1, 14, 2); px(c, "#202830", X + 5, Y + 12, 5, 4); px(c, "#202830", X + 22, Y + 12, 5, 4);
}

// ---------- badges ----------
export function drawBadge(c, i, on) {
  const col = on ? ["#3fa78a", "#e0a020", "#e06a30"][i] : "#9aa3ad", dark = on ? "#283040" : "#6b7480";
  c.save(); c.translate(32, 32); c.fillStyle = col; c.strokeStyle = dark; c.lineWidth = 3; c.beginPath();
  if (i === 0) { c.moveTo(0, -26); c.lineTo(22, 0); c.lineTo(0, 26); c.lineTo(-22, 0); }
  if (i === 1) for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; c.lineTo(26 * Math.cos(a), 26 * Math.sin(a)); }
  if (i === 2) c.arc(0, 0, 25, 0, 7);
  c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.lineWidth = 2;
  if (i === 0) { c.moveTo(0, -20); c.lineTo(0, 20); }
  if (i === 1) for (let k = 0; k < 3; k++) { const a = Math.PI / 2 + k * 2 * Math.PI / 3; c.moveTo(0, 0); c.lineTo(15 * Math.cos(a), 15 * Math.sin(a)); }
  if (i === 2) for (let t = 0; t < 12; t += 0.2) { const r = 1.6 * Math.exp(0.22 * t); c.lineTo(r * Math.cos(t), r * Math.sin(t)); }
  c.stroke(); c.restore();
}

// ---------- math Figures ----------
const COL = { ink: "#2f2a24", wing: "#e07a3f", gold: "#d39b2a", wax: "#f0c75e", seed: "#5b3a1e", ice: "#4c7fb0", hl: "#d04030" };
export function wingPath(ctx, altSpots) { // left wing, body at x = 0
  ctx.beginPath();
  ctx.moveTo(0, -5); ctx.bezierCurveTo(-30, -75, -100, -80, -92, -25); ctx.bezierCurveTo(-88, 2, -40, 6, 0, 5);
  ctx.moveTo(0, 5); ctx.bezierCurveTo(-50, 10, -78, 58, -46, 66); ctx.bezierCurveTo(-24, 72, -8, 40, 0, 15);
  ctx.fillStyle = COL.wing; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = COL.ink; ctx.stroke();
  const spots = altSpots ? [[-30, -40, 8, COL.ink], [-70, -20, 6, COL.ink], [-30, 30, 9, COL.gold]]
                         : [[-62, -38, 10, COL.ink], [-36, -14, 5, COL.ink], [-44, 46, 8, COL.gold]];
  for (const [x, y, r, c] of spots) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = c; ctx.fill(); }
}
export function butterflyBody(ctx) { ctx.beginPath(); ctx.ellipse(0, 5, 5, 45, 0, 0, 7); ctx.fillStyle = COL.ink; ctx.fill(); }
export function drawFlake(ctx, r, ang, highlight, alpha, arms = 6) { // evenly spaced arms; arm `highlight` drawn in red
  ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = "round"; ctx.lineWidth = 4;
  for (let k = 0; k < arms; k++) {
    ctx.save(); ctx.rotate(ang - Math.PI / 2 + k * 2 * Math.PI / arms); ctx.strokeStyle = k === highlight ? COL.hl : COL.ice;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0);
    for (const s of [0.45, 0.72]) { ctx.moveTo(r * s, 0); ctx.lineTo(r * s + r * 0.2, -r * 0.18); ctx.moveTo(r * s, 0); ctx.lineTo(r * s + r * 0.2, r * 0.18); }
    ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
const label = (ctx, text, x, y, size, color = COL.hl) => { ctx.font = `${size}px Georgia`; ctx.fillStyle = color; ctx.fillText(text, x, y); };
const dashed = (ctx, x1, y1, x2, y2) => { ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = COL.hl; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); };
const polyPoint = (n, R, k) => [R * Math.cos(-Math.PI / 2 + k * 2 * Math.PI / n), R * Math.sin(-Math.PI / 2 + k * 2 * Math.PI / n)];

export const FIG = {
  butterfly(ctx, w, h, f) {
    ctx.translate(w / 2, h / 2); const s = Math.min(h / 170, w / 200); ctx.scale(s, s);
    wingPath(ctx);
    ctx.save();
    if (f.right === "mirror") { ctx.scale(-1, 1); wingPath(ctx); }
    if (f.right === "copy") { ctx.translate(95, 0); wingPath(ctx); }
    if (f.right === "rotate") { ctx.rotate(Math.PI); wingPath(ctx); }
    if (f.right === "spots") { ctx.scale(-1, 1); wingPath(ctx, true); }
    ctx.restore();
    butterflyBody(ctx);
    if (f.right === "missing") {
      ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, 85); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, "?", 40, 15, 48, COL.ink);
    }
    if (f.hl) { dashed(ctx, 0, -85, 0, 90); label(ctx, "fold here", 8, -70, 16); }
  },
  snowflake(ctx, w, h, f) {
    ctx.translate(w / 2, h / 2); const r = Math.min(w, h) * 0.42, missing = f.missing || 0;
    ctx.strokeStyle = COL.ice; ctx.lineCap = "round";
    for (let k = 0; k < f.arms; k++) {
      const gone = k >= f.arms - missing, a = -Math.PI / 2 + k * 2 * Math.PI / f.arms;
      ctx.save(); ctx.rotate(a);
      ctx.lineWidth = 4; ctx.globalAlpha = gone ? 0.25 : 1; if (gone) ctx.setLineDash([5, 7]);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0);
      for (const t of [0.45, 0.72]) { ctx.moveTo(r * t, 0); ctx.lineTo(r * t + r * 0.2, -r * 0.18); ctx.moveTo(r * t, 0); ctx.lineTo(r * t + r * 0.2, r * 0.18); }
      ctx.stroke(); ctx.restore();
      if (gone) {
        label(ctx, "?", Math.cos(a) * r * 0.6 - 8, Math.sin(a) * r * 0.6 + 10, 28, COL.ink);
        if (f.hl) { ctx.save(); ctx.strokeStyle = COL.hl; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.32, 0, 7); ctx.stroke(); ctx.restore(); label(ctx, "count me too", -r, r + 2, 14); }
      }
    }
  },
  tiles(ctx, w, h, f) { // copies of a regular n-gon around one corner; a gap shows if 360° isn't a multiple of the corner angle
    const n = f.sides, ext = 2 * Math.PI / n, interior = Math.PI - ext;
    const fits = Math.floor(2 * Math.PI / interior + 1e-9), count = f.count ?? fits;
    const L = (Math.min(w, h) / 2 - 6) * Math.sin(Math.PI / n);
    ctx.translate(w / 2, h / 2);
    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, d = i * interior;
      ctx.beginPath(); ctx.moveTo(0, 0);
      for (let s = 0; s < n; s++) { x += L * Math.cos(d); y += L * Math.sin(d); ctx.lineTo(x, y); d += ext; }
      const overlaps = (i + 1) * interior > 2 * Math.PI + 1e-9;
      ctx.fillStyle = overlaps ? "rgba(208,64,48,.55)" : i % 2 ? COL.wax : COL.gold; ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.stroke();
    }
    if (f.hl && count * interior < 2 * Math.PI - 1e-9) { // shade the gap
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, L * 0.9, count * interior, 2 * Math.PI); ctx.closePath();
      ctx.fillStyle = "rgba(208,64,48,.4)"; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fillStyle = "#b5533c"; ctx.fill();
  },
  honeycomb(ctx, w, h, f) {
    const r = h / 7, dx = r * Math.sqrt(3);
    for (let row = -1; row < 8; row++) for (let col = -1; col < w / dx + 1; col++) {
      const cx = col * dx + (row & 1 ? dx / 2 : 0), cy = row * r * 1.5;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); }
      ctx.closePath(); ctx.fillStyle = COL.wax; ctx.fill(); ctx.strokeStyle = COL.gold; ctx.lineWidth = 3; ctx.stroke();
    }
    const vx = 2 * dx + dx / 2, vy = 3 * r * 1.5 - r; // top corner of a hexagon in an odd row, shared by three cells
    if (f.hl) { // the three 120° corners at that point: between edges going 30°, 150°, and 270°
      [[30, 150], [150, 270], [270, 390]].forEach(([a, b], i) => {
        ctx.beginPath(); ctx.moveTo(vx, vy); ctx.arc(vx, vy, r * 0.45, a * Math.PI / 180, b * Math.PI / 180); ctx.closePath();
        ctx.fillStyle = ["rgba(208,64,48,.6)", "rgba(40,80,160,.5)", "rgba(63,125,90,.55)"][i]; ctx.fill();
      });
    }
    ctx.beginPath(); ctx.arc(vx, vy, 6, 0, 7); ctx.fillStyle = "#b5533c"; ctx.fill();
    label(ctx, f.hl ? "120° + 120° + 120°" : "3 × 120° = ?", vx + 12, vy - 8, Math.round(h / 10), COL.ink);
  },
  sunflower(ctx, w, h, f) { // seeds at the golden angle; spiral counts come out as Fibonacci numbers
    const m = Math.min(w, h), R = m * 0.34, N = 600, golden = Math.PI * (3 - Math.sqrt(5));
    const seed = (i) => [R * Math.sqrt(i / N) * Math.cos(i * golden), R * Math.sqrt(i / N) * Math.sin(i * golden)];
    ctx.translate(w / 2, h / 2);
    for (let i = 0; i < 26; i++) { ctx.save(); ctx.rotate(i * 2 * Math.PI / 26); ctx.beginPath(); ctx.ellipse(R + m * 0.06, 0, m * 0.07, m * 0.028, 0, 0, 7); ctx.fillStyle = "#f8c830"; ctx.fill(); ctx.restore(); }
    for (let i = 1; i <= N; i++) { const [x, y] = seed(i); ctx.beginPath(); ctx.arc(x, y, m * 0.01, 0, 7); ctx.fillStyle = COL.seed; ctx.fill(); }
    const family = f.family || (f.hl ? 21 : 0);
    if (family) { // seeds i and i + 21 (or + 34) are neighbours, so joining them traces one family of spirals
      ctx.strokeStyle = family === 21 ? "rgba(208,64,48,.8)" : "rgba(40,80,160,.8)"; ctx.lineWidth = Math.max(1, m * 0.006);
      for (let i = 80; i + family <= N; i++) { const [x1, y1] = seed(i), [x2, y2] = seed(i + family); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    }
  },
  ratios(ctx, w, h, f) {
    const rows = [["8 ÷ 5", "= 1.6"], ["13 ÷ 8", "= 1.625"], ["21 ÷ 13", "≈ 1.615"], ["34 ÷ 21", "≈ ?"]];
    ctx.font = `${Math.round(h / 7)}px Georgia`; ctx.fillStyle = COL.ink;
    rows.forEach(([a, b], i) => { const y = (i + 1) * h / 4.6; ctx.textAlign = "right"; ctx.fillText(a, w / 2 - 8, y); ctx.textAlign = "left"; ctx.fillText(b, w / 2 + 8, y); });
    if (f.hl) { ctx.strokeStyle = COL.hl; ctx.lineWidth = 3; ctx.strokeRect(w * 0.18, 4 * h / 4.6 - h / 6, w * 0.64, h / 4.6); }
  },
  trio(ctx, w, h) {
    const parts = [["butterfly", { right: "mirror" }], ["honeycomb", {}], ["sunflower", {}]], cw = w / 3;
    parts.forEach(([t, f], i) => {
      ctx.save(); ctx.translate(i * cw + 4, 4); ctx.beginPath(); ctx.rect(0, 0, cw - 8, h - 8); ctx.clip();
      FIG[t](ctx, cw - 8, h - 8, f); ctx.restore();
    });
  },
  polygon(ctx, w, h, f) {
    const n = f.sides, R = Math.min(w, h) * 0.38;
    ctx.translate(w / 2, h / 2 + R * 0.08);
    ctx.beginPath(); for (let k = 0; k < n; k++) ctx.lineTo(...polyPoint(n, R, k)); ctx.closePath();
    ctx.fillStyle = COL.wax; ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.stroke();
    if (f.angle) { // mark the corner at the top
      const [x0, y0] = polyPoint(n, R, 0), [x1, y1] = polyPoint(n, R, 1), [x2, y2] = polyPoint(n, R, n - 1);
      const a1 = Math.atan2(y1 - y0, x1 - x0), a2 = Math.atan2(y2 - y0, x2 - x0);
      ctx.beginPath(); ctx.arc(x0, y0, R * 0.28, Math.min(a1, a2), Math.max(a1, a2)); ctx.strokeStyle = COL.hl; ctx.lineWidth = 3; ctx.stroke();
      label(ctx, "?", x0 - 6, y0 + R * 0.45, Math.round(R * 0.3), COL.hl);
    }
    if (f.hl) for (let k = 0; k < n; k++) { // the n lines of symmetry run through the center at multiples of 180° ÷ n
      const a = -Math.PI / 2 + k * Math.PI / n; dashed(ctx, -1.15 * R * Math.cos(a), -1.15 * R * Math.sin(a), 1.15 * R * Math.cos(a), 1.15 * R * Math.sin(a));
    }
  },
  sequence(ctx, w, h, f) {
    const text = `${f.terms.join(", ")}, ?`;
    let size = Math.round(h / 5); ctx.font = `${size}px Georgia`;
    while (ctx.measureText(text).width > w - 16 && size > 10) { size--; ctx.font = `${size}px Georgia`; }
    ctx.fillStyle = COL.ink; ctx.textAlign = "center"; ctx.fillText(text, w / 2, h / 2 + size / 3);
    if (f.hl) { const t = f.terms; label(ctx, `${t.at(-2)} + ${t.at(-1)} = ?`, w / 2, h / 2 + size * 1.6, Math.round(size * 0.8)); }
  },
  fraction(ctx, w, h, f) {
    ctx.textAlign = "center"; label(ctx, `${f.b} ÷ ${f.a}`, w / 2, h / 2, Math.round(h / 4), COL.ink); label(ctx, "≈ ?", w / 2, h / 2 + h / 4, Math.round(h / 6), COL.ink);
    if (f.hl) label(ctx, "neighbouring Fibonacci numbers", w / 2, h - 8, Math.round(h / 12));
  },
};
export function drawFigure(canvas, fig) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save(); FIG[fig.type](ctx, canvas.width, canvas.height, fig); ctx.restore();
}
// Text descriptions of Figures for screen readers.
export function describe(f) {
  if (!f) return "";
  const butterfly = { missing: "Butterfly with its right half missing", mirror: "Butterfly whose right wing mirrors the left",
    copy: "Butterfly with the left wing slid across without flipping", rotate: "Butterfly with the right wing upside down",
    spots: "Butterfly with mirrored wings but different spots" };
  switch (f.type) {
    case "butterfly": return butterfly[f.right];
    case "snowflake": return `Snowflake with ${f.arms - (f.missing || 0)} of ${f.arms} evenly spaced arms`;
    case "tiles": return `Regular ${POLY[f.sides]} tiles placed around one corner`;
    case "honeycomb": return "Honeycomb with a marked point where three cells meet";
    case "sunflower": return "Sunflower head with seeds arranged in spirals";
    case "ratios": return "The ratios 8 ÷ 5, 13 ÷ 8, 21 ÷ 13, and 34 ÷ 21";
    case "trio": return "A butterfly, a honeycomb, and a sunflower";
    case "polygon": return `A regular ${POLY[f.sides]}`;
    case "sequence": return `The numbers ${f.terms.join(", ")}, then a blank`;
    case "fraction": return `${f.b} divided by ${f.a}`;
  }
  return "";
}

// ---------- looping animations (notebook entries and the title screen) ----------
const smooth = (p) => p * p * (3 - 2 * p);
let animTok = 0;
export const stopAnims = () => animTok++;
export function runAnim(canvas, kind) {
  const tok = ++animTok, ctx = canvas.getContext("2d"), t0 = performance.now();
  const loop = (now) => {
    if (tok !== animTok || !canvas.isConnected) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ANIM[kind](ctx, canvas.width, canvas.height, (now - t0) / 1000); ctx.restore();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
const FIB = [1, 1]; while (FIB.length < 14) FIB.push(FIB.at(-1) + FIB.at(-2));
const ANIM = {
  reflect(ctx, w, h, t) { // a copy of the left wing flips across the line of symmetry onto the right side
    const e = smooth(Math.min(1, (t % 4) / 1.8)), k = Math.cos(Math.PI * e);
    label(ctx, e < 1 ? "Flip across the line of symmetry…" : "…and it matches the other side exactly.", 10, 20, 16, COL.ink);
    ctx.translate(w / 2, h / 2 + 12); const s = Math.min(h / 190, w / 220); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha = 0.2; ctx.scale(-1, 1); wingPath(ctx); ctx.restore();
    wingPath(ctx);
    ctx.save(); ctx.globalAlpha = 0.85; ctx.scale(k, 1); wingPath(ctx); ctx.restore();
    butterflyBody(ctx); dashed(ctx, 0, -85, 0, 90);
  },
  rotate(ctx, w, h, t) { // the snowflake turns 60° at a time and lands on its own outline
    const step = Math.floor(t / 2), p = smooth(Math.min(1, (t % 2) / 0.9));
    label(ctx, `Turned ${((step + (p >= 1 ? 1 : 0)) % 6) * 60 || 360}°: it lands on itself every 60°.`, 10, 20, 16, COL.ink);
    ctx.translate(w / 2, h / 2 + 10); const r = Math.min(w, h) * 0.38;
    drawFlake(ctx, r, 0, -1, 0.2); drawFlake(ctx, r, (step + p) * Math.PI / 3, 0, 1);
  },
  ratioGraph(ctx, w, h, t) { // Fibonacci ratios F(n+1) ÷ F(n) settling toward φ, revealed one point at a time
    const L = 44, Rr = w - 14, T = 30, B = h - 26, y = (v) => B - ((v - 0.9) / 1.2) * (B - T), x = (n) => L + ((n - 1) / 11) * (Rr - L);
    const shown = Math.min(12, Math.floor((t % 10) * 2) + 1), phi = (1 + Math.sqrt(5)) / 2;
    ctx.strokeStyle = "#9aa3ad"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(Rr, B); ctx.stroke();
    ctx.font = "12px Georgia"; ctx.fillStyle = COL.ink; ctx.textAlign = "right";
    for (const v of [1, 1.5, 2]) ctx.fillText(v.toFixed(1), L - 6, y(v) + 4);
    ctx.textAlign = "left"; dashed(ctx, L, y(phi), Rr, y(phi)); label(ctx, "φ ≈ 1.618", Rr - 74, y(phi) - 8, 13);
    label(ctx, "F(n + 1) ÷ F(n)", 10, 18, 14, COL.ink);
    ctx.strokeStyle = COL.ice; ctx.lineWidth = 2; ctx.beginPath();
    for (let n = 1; n <= shown; n++) ctx.lineTo(x(n), y(FIB[n] / FIB[n - 1]));
    ctx.stroke();
    for (let n = 1; n <= shown; n++) { ctx.beginPath(); ctx.arc(x(n), y(FIB[n] / FIB[n - 1]), 4, 0, 7); ctx.fillStyle = COL.ice; ctx.fill(); }
    label(ctx, `${FIB[shown]} ÷ ${FIB[shown - 1]} ≈ ${(FIB[shown] / FIB[shown - 1]).toFixed(3)}`, L + 8, B - 8, 13, COL.ink);
  },
  title(ctx, w, h, t) { // a spinning sunflower with a butterfly fluttering around it
    ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(t * 0.15); ctx.translate(-h / 2, -h / 2); FIG.sunflower(ctx, h, h, {}); ctx.restore();
    const bx = w / 2 + Math.cos(t * 0.7) * w * 0.38, by = h / 2 + Math.sin(t * 1.4) * h * 0.3, flap = 0.3 + 0.7 * Math.abs(Math.sin(t * 9));
    ctx.translate(bx, by); ctx.scale(0.22, 0.22);
    ctx.save(); ctx.scale(flap, 1); wingPath(ctx); ctx.restore();
    ctx.save(); ctx.scale(-flap, 1); wingPath(ctx); ctx.restore();
    butterflyBody(ctx);
  },
};
