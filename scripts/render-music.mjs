// Renders the three chiptune songs to MP3 files in game/assets/audio/.
// The notes are the same ones the game used to play live with the Web Audio API (see the git history of game/js/audio.js).
// Needs `lame` on the PATH. Run: node scripts/render-music.mjs
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

const RATE = 44100;
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
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const wave = { square: (p) => (p < 0.5 ? 1 : -1), triangle: (p) => 4 * Math.abs(p - 0.5) - 1 };

// One note: a wave that fades out exponentially, like the game's gain ramp to 0.0001.
function addVoice(buf, freq, start, dur, type, vol) {
  const s0 = Math.round(start * RATE), n = Math.round(dur * RATE), k = Math.log(0.0001 / vol) / n;
  for (let i = 0; i < n; i++) {
    const j = (s0 + i) % buf.length; // wrap the tail into the start so the loop is seamless
    buf[j] += wave[type]((freq * i / RATE) % 1) * vol * Math.exp(k * i);
  }
}
function render({ bpm, steps }, loops) {
  const dt = 60 / bpm / 2, buf = new Float32Array(Math.round(steps.length * dt * RATE) * loops);
  for (let i = 0; i < steps.length * loops; i++) {
    const s = steps[i % steps.length], t = i * dt;
    if (s.lead) addVoice(buf, midi(s.lead), t, dt * 0.85, "square", 0.028);
    if (s.bass) addVoice(buf, midi(s.bass), t, dt * 0.95, "triangle", 0.07);
  }
  const peak = buf.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  return buf.map((v) => v * (0.7 / peak));
}
function wav(samples) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(RATE, 24);
  b.writeUInt32LE(RATE * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  return b;
}

const out = new URL("../game/assets/audio/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });
for (const [name, song] of Object.entries(SONGS)) {
  const tmp = `${out}${name}.wav`;
  writeFileSync(tmp, wav(render(song, 2))); // two passes of the progression per file
  execFileSync("lame", ["--quiet", "-b", "128", tmp, `${out}music-${name}.mp3`]);
  rmSync(tmp);
  console.log(`music-${name}.mp3`);
}
