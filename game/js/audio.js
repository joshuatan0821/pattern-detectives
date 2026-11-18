// Sound effects are short chiptune blips made in code; the music is three looping MP3 files.
import { settings } from "./state.js";

let AC = null;
export function audioOn() {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume(); if (music.name && !music.src) startMusic(); } catch {}
}
function voice(freq, start, dur, type, vol, slideTo) {
  if (!AC || settings.muted || !settings.vol) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, start); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(vol * settings.vol, start); g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(AC.destination); o.start(start); o.stop(start + dur + 0.05);
}
const tone = (f, dur, type = "square", when = 0, vol = 1, slideTo) => AC && voice(f, AC.currentTime + when, dur, type, 0.07 * vol, slideTo);
const notes = (seq, step, type) => seq.forEach((f, i) => f && tone(f, step * 0.9, type, i * step));

export const SFX = {
  blip: () => tone(1400, 0.025, "square", 0, 0.35),
  bump: () => tone(110, 0.08, "square", 0, 0.6),
  select: () => { tone(988, 0.05); tone(1319, 0.08, "square", 0.05); },
  wrong: () => { tone(196, 0.2, "sawtooth"); tone(147, 0.3, "sawtooth", 0.15); },
  hit: () => tone(900, 0.3, "square", 0, 1, 150),
  door: () => notes([392, 523], 0.07),
  find: () => notes([784, 988, 1175, 1568], 0.07),
  spotted: () => notes([880, 0, 880], 0.06),
  encounter: () => notes([659, 0, 659, 0, 784, 880], 0.08),
  win: () => notes([523, 659, 784, 1047, 0, 784, 1047], 0.1),
  badge: () => notes([523, 523, 523, 659, 0, 587, 659, 0, 784, 1047], 0.12, "triangle"),
};

// ---------- music: three looping MP3s in assets/audio (made with scripts/render-music.mjs) ----------
const music = { name: null, src: null, gain: null, buffers: {} };
const MUSIC_LEVEL = 0.14; // the files are normalised loud; this matches the sound effects
async function loadSong(name) {
  if (!music.buffers[name]) music.buffers[name] = fetch(`assets/audio/music-${name}.mp3`).then((r) => r.arrayBuffer()).then((b) => AC.decodeAudioData(b));
  return music.buffers[name];
}
export function playMusic(name) {
  if (music.name === name) return;
  music.name = name;
  if (music.src) { try { music.src.stop(); } catch {} music.src = null; }
  if (AC && name) startMusic();
}
async function startMusic() {
  const name = music.name;
  if (!music.gain) {
    music.gain = AC.createGain(); music.gain.connect(AC.destination);
    setInterval(() => { music.gain.gain.value = settings.muted ? 0 : settings.vol * MUSIC_LEVEL; }, 100); // follow the volume slider and mute button
  }
  let buf;
  try { buf = await loadSong(name); } catch { return; }
  if (music.name !== name || music.src) return; // the song changed while it was loading
  const src = AC.createBufferSource();
  src.buffer = buf; src.loop = true; src.connect(music.gain); src.start();
  music.src = src;
}
