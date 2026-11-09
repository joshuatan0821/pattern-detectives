// Everything drawn on a canvas: pixel sprites and tiles, buildings, battle backgrounds, badges, the math Figures, and animations.
// Figures follow each pattern's exact rule (mirroring, 60° turns, regular polygons, the golden angle).
import { POLY } from "./questions.js";

export const TILE = 16;
export const px = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const OUTLINE = "#1c2230";
// Lighten (amt > 0) or darken (amt < 0) a "#rrggbb" colour.
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16), f = (v) => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
  return `#${[16, 8, 0].map((s) => f((n >> s) & 255).toString(16).padStart(2, "0")).join("")}`;
}
// A repeatable 0–1 number for a tile, so its tufts and pebbles stay put from frame to frame.
const hash = (x, y, s = 0) => { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s + 1, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const circle = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
const oval = (c, x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); };

// ---------- people (16 × 16, drawn once per look/frame/direction, then outlined and cached) ----------
function personBase(c, p, frame, dir) {
  const skin = "#f6c49a", skinD = "#d99a72", eye = OUTLINE, hatD = shade(p.hat, -0.3), hatL = shade(p.hat, 0.3);
  const shirtD = shade(p.shirt, -0.28), shoe = "#3a2a20", side = dir === "left" || dir === "right";
  const lL = frame === 1 ? 2 : 3, rL = frame === 2 ? 2 : 3; // one leg lifts per walking frame
  px(c, p.pants, 5, 12, 2, lL); px(c, p.pants, 9, 12, 2, rL);
  px(c, shoe, 5, 12 + lL, 2, 1); px(c, shoe, 9, 12 + rL, 2, 1);
  px(c, p.shirt, 4, 8, 8, 5); px(c, shirtD, 4, 12, 8, 1); px(c, shirtD, 11, 8, 1, 4);
  if (p.coat) { px(c, "#c8d0dc", 4, 8, 1, 5); px(c, "#c8d0dc", 11, 8, 1, 5); px(c, "#6a7890", 7, 8, 2, 4); }
  const swing = side ? 0 : frame === 1 ? 1 : frame === 2 ? -1 : 0; // arms swing opposite the legs
  px(c, p.shirt, 3, 8 + Math.max(0, swing), 1, 3); px(c, skin, 3, 11 + Math.max(0, swing), 1, 1);
  px(c, p.shirt, 12, 8 + Math.max(0, -swing), 1, 3); px(c, skin, 12, 11 + Math.max(0, -swing), 1, 1);
  if (dir === "up") { // back of the head, and the backpack
    px(c, p.hat, 4, 1, 8, 7); px(c, hatL, 5, 1, 5, 1); px(c, hatD, 4, 6, 8, 1);
    if (p.pack) { px(c, p.pack, 5, 8, 6, 4); px(c, shade(p.pack, -0.3), 5, 11, 6, 1); px(c, shade(p.pack, 0.25), 6, 9, 4, 1); }
    return;
  }
  px(c, skin, 5, 3, 6, 5); px(c, skinD, 10, 4, 1, 4);
  px(c, p.hat, 4, 1, 8, 3); px(c, hatL, 5, 1, 5, 1);
  px(c, hatD, dir === "left" ? 2 : dir === "right" ? 5 : 3, 3, 9, 1); // the brim points the way you face
  if (dir === "down") { px(c, eye, 6, 5, 1, 2); px(c, eye, 9, 5, 1, 2); px(c, skinD, 7, 7, 2, 1); }
  if (dir === "left") { px(c, eye, 6, 5, 1, 2); px(c, skin, 4, 5, 1, 2); }
  if (dir === "right") { px(c, eye, 9, 5, 1, 2); px(c, skin, 11, 5, 1, 2); }
  if (p.glasses) px(c, eye, dir === "right" ? 8 : 5, 5, dir === "down" ? 6 : 3, 1);
  if (side && p.pack) px(c, p.pack, dir === "left" ? 11 : 3, 8, 2, 4);
}
function outline(c) { // a dark pixel on every empty pixel that touches the sprite
  const ctx = c.getContext("2d"), d = ctx.getImageData(0, 0, 16, 16).data;
  const on = (x, y) => x >= 0 && y >= 0 && x < 16 && y < 16 && d[(y * 16 + x) * 4 + 3] > 0;
  ctx.fillStyle = OUTLINE;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (!on(x, y) && (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1))) ctx.fillRect(x, y, 1, 1);
}
const SPRITES = new Map();
export function drawPerson(c, x, y, p, frame = 0, dir = "down") {
  const key = [p.hat, p.shirt, p.pants, p.glasses, p.coat, p.pack, frame, dir].join();
  let s = SPRITES.get(key);
  if (!s) { s = document.createElement("canvas"); s.width = s.height = 16; personBase(s.getContext("2d"), p, frame, dir); outline(s); SPRITES.set(key, s); }
  c.drawImage(s, x, y);
}
export const drawShadow = (c, X, Y) => oval(c, X + 8, Y + 15, 5, 2, "rgba(0,0,0,.22)");
export function drawBang(c, X, Y) { px(c, OUTLINE, X + 4, Y - 11, 8, 10); px(c, "#fff", X + 5, Y - 10, 6, 8); px(c, "#d04030", X + 7, Y - 9, 2, 4); px(c, "#d04030", X + 7, Y - 4, 2, 1); }

