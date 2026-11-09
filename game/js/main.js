// Starts the game: loads the Steps, wires up keyboard, mouse and touch input, and shows the title screen.
import { S, onUnlock } from "./state.js";
import { loadLevels, ACHIEVEMENTS } from "./content.js";
import { $, title, page, next, boxOpen, isChoosing, choiceKey, overlayOpen, menu, notebook, badgeCase, townMap, toast, toggleMute } from "./ui.js";
import { move, act, clickMap, startWorld } from "./world.js";
import { battleKey } from "./battle.js";
import { audioOn } from "./audio.js";

const DIRS = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };

function key(k) {
  if (boxOpen()) { if (["Enter", " ", "z"].includes(k)) next(); return; }
  if (k === "m") return toggleMute();
  if (S.mode === "battle") return battleKey(k);
  if (S.mode === "page") { if (k === "Escape" && S.back) S.back(); return; }
  if (S.mode !== "map" || S.busy || !S.name) return;
  if (DIRS[k]) { S.path = []; return move(...DIRS[k]); }
  if (["Enter", " ", "z"].includes(k)) return act();
  if (k === "Escape" || k === "p") return menu();
  if (k === "n") return notebook();
  if (k === "b") return badgeCase();
  if (k === "t") return townMap();
}
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === "x") { S.ffwd = true; return; }
  if (isChoosing()) return choiceKey(k, e);
  if (overlayOpen()) return; // the character picker uses ordinary button focus
  if (k.startsWith("Arrow") || k === " " || (k === "Enter" && (S.mode !== "page" || boxOpen()))) e.preventDefault();
  if (e.repeat && !DIRS[k]) return;
  key(k);
});
document.addEventListener("keyup", (e) => { if (e.key.toLowerCase() === "x") S.ffwd = false; });
$("#map").addEventListener("click", clickMap);
$("#box").addEventListener("click", next);
$("#mute").onclick = () => { audioOn(); toggleMute(); };
$("#menuBtn").onclick = () => { if (S.mode === "map" && !boxOpen() && !S.busy) menu(); };
document.querySelectorAll("#pad button[data-k]").forEach((b) => (b.onclick = () => { audioOn(); key(b.dataset.k); }));
const padB = $("#padB");
padB.onpointerdown = () => (S.ffwd = true);
padB.onpointerup = padB.onpointerleave = () => (S.ffwd = false);
onUnlock((id) => toast(`Achievement unlocked: ${ACHIEVEMENTS[id][0]}`));

startWorld();
try {
  await loadLevels();
  title();
} catch (err) {
  page(`<div class="page note"><h2>Couldn't load the Steps</h2><p>${err.message}</p>
    <p>Open the game through a local web server (see the README), not by double-clicking index.html.</p></div>`);
}
