// Placeholder chiptune made in code: sound effects plus three looping songs. Adrian's real music and effects replace these later.
import { settings } from "./state.js";

let AC = null;
export function audioOn() {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume(); if (music.name && !music.timer) startMusic(); } catch {}
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

// ---------- music: each song is a chord progression played as arpeggios over a bass line ----------
const CHORDS = { C: [60, 4], Dm: [62, 3], Em: [64, 3], E: [64, 4], F: [65, 4], G: [67, 4], Am: [57, 3] }; // root (MIDI) and third
function compose(bpm, progression, lead, bass) { // one bar per chord, eight eighth-notes per bar; odd bars play the arpeggio backwards
  const steps = [];
  progression.forEach((name, bar) => {
    const [root, third] = CHORDS[name], tones = [0, third, 7, 12], pat = bar % 2 ? [...lead].reverse() : lead;
    for (let i = 0; i < 8; i++) steps.push({ lead: pat[i] == null ? null : root + 12 + tones[pat[i]], bass: bass[i] == null ? null : root - 12 + (bass[i] ? 7 : 0) });
  });
  return { bpm, steps };
}
const SONGS = {
  title: compose(92, ["F", "G", "Em", "Am", "F", "G", "C", "C"], [0, null, 1, 2, 3, 2, 1, null], [0, null, null, null, 1, null, null, null]),
  town: compose(116, ["C", "G", "Am", "F", "C", "F", "G", "C"], [0, 2, 1, 2, 3, 2, 1, 2], [0, null, 1, null, 0, null, 1, null]),
  battle: compose(152, ["Am", "Am", "F", "G", "Am", "Am", "Dm", "E"], [0, 0, 2, 0, 3, 0, 2, 1], [0, 0, 0, 0, 0, 0, 1, 1]),
};
const music = { name: null, step: 0, next: 0, timer: null };
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
export function playMusic(name) {
  if (music.name === name) return;
  Object.assign(music, { name, step: 0 }); clearInterval(music.timer); music.timer = null;
  if (AC && name) startMusic();
}
function startMusic() { music.next = AC.currentTime + 0.1; music.timer = setInterval(schedule, 30); }
function schedule() { // queue the notes due in the next 150 ms
  const song = SONGS[music.name], dt = 60 / song.bpm / 2;
  if (music.next < AC.currentTime - 0.05) music.next = AC.currentTime + 0.05; // the tab was asleep: skip ahead rather than burst
  while (music.next < AC.currentTime + 0.15) {
    const s = song.steps[music.step % song.steps.length];
    if (s.lead) voice(midi(s.lead), music.next, dt * 0.85, "square", 0.028);
    if (s.bass) voice(midi(s.bass), music.next, dt * 0.95, "triangle", 0.07);
    music.next += dt; music.step++;
  }
}