// ---------- tiles ----------
export const PALETTES = {
  town: { grass: "#88d070", dot: "#6cb858", lite: "#a8e48c", tall: "#5fa844", blade: "#3a7f2c", path: "#e8d4a0", pathDot: "#d4bc84" },
  garden: { grass: "#98d878", dot: "#78c060", lite: "#bcecA0", tall: "#68b048", blade: "#3a7f2c", path: "#ecd8b0", pathDot: "#d8c090" },
  hive: { grass: "#c8d070", dot: "#aab450", lite: "#e0e498", tall: "#a0a840", blade: "#6a7424", path: "#f0d890", pathDot: "#d8bc70" },
  field: { grass: "#a8d060", dot: "#8cb844", lite: "#c8e488", tall: "#80a838", blade: "#4a7a20", path: "#e8d4a0", pathDot: "#d4bc84" },
  lab: { floor: "#d8c8a8", floorDot: "#c8b898", wall: "#8a7a68", wallTop: "#a89880", rug: "#b05040" },
};
// nb(dx, dy) gives the neighbouring tile, so paths and water can draw their edges; time animates water and grass.
export function drawTile(c, t, X, Y, pal, tx = 0, ty = 0, nb = () => ".", time = 0) {
  const P = PALETTES[pal];
  if (pal === "lab") return labTile(c, t, X, Y, P, tx, ty);
  if (t === "=" || t === "E") path(c, X, Y, P, tx, ty, nb);
  else if (t === ",") tall(c, X, Y, P, tx, ty, time);
  else if (t === "Q" && pal === "garden") water(c, X, Y, tx, ty, nb, time);
  else grass(c, X, Y, P, tx, ty);
  if (t === "E") { px(c, "#a07848", X + 2, Y + 12, 12, 3); px(c, "#806038", X + 7, Y + 6, 2, 6); px(c, "#806038", X + 5, Y + 9, 6, 1); } // way out
  if (t === "T") tree(c, X, Y);
  if (t === "I") sign(c, X, Y);
  if (t === "G") flowers(c, X, Y, tx, ty);
  if (t === "V" || (t === "Q" && pal === "hive")) hive(c, X, Y);
  if (t === "S" || (t === "Q" && pal === "field")) bigSunflower(c, X, Y);
  if (t === "q") {
    if (pal === "garden") flowers(c, X, Y, tx, ty);
    if (pal === "hive") for (const [a, b] of [[4, 5], [11, 10]]) { px(c, "#f8e060", X + a - 1, Y + b, 3, 1); px(c, "#f8e060", X + a, Y + b - 1, 1, 3); px(c, "#c07820", X + a, Y + b, 1, 1); }
    if (pal === "field") for (const [a, b] of [[4, 7], [11, 12]]) { px(c, "#3f7a20", X + a, Y + b, 1, 4); px(c, "#f8c830", X + a - 1, Y + b - 2, 3, 2); px(c, "#6b3a1a", X + a, Y + b - 2, 1, 1); }
  }
}
function grass(c, X, Y, P, tx, ty) {
  px(c, P.grass, X, Y, 16, 16);
  for (let i = 0; i < 4; i++) { // little tufts
    const x = 1 + Math.floor(hash(tx, ty, i) * 13), y = 2 + Math.floor(hash(ty, tx, i + 7) * 12);
    px(c, P.dot, X + x, Y + y, 1, 2); px(c, P.dot, X + x + 1, Y + y + 1, 1, 1); px(c, P.lite, X + x, Y + y - 1, 1, 1);
  }
  if (hash(tx, ty, 99) < 0.07) { const fx = 4 + Math.floor(hash(tx, ty, 5) * 8), fy = 4 + Math.floor(hash(tx, ty, 6) * 8); px(c, "#fff", X + fx, Y + fy, 2, 2); px(c, "#f0c040", X + fx, Y + fy, 1, 1); }
}
function path(c, X, Y, P, tx, ty, nb) {
  px(c, P.path, X, Y, 16, 16);
  for (let i = 0; i < 3; i++) px(c, P.pathDot, X + 1 + Math.floor(hash(tx, ty, i + 20) * 13), Y + 1 + Math.floor(hash(ty, tx, i + 30) * 13), 2, 1);
  const edge = shade(P.path, -0.2), isPath = (dx, dy) => "=EGVSD".includes(nb(dx, dy));
  if (!isPath(0, -1)) px(c, edge, X, Y, 16, 1);
  if (!isPath(0, 1)) px(c, edge, X, Y + 15, 16, 1);
  if (!isPath(-1, 0)) px(c, edge, X, Y, 1, 16);
  if (!isPath(1, 0)) px(c, edge, X + 15, Y, 1, 16);
}
function tall(c, X, Y, P, tx, ty, time) {
  px(c, P.tall, X, Y, 16, 16);
  const sway = Math.sin(time / 450 + tx * 0.9 + ty * 0.6) > 0.35 ? 1 : 0; // blade tips lean in the breeze
  for (const [a, b] of [[1, 3], [5, 1], [9, 4], [13, 2], [3, 9], [7, 8], [11, 10]]) {
    px(c, P.blade, X + a, Y + b + 1, 1, 4); px(c, P.blade, X + a + 1, Y + b + 2, 1, 3); px(c, P.lite, X + a + sway, Y + b, 1, 1);
  }
}
function water(c, X, Y, tx, ty, nb, time) {
  px(c, "#4a9ad8", X, Y, 16, 16);
  const off = Math.floor(time / 220 + tx * 5 + ty * 3) % 16; // ripples drift across
  px(c, "#8ccff2", X + off % 12, Y + 4, 4, 1); px(c, "#8ccff2", X + (off + 7) % 12, Y + 10, 3, 1);
  const foam = "#d6f0fb";
  if (nb(0, -1) !== "Q") px(c, foam, X, Y, 16, 1);
  if (nb(0, 1) !== "Q") px(c, "#3a7ab8", X, Y + 15, 16, 1);
  if (nb(-1, 0) !== "Q") px(c, foam, X, Y, 1, 16);
  if (nb(1, 0) !== "Q") px(c, "#3a7ab8", X + 15, Y, 1, 16);
}
function tree(c, X, Y) {
  oval(c, X + 8, Y + 14, 6, 2, "rgba(0,0,0,.2)");
  px(c, "#5a3a20", X + 7, Y + 10, 3, 5); px(c, "#7a5230", X + 7, Y + 10, 1, 5);
  circle(c, X + 8, Y + 7, 7, "#1e5e2c"); circle(c, X + 7, Y + 6, 6, "#2f7d3a"); circle(c, X + 6, Y + 5, 3.5, "#48a050"); px(c, "#74c878", X + 5, Y + 3, 2, 1);
}
function sign(c, X, Y) {
  px(c, OUTLINE, X + 6, Y + 8, 4, 8); px(c, "#8a6a40", X + 7, Y + 8, 2, 8);
  px(c, OUTLINE, X + 1, Y + 2, 14, 9); px(c, "#d8a868", X + 2, Y + 3, 12, 7); px(c, "#b88848", X + 2, Y + 9, 12, 1);
  px(c, "#6a4a28", X + 4, Y + 5, 8, 1); px(c, "#6a4a28", X + 4, Y + 7, 6, 1);
}
function flowers(c, X, Y, tx, ty) {
  const cols = ["#f080a0", "#ffffff", "#f0d040", "#c890f0"];
  for (const [a, b] of [[3, 3], [10, 4], [6, 10], [12, 11]]) {
    const col = cols[Math.floor(hash(tx + a, ty + b) * cols.length)];
    px(c, "#3a7f2c", X + a, Y + b + 2, 1, 2);
    px(c, col, X + a - 1, Y + b, 3, 1); px(c, col, X + a, Y + b - 1, 1, 3); px(c, "#f8e080", X + a, Y + b, 1, 1);
  }
}
function hive(c, X, Y) {
  oval(c, X + 8, Y + 15, 6, 1.5, "rgba(0,0,0,.2)");
  oval(c, X + 8, Y + 9, 6.5, 6.5, "#7a5010"); oval(c, X + 8, Y + 9, 6, 6, "#e8b830");
  px(c, "#b88418", X + 3, Y + 6, 10, 1); px(c, "#b88418", X + 2, Y + 9, 12, 1); px(c, "#b88418", X + 3, Y + 12, 10, 1);
  px(c, "#f8d868", X + 6, Y + 4, 3, 1); px(c, "#402810", X + 7, Y + 12, 2, 2);
}
function bigSunflower(c, X, Y) {
  px(c, "#3f8a30", X + 7, Y + 8, 2, 8); px(c, "#58a840", X + 9, Y + 11, 3, 2);
  circle(c, X + 8, Y + 6, 6, "#c89010"); circle(c, X + 8, Y + 6, 5, "#f8d030"); circle(c, X + 8, Y + 6, 2.5, "#6b3a1a"); px(c, "#8a5a2a", X + 7, Y + 5, 1, 1);
}
function labTile(c, t, X, Y, P, tx, ty) {
  if ("WKA".includes(t)) {
    px(c, P.wall, X, Y, 16, 16); px(c, P.wallTop, X, Y, 16, 3); px(c, shade(P.wall, -0.2), X, Y + 15, 16, 1);
    if (t === "K") { // a bookshelf with books of different colours and heights
      px(c, "#5a3a20", X + 1, Y + 3, 14, 13); px(c, "#7a5230", X + 1, Y + 9, 14, 1);
      for (let i = 0; i < 6; i++) { const col = ["#c04830", "#3878c8", "#48a050", "#e0a020", "#8048b0", "#d8d0c0"][Math.floor(hash(tx, i) * 6)], h = 3 + Math.floor(hash(i, tx) * 2);
        px(c, col, X + 2 + i * 2, Y + 9 - h, 2, h); px(c, col, X + 2 + i * 2, Y + 15 - h, 2, h); }
    }
    if (t === "A") { px(c, "#f2efe6", X + 1, Y + 3, 14, 11); px(c, "#a8d8f0", X + 2, Y + 4, 12, 9); px(c, "#e0f4fc", X + 3, Y + 5, 3, 2); px(c, "#f2efe6", X + 7, Y + 4, 2, 9); }
    return;
  }
  px(c, P.floor, X, Y, 16, 16); px(c, shade(P.floor, -0.06), X, Y + 15, 16, 1); px(c, shade(P.floor, -0.06), X + 15, Y, 1, 16); // floorboards
  px(c, P.floorDot, X + 3, Y + 5, 2, 1); px(c, P.floorDot, X + 11, Y + 11, 2, 1);
  if (t === "B") { px(c, "#5a3a20", X, Y + 13, 16, 2); px(c, "#8a5a32", X, Y + 2, 16, 11); px(c, "#a8784a", X, Y + 2, 16, 2);
    if ((tx + ty) % 2) { px(c, "#f8f0d8", X + 3, Y + 5, 7, 5); px(c, "#9aa3ad", X + 4, Y + 6, 5, 1); px(c, "#9aa3ad", X + 4, Y + 8, 4, 1); }
    else { px(c, "#a8d8f0", X + 6, Y + 3, 4, 7); px(c, "#58a070", X + 6, Y + 7, 4, 3); } } // papers and a flask
  if (t === "R") { px(c, P.rug, X, Y, 16, 16); px(c, "#e0b050", X + 2, Y + 2, 12, 1); px(c, "#e0b050", X + 2, Y + 13, 12, 1); px(c, shade(P.rug, -0.2), X + 7, Y + 5, 2, 6); }
  if (t === "E") { px(c, "#3f7d5a", X + 1, Y + 1, 14, 14); px(c, "#58a070", X + 3, Y + 3, 10, 10); }
}
export function drawLock(c, X, Y) { c.fillStyle = "rgba(20,30,40,.45)"; c.fillRect(X, Y, 16, 16); px(c, "#c0c8d0", X + 5, Y + 7, 6, 6); px(c, "#c0c8d0", X + 6, Y + 4, 1, 3); px(c, "#c0c8d0", X + 9, Y + 4, 1, 3); px(c, "#c0c8d0", X + 6, Y + 4, 4, 1); px(c, "#4a5568", X + 7, Y + 9, 2, 2); }
export function drawStar(c, X, Y) { px(c, OUTLINE, X + 11, Y, 5, 5); px(c, "#f8d030", X + 12, Y + 1, 3, 3); }

