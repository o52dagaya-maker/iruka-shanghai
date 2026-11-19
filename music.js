/* イルカの上海 — original old-jazz BGM, synthesized live with WebAudio (no audio files, no network).
   All melodies and progressions here were written for this game. See music/README.md. */
(function () {
'use strict';
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midi(s) { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) throw new Error('bad note ' + s); return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const QUAL = { maj7: [0, 4, 7, 11], 6: [0, 4, 7, 9], m7: [0, 3, 7, 10], 7: [0, 4, 7, 10], m6: [0, 3, 7, 9], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10] };
function chord(sym) { // "Dbmaj7", "Bb7", "Dbmaj7/F"
  const [main, slash] = sym.split('/'); const m = /^([A-G][#b]?)(.*)$/.exec(main);
  const root = midi(m[1] + '2') % 12, iv = QUAL[m[2]] || QUAL[7];
  return { root, iv, bass: slash ? midi(slash + '2') % 12 : root };
}
function mel(str) { let t = 0; const out = []; str.trim().split(/\s+/).forEach(tok => { const [n, d] = tok.split(':'); if (n !== 'r') out.push({ t, d: +d, m: midi(n) }); t += +d; }); return { notes: out, len: t }; }
const bars = str => str.split('|').map(s => s.trim()).filter(Boolean);

/* ---------------- the tracks ---------------- */
// Each track: bpm, swing (off-beat 8th position, .5 = straight), form (chords per bar), lead melody, style.
const TRACKS = {
  title: { name: '月夜の桟橋', en: 'Moonlit Pier (ballad)', bpm: 66, swing: .58, key: 'D♭ major', lead: 'clarinet', style: 'ballad',
    chords: bars('Dbmaj7 | Bb7 | Ebm7 | Ab7 | Fm7 Bb7 | Ebm7 Ab7 | Dbmaj7 Bbm7 | Ebm7 Ab7 | Dbmaj7 | Bb7 | Ebm7 | Ab7 | Gbmaj7 | Gbm6 | Dbmaj7/F Bb7 | Ebm7 Ab7'),
    melody: mel(`F5:2 Eb5:.5 Db5:.5 C5:1  Bb4:1.5 D5:.5 F5:2  Gb5:1.5 F5:.5 Eb5:1 Db5:1  C5:3 r:1
      C5:1 Eb5:.5 F5:.5 Ab5:1.5 G5:.5  Gb5:1.5 Eb5:.5 Db5:1 Bb4:1  Db5:2 F4:1 Ab4:1  Bb4:1.5 C5:.5 Db5:1 Eb5:1
      F5:2 Ab5:1 F5:1  D5:2 r:.5 F5:.5 Ab5:.5 F5:.5  Gb5:1.5 Bb5:.5 Ab5:1 Gb5:1  Eb5:1 C5:1 Ab4:2
      Bb4:.5 Db5:.5 F5:1 Bb5:2  A5:1.5 Gb5:.5 Eb5:2  Db5:1.5 Eb5:.5 F5:1 D5:1  Eb5:1 Gb5:1 F5:1 C5:1`) },
  play1: { name: '潮見坂スウィング', en: 'Shiomizaka Swing (medium swing, AABA)', bpm: 100, swing: .64, key: 'A♭ major', tr: 1, lead: 'trumpet', style: 'swing', // written in G, played a half-step up
    chords: bars(`Gmaj7 | E7 | Am7 | D7 | Bm7 E7 | Am7 D7 | G6 E7 | Am7 D7 |
                  Gmaj7 | E7 | Am7 | D7 | Bm7 E7 | Am7 D7 | G6 | Dm7 G7 |
                  Cmaj7 | Cm6 | Bm7 | E7 | Am7 | D7 | Am7 | D7 |
                  Gmaj7 | E7 | Am7 | D7 | Bm7 E7 | Am7 D7 | G6 E7 | Am7 D7`),
    melody: (() => {
      const A = `B4:1.5 A4:.5 G4:1 D5:1  r:.5 G#4:.5 B4:.5 D5:.5 E5:1 D5:1  C5:1.5 B4:.5 A4:1 E4:1  F#4:1 A4:1 C5:1 B4:.5 A4:.5
                 D5:1 B4:1 D5:.5 E5:.5 G#4:1  A4:1 C5:1 F#4:1 A4:1`;
      const end1 = `G4:2 r:.5 B4:.5 G#4:1  A4:1 E5:1 C5:1 F#4:1`, end2 = `G4:3 r:1  r:1 D5:.5 F5:.5 B4:1 F4:1`;
      const B = `E5:2 D5:.5 C5:.5 B4:1  Eb5:2 C5:1 A4:1  D5:1.5 B4:.5 F#4:1 A4:1  G#4:1 B4:1 D5:1 E5:1
                 C5:1.5 A4:.5 E5:1 C5:1  F#4:2 A4:1 C5:1  E5:.5 D5:.5 C5:.5 A4:.5 G4:1 E4:1  F#4:1 A4:1 C5:1 D5:1`;
      return mel([A, end1, A, end2, B, A, end1].join(' '));
    })() },
  play2: { name: 'ガリと緑茶のブルース', en: 'Gari & Green-Tea Blues (slow stride blues)', bpm: 80, swing: .66, key: 'E♭ (12-bar blues)', tr: -2, lead: 'piano', style: 'stride', // written in F, played a whole-step down
    chords: bars(`F7 | Bb7 | F7 | F7 | Bb7 | Bdim7 | F7 | D7 | Gm7 | C7 | F7 D7 | Gm7 C7 |
                  F7 | Bb7 | F7 | F7 | Bb7 | Bdim7 | F7 | D7 | Gm7 | C7 | F7 D7 | Gm7 C7`),
    melody: mel(`A5:.5 C6:.5 r:.5 A5:.5 Ab5:.5 F5:1.5  Ab5:.5 Bb5:.5 r:.5 Ab5:.5 F5:.5 D5:1.5  A5:.5 C6:.5 r:.5 A5:.5 Ab5:.5 F5:.5 Eb5:.5 C5:.5  F5:3 r:1
      Ab5:.5 Bb5:.5 D6:1 C6:.5 Bb5:.5 Ab5:1  B5:1 D6:1 F6:1 Ab5:1  A5:.5 C6:.5 A5:.5 F5:.5 C5:1 Eb5:1  F#5:1 A5:1 C6:1 D6:1
      Bb5:1.5 G5:.5 D5:1 F5:1  E5:1 G5:.5 Bb5:.5 E5:1 C5:1  F5:1 A5:1 F#5:1 C6:1  Bb5:1 D5:1 E5:1 G5:1
      F5:1 r:.5 Eb5:.5 C5:1 A4:1  D5:1 F5:.5 Ab5:.5 Bb5:2  C6:.5 Bb5:.5 A5:.5 Ab5:.5 F5:1 C5:1  Eb5:.5 E5:.5 F5:2 r:1
      D6:1 Bb5:1 Ab5:1 F5:1  Ab5:1 F5:1 D5:1 B4:1  C5:.5 F5:.5 A5:.5 C6:.5 Eb6:1 C6:1  A5:1 F#5:1 D5:1 C5:1
      Bb4:.5 D5:.5 G5:1 F5:1 D5:1  E5:1.5 C5:.5 Bb4:1 G4:1  A4:1 C5:1 D5:1 F#5:1  G5:1 Bb5:1 Bb5:.5 A5:.5 G5:1`) },
  clear: { name: '開通ファンファーレ', en: 'Kaitsū Fanfare (Dixieland tag, plays once)', bpm: 138, swing: .62, key: 'B♭ major', lead: 'trumpet', style: 'dixie', once: true,
    chords: bars('Bb6 | Eb7 | Bb6 F7 | Bb6 | Bb6'),
    melody: mel('D5:.5 F5:.5 Bb5:.5 F5:.5 G5:.5 F5:.5 D5:1  Eb5:.5 G5:.5 Bb5:.5 C6:.5 Db6:1 Bb5:1  D6:1 C6:.5 Bb5:.5 A5:.5 C6:.5 Eb5:1  Bb5:4  r:4'),
    counter: mel('Bb4:1 D5:1 F5:1 Bb4:1  G4:1 Bb4:1 Db5:2  F5:1 Eb5:1 C5:2  D5:4  r:4') },
};

/* ---------------- arranging: turn a track into timed events (in beats) ---------------- */
let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function arrange(tr) {
  const ev = [], nb = tr.chords.length, beats = nb * 4;
  const T = tr.tr || 0, shift = c => ({ root: (c.root + T + 12) % 12, iv: c.iv, bass: (c.bass + T + 12) % 12 });
  const perBar = tr.chords.map(b => b.split(/\s+/).map(x => shift(chord(x))));
  const chordAt = beat => { const b = perBar[Math.floor(beat / 4) % nb]; return b.length === 1 ? b[0] : b[Math.floor((beat % 4) / 2)]; };
  // lead
  tr.melody.notes.forEach(n => ev.push({ t: n.t, i: tr.lead, m: n.m + T, d: n.d, v: .9 }));
  if (tr.counter) tr.counter.notes.forEach(n => ev.push({ t: n.t, i: 'clarinet', m: n.m + T, d: n.d, v: .55 }));
  // bass: walking (swing/dixie), two-feel (ballad), stride left hand (stride)
  let prev = 43;
  const near = (pc, lo, hi) => { let best = null; for (let m = lo; m <= hi; m++) if (((m % 12) + 12) % 12 === pc && (best === null || Math.abs(m - prev) < Math.abs(best - prev))) best = m; return best; };
  for (let beat = 0; beat < beats; beat++) {
    const c = chordAt(beat), nx = chordAt((beat + 1) % beats), pos = beat % 4;
    if (tr.style === 'ballad') {
      if (pos === 0 || pos === 2) { const pc = pos === 0 ? c.bass : (c.root + c.iv[2]) % 12; const m = near(pc, 33, 50); prev = m; ev.push({ t: beat, i: 'bass', m, d: 1.9, v: .8 }); }
    } else if (tr.style === 'stride') {
      if (pos === 0 || pos === 2) { const pc = pos === 0 ? c.root : (c.root + 7) % 12; const m = near(pc, 31, 46); prev = m; ev.push({ t: beat, i: 'piano', m, d: .9, v: .62 }); ev.push({ t: beat, i: 'piano', m: m + 12, d: .9, v: .38 }); }
      else voicing(c, 53, 66).forEach(m => ev.push({ t: beat, i: 'piano', m, d: .45, v: .34 }));
      if (pos === 0) { const m = near(c.root, 33, 45); ev.push({ t: beat, i: 'bass', m, d: 1.8, v: .45 }); }
    } else {
      let pc;
      const nextRoot = nx.root, changes = nx !== c || pos === 3;
      if (pos === 0 || (perBar[Math.floor(beat / 4) % nb].length > 1 && pos === 2)) pc = c.bass;
      else if ((pos === 3 || (pos === 1 && perBar[Math.floor(beat / 4) % nb].length > 1)) && changes) pc = (nextRoot + (rnd() < .5 ? 1 : 11)) % 12; // chromatic approach
      else pc = (c.root + c.iv[rnd() < .6 ? 2 : 1]) % 12;
      const m = near(pc, 33, 50); prev = m; ev.push({ t: beat, i: 'bass', m, d: .92, v: .85 });
    }
  }
  // piano comping
  if (tr.style !== 'stride') perBar.forEach((cs, b) => cs.forEach((c, k) => {
    const t0 = b * 4 + k * (4 / cs.length), vs = voicing(c, 52, 70);
    if (tr.style === 'ballad') { vs.forEach((m, j) => ev.push({ t: t0 + j * .25, i: 'piano', m, d: cs.length > 1 ? 1.8 : 3.6, v: .32 })); if (cs.length === 1) vs.slice(1).forEach(m => ev.push({ t: t0 + 2.5, i: 'piano', m: m + 12, d: 1.2, v: .16 })); }
    else if (cs.length === 1) { vs.forEach(m => { ev.push({ t: t0, i: 'piano', m, d: 1.2, v: .3 }); ev.push({ t: t0 + 1.5, i: 'piano', m, d: .5, v: .26 }); }); } // Charleston
    else vs.forEach(m => ev.push({ t: t0 + (rnd() < .5 ? 0 : .5), i: 'piano', m, d: .9, v: .28 }));
  }));
  // drums: brushes (swish + snare tap on 2&4), ride pattern, feathered kick
  for (let beat = 0; beat < beats; beat++) {
    const pos = beat % 4;
    if (tr.style === 'ballad') { if (pos % 2 === 0) ev.push({ t: beat, i: 'swish', d: 2, v: .5 }); if (pos === 1 || pos === 3) ev.push({ t: beat, i: 'tap', v: .35 }); continue; }
    ev.push({ t: beat, i: 'swish', d: 1, v: .38 });
    if (pos === 1 || pos === 3) ev.push({ t: beat, i: 'tap', v: .55 });
    ev.push({ t: beat, i: 'ride', v: pos % 2 ? .5 : .38 });
    if (pos % 2) ev.push({ t: beat + .5, i: 'ride', v: .26 });
    ev.push({ t: beat, i: 'kick', v: .32 });
  }
  if (tr.style === 'dixie') { for (let k = 0; k < 8; k++) ev.push({ t: 14 + k * .25, i: 'tap', v: .25 + k * .06 }); ev.push({ t: 16, i: 'crash', v: .5 }); }
  ev.sort((a, b) => a.t - b.t);
  return { ev, beats };
}
function voicing(c, lo, hi) { // rootless-ish: 3rd, 7th(or 6th), 9th / 5th, kept in [lo, hi]
  const pcs = [c.iv[1], c.iv[3], c.iv[0] + 2].map(x => (c.root + x) % 12);
  return pcs.map(pc => { let m = lo + ((pc - lo) % 12 + 12) % 12; if (m > hi) m -= 12; return m; }).sort((a, b) => a - b);
}

/* ---------------- instruments ---------------- */
function Engine(ctx, out) {
  const N = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), nd = N.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const env = (g, t, a, peak, dec, sus, end) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(peak * sus, .0002), t + a + dec); g.gain.exponentialRampToValueAtTime(.0001, end); };
  const osc = (type, f, t, end, dest, gain = 1) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); let n = o; if (gain !== 1) { const g = ctx.createGain(); g.gain.value = gain; o.connect(g); n = g; } n.connect(dest); o.start(t); o.stop(end + .05); return o; };
  const filt = (type, f, q, dest) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; b.connect(dest); return b; };
  const noise = (t, dur, dest, rate = 1) => { const s = ctx.createBufferSource(); s.buffer = N; s.playbackRate.value = rate; s.connect(dest); s.start(t, Math.random() * 1.5); s.stop(t + dur); };
  const vib = (o, t, f, depth, delay) => { const l = ctx.createOscillator(), g = ctx.createGain(); l.frequency.value = 5.2; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(f * depth, t + delay); l.connect(g); g.connect(o.frequency); l.start(t); l.stop(t + 6); };
  const I = {
    piano(t, m, d, v) { const f = hz(m), end = t + Math.min(d + .4, 3.2), g = ctx.createGain(); env(g, t, .004, v * .42, .35, .3, end);
      const lp = filt('lowpass', Math.min(5200, 900 + f * 3.2), .3, g); g.connect(out);
      osc('triangle', f, t, end, lp); osc('sine', f * 2.001, t, end, lp, .32); osc('sine', f * 3.003, t, end, lp, .09); },
    bass(t, m, d, v) { const f = hz(m), end = t + d * .95 + .08, g = ctx.createGain(); env(g, t, .008, v * .62, .12, .55, end);
      const lp = filt('lowpass', 520, .7, g); g.connect(out); osc('triangle', f, t, end, lp); osc('sine', f, t, end, lp, .9); osc('sine', f * 2, t, t + .06, lp, .25); },
    trumpet(t, m, d, v) { const f = hz(m), end = t + d * .96 + .06, g = ctx.createGain(); env(g, t, .045, v * .2, .2, .75, end);
      const bp = filt('bandpass', Math.min(2600, 1250 + f * .4), 2.2, g), hp = filt('highpass', 420, 0, bp); g.connect(out);
      const o = osc('sawtooth', f, t, end, hp); vib(o, t, f, .007, Math.min(.35, d * .6)); },
    clarinet(t, m, d, v) { const f = hz(m), end = t + d * .97 + .07, g = ctx.createGain(); env(g, t, .06, v * .17, .25, .82, end);
      const lp = filt('lowpass', Math.min(2400, 900 + f * 1.2), 1.2, g); g.connect(out);
      const o = osc('square', f, t, end, lp, .55), o2 = osc('triangle', f, t, end, lp); vib(o, t, f, .005, .3); vib(o2, t, f, .005, .3); },
    swish(t, m, d, v) { const g = ctx.createGain(), sp = ctx.createGain(); const dur = d * .9; g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .05, t + dur * .55); g.gain.linearRampToValueAtTime(.0001, t + dur);
      const bp = filt('bandpass', 2600, .8, g); g.connect(out); noise(t, dur, bp, .7); },
    tap(t, m, d, v) { const g = ctx.createGain(); env(g, t, .002, v * .14, .09, .2, t + .22); const bp = filt('bandpass', 3200, .9, g); g.connect(out); noise(t, .24, bp); },
    ride(t, m, d, v) { const g = ctx.createGain(); env(g, t, .001, v * .06, .25, .3, t + .7); const hp = filt('highpass', 6800, 0, g); g.connect(out); noise(t, .7, hp, 1.3); },
    crash(t, m, d, v) { const g = ctx.createGain(); env(g, t, .002, v * .12, 1.2, .2, t + 2.4); const hp = filt('highpass', 4200, 0, g); g.connect(out); noise(t, 2.4, hp); },
    kick(t, m, d, v) { const g = ctx.createGain(); env(g, t, .004, v * .3, .16, .1, t + .26); g.connect(out); const o = osc('sine', 72, t, t + .28, g); o.frequency.exponentialRampToValueAtTime(44, t + .2); },
    crackle(t) { const g = ctx.createGain(); g.gain.setValueAtTime(.006 + Math.random() * .012, t); g.gain.exponentialRampToValueAtTime(.0001, t + .012); const hp = filt('highpass', 2500, 0, g); g.connect(out); noise(t, .015, hp); },
  };
  return I;
}
function makeBus(ctx, dest) { // track bus → (dry + small room reverb) → vintage lowpass → dest
  const bus = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6200; lp.connect(dest);
  bus.connect(lp);
  const len = Math.floor(ctx.sampleRate * 1.4), ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  const cv = ctx.createConvolver(); cv.buffer = ir; const wet = ctx.createGain(); wet.gain.value = .22; bus.connect(cv); cv.connect(wet); wet.connect(lp);
  return bus;
}

