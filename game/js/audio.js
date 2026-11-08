// Placeholder chiptune sounds made in code. Adrian's real music and effects replace these later.
import { settings } from "./state.js";

let AC = null;
export function audioOn() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); AC.resume(); } catch {} }

function tone(f, dur, type = "square", when = 0, vol = 1, slideTo) {
  if (!AC || settings.muted || !settings.vol) return;
  const t = AC.currentTime + when, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.07 * settings.vol * vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + 0.05);
}
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