// ---------- buildings ----------
const LETTERS = { L: ["100", "100", "100", "100", "111"], A: ["010", "101", "111", "101", "101"], B: ["110", "101", "110", "101", "110"] };
function word(c, text, X, Y, col) { [...text].forEach((ch, i) => LETTERS[ch].forEach((row, y) => [...row].forEach((b, x) => b === "1" && px(c, col, X + i * 4 + x, Y + y, 1, 1)))); }
export function drawLab(c, X, Y) { // 3 × 2 tiles with the door in the middle of the bottom row
  oval(c, X + 24, Y + 31, 26, 3, "rgba(0,0,0,.2)");
  px(c, OUTLINE, X - 2, Y, 52, 13);
  for (let r = 0; r < 4; r++) px(c, r % 2 ? "#b8432c" : "#c85438", X - 1, Y + 1 + r * 3, 50, 3); // shingle rows
  px(c, "#e07050", X - 1, Y + 1, 50, 1);
  px(c, OUTLINE, X, Y + 12, 48, 20); px(c, "#f2efe6", X + 1, Y + 12, 46, 19);
  for (let r = 0; r < 6; r++) px(c, "#dcd6c8", X + 1, Y + 14 + r * 3, 46, 1); // siding
  for (const wx of [4, 34]) { px(c, OUTLINE, wx + X - 1, Y + 15, 12, 9); px(c, "#78b8e8", wx + X, Y + 16, 10, 7); px(c, "#c8e8f8", wx + X + 1, Y + 17, 3, 2); px(c, "#f2efe6", wx + X + 5, Y + 16, 1, 7); }
  px(c, OUTLINE, X + 18, Y + 19, 12, 13); px(c, "#6b4a2a", X + 19, Y + 20, 10, 12); px(c, "#8a6040", X + 19, Y + 20, 10, 1); px(c, "#f0c040", X + 26, Y + 26, 1, 1);
  px(c, OUTLINE, X + 15, Y + 13, 18, 7); px(c, "#2850a0", X + 16, Y + 14, 16, 5); word(c, "LAB", X + 19, Y + 14, "#ffffff");
}
export function drawStore(c, X, Y) { // the sari-sari store, 2 × 2 tiles, with snacks hanging in the window
  oval(c, X + 16, Y + 31, 17, 3, "rgba(0,0,0,.2)");
  px(c, OUTLINE, X, Y + 8, 32, 24); px(c, "#c89858", X + 1, Y + 9, 30, 22);
  for (let r = 0; r < 7; r++) px(c, "#b07e44", X + 1, Y + 11 + r * 3, 30, 1); // planks
  px(c, OUTLINE, X + 3, Y + 12, 26, 11); px(c, "#3a2818", X + 4, Y + 13, 24, 9);
  for (let i = 0; i < 8; i++) { const col = ["#e04848", "#f0c040", "#48a0e0", "#58b070"][i % 4]; px(c, col, X + 5 + i * 3, Y + 13, 2, 3); } // hanging snack packs
  for (let i = 0; i < 6; i++) { const col = ["#f0f0e8", "#e07040", "#f0c040"][i % 3]; px(c, col, X + 6 + i * 4, Y + 18, 2, 3); px(c, "#ffffff", X + 6 + i * 4, Y + 18, 1, 1); } // bottles and jars
  px(c, "#8a5a32", X + 2, Y + 22, 28, 3); px(c, "#a8784a", X + 2, Y + 22, 28, 1); // counter
  px(c, OUTLINE, X - 2, Y, 36, 10);
  for (let i = 0; i < 9; i++) px(c, i % 2 ? "#f8f8f0" : "#e04848", X - 1 + i * 4, Y + 1, 4, 7); // striped awning
  for (let i = 0; i < 9; i++) px(c, i % 2 ? "#f8f8f0" : "#e04848", X - 1 + i * 4 + 1, Y + 8, 2, 2); // scalloped edge
}
export function drawJeep(c, X, Y) { // a jeepney, 2 × 1 tiles
  oval(c, X + 16, Y + 15, 15, 2, "rgba(0,0,0,.25)");
  px(c, OUTLINE, X, Y + 1, 32, 12);
  px(c, "#d8dce4", X + 1, Y + 2, 30, 10); px(c, "#f4f6f8", X + 1, Y + 2, 30, 1);
  px(c, "#e04040", X + 1, Y + 7, 30, 1); px(c, "#f0c040", X + 1, Y + 8, 30, 1); px(c, "#3878c8", X + 1, Y + 9, 30, 1);
  for (const wx of [8, 14, 20, 26]) { px(c, "#1c2230", wx + X - 1, Y + 3, 6, 4); px(c, "#78b8e8", wx + X, Y + 3, 4, 3); }
  px(c, "#a8b0bc", X + 1, Y + 4, 5, 3); px(c, "#c0c8d0", X + 2, Y + 1, 2, 1); // bonnet with the little silver horse
  px(c, "#f8f0a0", X + 1, Y + 9, 1, 2); px(c, "#e04040", X + 30, Y + 9, 1, 2);
  for (const wx of [4, 22]) { circle(c, X + wx + 2.5, Y + 13, 3, OUTLINE); circle(c, X + wx + 2.5, Y + 13, 1.2, "#9aa3ad"); }
}