/* ---------------- live player ---------------- */
const ARR = {}; Object.keys(TRACKS).forEach(k => { seed = 7 + k.length * 131; ARR[k] = arrange(TRACKS[k]); });
let ctx = null, master = null, cur = null, vol = .5, duck = 1, timer = 0, onEnd = null;
function swingT(t, sw) { const b = Math.floor(t), f = t - b; return Math.abs(f - .5) < 1e-6 ? b + sw : b + f; }
function attach(c) { if (ctx === c) return; ctx = c; master = ctx.createGain(); master.gain.value = vol * duck * .55; const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; master.connect(comp); comp.connect(ctx.destination); }
function setVolume(v) { vol = Math.max(0, Math.min(1, v)); if (master) master.gain.setTargetAtTime(vol * duck * .55, ctx.currentTime, .1); }
function setDuck(d) { if (d === duck) return; duck = d; setVolume(vol); }
function play(id, endCb) {
  if (!ctx || !TRACKS[id]) return;
  if (cur && cur.id === id) return;
  stop();
  const tr = TRACKS[id], bus = ctx.createGain(); bus.gain.setValueAtTime(.0001, ctx.currentTime); bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + (tr.once ? .05 : 1.2));
  const chain = makeBus(ctx, master); bus.connect(chain);
  cur = { id, tr, bus, inst: Engine(ctx, bus), arr: ARR[id], spb: 60 / tr.bpm, loopStart: ctx.currentTime + .12, idx: 0, loops: 0 };
  onEnd = endCb || null;
  tick(); timer = setInterval(tick, 50);
}
function tick() {
  if (!cur) return;
  const c = cur, horizon = ctx.currentTime + .3;
  for (;;) {
    if (c.idx >= c.arr.ev.length) {
      if (c.tr.once) { const endAt = c.loopStart + c.arr.beats * c.spb; if (ctx.currentTime >= endAt) { const cb = onEnd; stop(); if (cb) cb(); } return; }
      c.loopStart += c.arr.beats * c.spb; c.idx = 0; c.loops++;
    }
    const e = c.arr.ev[c.idx], at = c.loopStart + swingT(e.t, c.tr.swing) * c.spb;
    if (at > horizon) break;
    c.idx++;
    if (at < ctx.currentTime - .05) continue; // fell behind (tab was throttled): skip rather than pile up
    const hum = e.i === 'kick' || e.i === 'swish' ? 0 : (Math.random() - .5) * .012;
    try { c.inst[e.i](at + hum, e.m, (e.d || .5) * c.spb, e.v * (.9 + Math.random() * .2)); } catch (err) {}
  }
  if (Math.random() < .25) c.inst.crackle(ctx.currentTime + .1 + Math.random() * .2); // faint old-record crackle
}
function stop(fast) {
  clearInterval(timer); timer = 0; onEnd = null;
  if (!cur) return; const b = cur.bus, t = ctx.currentTime;
  b.gain.cancelScheduledValues(t); b.gain.setValueAtTime(Math.max(b.gain.value, .0001), t); b.gain.exponentialRampToValueAtTime(.0001, t + (fast ? .05 : .7));
  setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 1500);
  cur = null;
}
// Offline render for tests: returns RMS per second of the first `secs` seconds of a track.
async function renderTest(id, secs) {
  const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext, oc = new OC(1, 22050 * secs, 22050);
  const m = oc.createGain(); m.gain.value = .55; m.connect(oc.destination);
  const tr = TRACKS[id], arr = ARR[id], inst = Engine(oc, makeBus(oc, m)), spb = 60 / tr.bpm;
  for (let loop = 0; loop * arr.beats * spb < secs; loop++) arr.ev.forEach(e => { const at = loop * arr.beats * spb + swingT(e.t, tr.swing) * spb + .05; if (at < secs - .1) inst[e.i](at, e.m, (e.d || .5) * spb, e.v); });
  const buf = await oc.startRendering(), d = buf.getChannelData(0), out = [];
  let peak = 0; for (let s = 0; s < secs; s++) { let sum = 0; for (let i = s * 22050; i < (s + 1) * 22050; i++) { sum += d[i] * d[i]; peak = Math.max(peak, Math.abs(d[i])); } out.push(+Math.sqrt(sum / 22050).toFixed(4)); }
  return { rms: out, peak: +peak.toFixed(3), loopSec: +(arr.beats * spb).toFixed(2), events: arr.ev.length };
}
window.IrukaMusic = { TRACKS, attach, play, stop, setVolume, setDuck, renderTest, get current() { return cur ? cur.id : null; }, info: id => ({ beats: ARR[id].beats, sec: ARR[id].beats * 60 / TRACKS[id].bpm, events: ARR[id].ev.length }) };
})();