// ---------- battle backgrounds ----------
const SCENES = [
  { sky: ["#8fd3f4", "#d8f2fb"], far: "#86c890", ground: "#a8d880", top: "#c4e8a0", rim: "#6aa848" }, // the Garden
  { sky: ["#f6c870", "#fdf0c8"], far: "#e0b050", ground: "#e8cf78", top: "#f6e4a0", rim: "#b8902c" }, // the Beehive
  { sky: ["#9ad8f0", "#eaf7fc"], far: "#9cc850", ground: "#cfe08a", top: "#e2f0a8", rim: "#94b040" }, // the Sunflower Field
  { sky: ["#c8b898", "#e8e0d0"], far: "#8a7a68", ground: "#d8c8a8", top: "#e8dcc0", rim: "#b0a080" }, // the Field Station
];
export function drawBattleBg(c, w, h, level) {
  const s = SCENES[Math.min(level, 3)], horizon = h * 0.52, indoor = level >= 3;
  const g = c.createLinearGradient(0, 0, 0, horizon); g.addColorStop(0, s.sky[0]); g.addColorStop(1, s.sky[1]);
  c.fillStyle = g; c.fillRect(0, 0, w, horizon);
  if (indoor) { // bookshelves along the back wall
    for (let x = 0; x < w; x += 40) { px(c, "#5a3a20", x + 2, horizon * 0.25, 36, horizon * 0.75); for (let i = 0; i < 8; i++) px(c, ["#c04830", "#3878c8", "#48a050", "#e0a020"][(x / 40 + i) % 4], x + 5 + i * 4, horizon * 0.35, 3, horizon * 0.22); }
  } else {
    for (const [cx, cy, r] of [[w * 0.18, h * 0.12, 14], [w * 0.55, h * 0.08, 10], [w * 0.8, h * 0.16, 12]]) { oval(c, cx, cy, r * 1.8, r * 0.7, "rgba(255,255,255,.85)"); oval(c, cx + r * 0.6, cy - r * 0.3, r, r * 0.6, "rgba(255,255,255,.85)"); }
    c.fillStyle = s.far; c.beginPath(); c.moveTo(0, horizon); // rolling hills
    for (let x = 0; x <= w; x += 4) c.lineTo(x, horizon - 14 - 8 * Math.sin(x / 37) - 5 * Math.sin(x / 13));
    c.lineTo(w, horizon); c.fill();
    if (level === 1) for (let x = 6; x < w; x += 22) { // honeycomb on the hills
      c.strokeStyle = "rgba(160,110,20,.5)"; c.lineWidth = 1; c.beginPath();
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; c.lineTo(x + 6 * Math.cos(a), horizon - 12 + 6 * Math.sin(a)); } c.closePath(); c.stroke();
    }
    if (level === 2) for (let x = 4; x < w; x += 12) { px(c, "#3f8a30", x + 2, horizon - 12, 1, 12); circle(c, x + 2.5, horizon - 13, 3, "#f8c830"); circle(c, x + 2.5, horizon - 13, 1.2, "#6b3a1a"); }
    if (level === 0) for (let x = 8; x < w; x += 18) { circle(c, x, horizon - 6, 6, "#5aa86a"); px(c, ["#f080a0", "#ffffff", "#f0d040"][x % 3], x - 1, horizon - 9, 2, 2); }
  }
  px(c, s.ground, 0, horizon, w, h - horizon);
  for (let i = 0; i < 40; i++) px(c, shade(s.ground, -0.08), Math.floor(hash(i, level) * w), horizon + Math.floor(hash(level, i) * (h - horizon)), 3, 1);
  for (const [cx, cy, rx, ry] of [[w * 0.7, h * 0.66, w * 0.2, h * 0.075], [w * 0.2, h * 0.94, w * 0.17, h * 0.08]]) { // the two battle platforms
    oval(c, cx, cy + 3, rx, ry, s.rim); oval(c, cx, cy, rx, ry, s.top); oval(c, cx - rx * 0.2, cy - ry * 0.25, rx * 0.5, ry * 0.4, shade(s.top, 0.25));
  }
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
  c.stroke();
  if (on) { c.fillStyle = "rgba(255,255,255,.45)"; c.beginPath(); c.ellipse(-8, -10, 6, 3, -0.6, 0, 7); c.fill(); } // shine
  c.restore();
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
