/* イルカの上海 — original 1940s jazz-lounge BGM, synthesized live with WebAudio (no audio files, no network).
   Generated from /home/box/shanghai/music/src (engine.js + tracks-shanghai.js + api-shanghai.js) by build.py. */
(function (root) {
'use strict';
/* ---- shared "1940s jazz lounge" engine (generated into both games' music script by music/src/build.py) ----
   Everything is synthesized with WebAudio: no samples, no audio files, no network. */
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midi(s) { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); if (!m) throw new Error('bad note ' + s); return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const QUAL = { '': [0, 4, 7, 9], maj7: [0, 4, 7, 11], 6: [0, 4, 7, 9], 7: [0, 4, 7, 10], m: [0, 3, 7, 10], m7: [0, 3, 7, 10], m6: [0, 3, 7, 9], dim: [0, 3, 6, 9], dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10] };
function chord(sym) {
  const [main, slash] = sym.split('/'); const m = /^([A-G][#b]?)(.*)$/.exec(main);
  const iv = QUAL[m[2]]; if (!iv) throw new Error('bad chord ' + sym);
  return { root: midi(m[1] + '2') % 12, iv, q: m[2], bass: slash ? midi(slash + '2') % 12 : midi(m[1] + '2') % 12 };
}
// melody in beats: "F5:2 Eb5:.5 r:1"
function mel(str) { let t = 0; const out = []; str.trim().split(/\s+/).forEach(tok => { const [n, d] = tok.split(':'); if (n !== 'r') out.push({ t, d: +d, m: midi(n) }); t += +d; }); return { notes: out, len: t }; }
// melody bars in swung eighths (2 = one beat)
const melE = barsArr => mel(barsArr.join(' ').replace(/:(\d+(\.\d+)?)/g, (_, d) => ':' + (+d / 2)));
const bars = str => str.split('|').map(s => s.trim()).filter(Boolean);

/* ---------------- arranging: a track → timed events (in beats) ---------------- */
let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function voicing(c, lo, hi, n) { // jazz-lounge voicing: 3rd, 7th/6th, 9th (+5th or 13th), inside [lo, hi]
  const third = c.iv[1], sev = c.iv[3], ninth = c.q === 'dim' || c.q === 'dim7' ? c.iv[2] : 14, top = c.q === '7' ? 21 : c.iv[2];
  const pcs = [third, sev, ninth, top].slice(0, n || 3).map(x => (c.root + x) % 12);
  return pcs.map(pc => { let m = lo + ((pc - lo) % 12 + 12) % 12; if (m > hi) m -= 12; return m; }).sort((a, b) => a - b);
}
function arrange(tr) {
  const ev = [], nb = tr.chords.length, beats = nb * 4, T = tr.tr || 0;
  const shift = c => ({ root: (c.root + T + 12) % 12, iv: c.iv, q: c.q, bass: (c.bass + T + 12) % 12 });
  const perBar = tr.chords.map(b => b.split(/\s+/).map(x => shift(chord(x))));
  const chordAt = beat => { const b = perBar[Math.floor(beat / 4) % nb]; return b.length === 1 ? b[0] : b[Math.floor((beat % 4) / 2)]; };
  const choruses = tr.lead2 ? 2 : 1, total = beats * choruses;
  for (let ch = 0; ch < choruses; ch++) {
    const o = ch * beats, lead = ch ? tr.lead2 : tr.lead, oct = (ch ? tr.oct2 : tr.oct) || 0;
    tr.melody.notes.forEach(n => ev.push({ t: o + n.t, i: lead, m: n.m + T + oct, d: n.d, v: ch ? .8 : .9 }));
    if (tr.counter) tr.counter.notes.forEach(n => ev.push({ t: o + n.t, i: tr.counterInst || 'clarinet', m: n.m + T, d: n.d, v: .5 }));
  }
  // bass
  let prev = 40;
  const near = (pc, lo, hi) => { let best = null; for (let m = lo; m <= hi; m++) if (((m % 12) + 12) % 12 === pc && (best === null || Math.abs(m - prev) < Math.abs(best - prev))) best = m; return best; };
  for (let beat = 0; beat < total; beat++) {
    const b = beat % beats, c = chordAt(b), nx = chordAt((b + 1) % beats), pos = b % 4, two = perBar[Math.floor(b / 4) % nb].length > 1;
    if (tr.style === 'ballad' || tr.style === 'tag' || (tr.style === 'slow' && beat < beats)) {
      if (pos === 0 || pos === 2) { const pc = pos === 0 || two ? c.bass : (c.root + c.iv[2]) % 12; const m = near(pc, 31, 48); prev = m; ev.push({ t: beat, i: 'bass', m, d: 1.85, v: .8 }); }
    } else {
      let pc; const changes = nx !== c || pos === 3;
      if (pos === 0 || (two && pos === 2)) pc = c.bass;
      else if ((pos === 3 || (pos === 1 && two)) && changes) pc = (nx.bass + (rnd() < .55 ? 1 : 11)) % 12; // chromatic approach
      else pc = (c.root + c.iv[rnd() < .55 ? 2 : (rnd() < .5 ? 1 : 3)]) % 12;
      const m = near(pc, 31, 48); prev = m; ev.push({ t: beat, i: 'bass', m, d: .95, v: pos === 0 ? .9 : .8 });
      if (tr.style === 'noir' && pos === 3 && rnd() < .3) ev.push({ t: beat + .5, i: 'bass', m: m + (rnd() < .5 ? 1 : -1), d: .4, v: .5 }); // ghost note
    }
  }
  // piano comping (soft, behind the lead)
  const leadIsPiano = ch => (ch ? tr.lead2 : tr.lead) === 'piano';
  for (let ch = 0; ch < choruses; ch++) perBar.forEach((cs, b) => cs.forEach((c, k) => {
    const t0 = ch * beats + b * 4 + k * (4 / cs.length), lp = leadIsPiano(ch), vs = voicing(c, lp ? 50 : 53, lp ? 62 : 69, tr.style === 'ballad' || tr.style === 'tag' ? 4 : 3);
    const vv = lp ? .55 : 1;
    if (tr.style === 'ballad' || tr.style === 'tag' || tr.style === 'slow') {
      vs.forEach((m, j) => ev.push({ t: t0 + j * .18, i: 'piano', m, d: cs.length > 1 ? 1.9 : 3.8, v: .3 * vv }));
      if (cs.length === 1 && !lp) ev.push({ t: t0 + 2.5, i: 'piano', m: vs[vs.length - 1] + 12, d: 1.4, v: .14 });
    } else if (tr.style === 'noir') {
      vs.forEach(m => ev.push({ t: t0 + (cs.length > 1 ? .5 : 1.5), i: 'piano', m, d: .45, v: .27 * vv }));
      if (cs.length === 1 && rnd() < .5) vs.forEach(m => ev.push({ t: t0 + 3.5, i: 'piano', m, d: .4, v: .2 * vv }));
    } else if (cs.length === 1) { const r = rnd(); const hits = r < .45 ? [0, 1.5] : r < .8 ? [.5, 2.5] : [0, 2, 3.5]; hits.forEach((h, j) => vs.forEach(m => ev.push({ t: t0 + h, i: 'piano', m, d: j ? .5 : 1.1, v: (j ? .22 : .27) * vv }))); }
    else vs.forEach(m => ev.push({ t: t0 + (rnd() < .5 ? 0 : .5), i: 'piano', m, d: .9, v: .25 * vv }));
  }));
  // drums: brushes, soft ride, hi-hat on 2 & 4, feathered kick
  for (let beat = 0; beat < total; beat++) {
    const pos = beat % 4;
    if (tr.style === 'ballad' || tr.style === 'tag' || (tr.style === 'slow' && beat < beats)) {
      if (pos % 2 === 0) ev.push({ t: beat, i: 'swish', d: 2, v: .55 });
      if (pos === 1 || pos === 3) { ev.push({ t: beat, i: 'tap', v: .3 }); ev.push({ t: beat, i: 'hat', v: .35 }); }
      continue;
    }
    ev.push({ t: beat, i: 'swish', d: 1, v: .4 });
    ev.push({ t: beat, i: 'ride', v: pos % 2 ? .5 : .4 });
    if (pos % 2) { ev.push({ t: beat + .5, i: 'ride', v: .28 }); ev.push({ t: beat, i: 'tap', v: .42 }); ev.push({ t: beat, i: 'hat', v: .45 }); }
    if (pos === 0 || pos === 2) ev.push({ t: beat, i: 'kick', v: .3 });
  }
  if (tr.style === 'tag') { ev.push({ t: beats - 4, i: 'swell', d: 3.5, v: .5 }); }
  ev.sort((a, b) => a.t - b.t);
  return { ev, beats: total };
}

/* ---------------- instruments ---------------- */
const WAVES = new WeakMap();
function waves(ctx) {
  if (WAVES.has(ctx)) return WAVES.get(ctx);
  const mk = amps => { const re = new Float32Array(amps.length + 1), im = new Float32Array(amps.length + 1); amps.forEach((a, i) => { im[i + 1] = a; }); return ctx.createPeriodicWave(re, im); };
  const W = {
    piano: mk([1, .5, .3, .22, .13, .08, .06, .035, .02, .012]),
    sax: mk([1, .95, .78, .62, .5, .38, .3, .23, .17, .13, .1, .07, .05, .035]),
    clar: mk([1, .04, .5, .03, .3, .02, .18, .02, .11, .01, .06]),
    tpt: mk(Array.from({ length: 18 }, (_, i) => 1 / Math.pow(i + 1, .75))),
    vib: mk([1, 0, 0, .22, 0, 0, 0, 0, 0, .04]),
    bass: mk([1, .45, .18, .08, .04]),
  };
  WAVES.set(ctx, W); return W;
}
function Engine(ctx, dry, wet) {
  const W = waves(ctx);
  const N = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), nd = N.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const panner = (p, send) => { // per-voice output: stereo position + reverb send
    const g = ctx.createGain(); let n = g;
    if (ctx.createStereoPanner && p) { const sp = ctx.createStereoPanner(); sp.pan.value = p; g.connect(sp); n = sp; }
    n.connect(dry); if (send) { const s = ctx.createGain(); s.gain.value = send; n.connect(s); s.connect(wet); }
    return g;
  };
  const osc = (wave, f, t, end, dest, gain = 1, det = 0) => { const o = ctx.createOscillator(); if (typeof wave === 'string') o.type = wave; else o.setPeriodicWave(wave); o.frequency.setValueAtTime(f, t); if (det) o.detune.value = det; let n = o; if (gain !== 1) { const g = ctx.createGain(); g.gain.value = gain; o.connect(g); n = g; } n.connect(dest); o.start(t); o.stop(end + .05); return o; };
  const filt = (type, f, q, dest, gain) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; if (gain) b.gain.value = gain; b.connect(dest); return b; };
  const noise = (t, dur, dest, rate = 1) => { const s = ctx.createBufferSource(); s.buffer = N; s.playbackRate.value = rate; s.connect(dest); s.start(t, Math.random() * 1.5); s.stop(t + dur); };
  const vib = (o, t, f, depth, delay, rate = 5.1, len = 8) => { const l = ctx.createOscillator(), g = ctx.createGain(); l.frequency.value = rate; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(f * depth, t + delay); l.connect(g); g.connect(o.frequency); l.start(t); l.stop(t + len); };
  // sustained wind envelope
  const wind = (g, t, a, peak, end, rel) => { g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setTargetAtTime(peak * .82, t + a, .25); g.gain.setTargetAtTime(.0001, end, rel); };
  const I = {
    piano(t, m, d, v) { // two detuned strings, bright hammer that mellows as the note decays
      const f = hz(m), len = Math.min(Math.max(d, .3) + .5, 4.5), end = t + len, out = panner(-.18 + (m - 60) / 90, .32), g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .3, t + .004); g.gain.setTargetAtTime(v * .3 * .32, t + .004, .18 + 60 / f);
      g.gain.setTargetAtTime(.0001, t + Math.max(d, .25), .09); g.connect(out);
      const lp = filt('lowpass', 900, .5, g); lp.frequency.setValueAtTime(Math.min(8000, 1500 + f * 5 * (.5 + v)), t); lp.frequency.setTargetAtTime(Math.max(500, f * 2.2), t + .01, .35);
      osc(W.piano, f, t, end, lp, .55, -2.5); osc(W.piano, f, t, end, lp, .55, 2.5);
      const hg = ctx.createGain(); hg.gain.setValueAtTime(v * .05, t); hg.gain.exponentialRampToValueAtTime(.0001, t + .03); hg.connect(out); noise(t, .035, filt('bandpass', Math.min(5000, f * 4), 1.2, hg));
    },
    bass(t, m, d, v) { // upright bass: thumb pluck, woody body, slight pitch settle
      const f = hz(m), end = t + d * .96 + .1, out = panner(0, .08), g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .16, t + .007); g.gain.setTargetAtTime(v * .16 * .3, t + .007, .09); g.gain.setTargetAtTime(v * .16 * .03, t + .2, .45); g.gain.setTargetAtTime(.0001, end - .04, .05); g.connect(out);
      const lp = filt('lowpass', 1300, 1.1, g); lp.frequency.setTargetAtTime(420, t + .01, .09);
      const o = osc(W.bass, f * 1.012, t, end, lp); o.frequency.exponentialRampToValueAtTime(f, t + .04); osc('sine', f, t, end, lp, .45);
      const tg = ctx.createGain(); tg.gain.setValueAtTime(v * .06, t); tg.gain.exponentialRampToValueAtTime(.0001, t + .05); tg.connect(out); noise(t, .06, filt('lowpass', 380, 0, tg));
    },
    sax(t, m, d, v) { // breathy tenor sax: scoop into the note, formants, delayed vibrato, breath noise
      const f = hz(m), end = t + d * .95 + .02, out = panner(.22, .42), g = ctx.createGain(); wind(g, t, .06, v * .2, end, .07); g.connect(out);
      const f2 = filt('peaking', 1450, 1.3, g, 6), f1 = filt('peaking', 520, 1, f2, 4), lp = filt('lowpass', 900, .7, f1);
      lp.frequency.setValueAtTime(700, t); lp.frequency.linearRampToValueAtTime(Math.min(4200, 1100 + f * 2.2 + v * 900), t + .09); lp.frequency.setTargetAtTime(Math.min(3200, 900 + f * 1.7), t + .1, .3);
      const o = osc(W.sax, f * .965, t, end + .1, lp); o.frequency.exponentialRampToValueAtTime(f, t + .07); vib(o, t, f, .0065, Math.min(.45, d * .55));
      const o2 = osc(W.sax, f, t, end + .1, lp, .35, 6); vib(o2, t, f, .006, Math.min(.45, d * .55), 4.9);
      const bg = ctx.createGain(); wind(bg, t, .03, v * .028, end, .05); bg.connect(out); noise(t, end - t + .15, filt('bandpass', Math.min(6000, f * 3), 1.4, bg));
    },
    trumpet(t, m, d, v) { // harmon-muted trumpet, soft and smoky
      const f = hz(m), end = t + d * .95 + .03, out = panner(-.25, .4), g = ctx.createGain(); wind(g, t, .04, v * .5, end, .06); g.connect(out);
      const hp = filt('highpass', 520, .5, g), bp = filt('bandpass', Math.min(2400, 1500 + f * .3), 3.2, hp), lp = filt('lowpass', 3600, .5, bp);
      const o = osc(W.tpt, f * .985, t, end + .1, lp); o.frequency.exponentialRampToValueAtTime(f, t + .05); vib(o, t, f, .006, Math.min(.4, d * .6), 5.4);
      const bg = ctx.createGain(); wind(bg, t, .02, v * .03, end, .04); bg.connect(out); noise(t, end - t + .1, filt('bandpass', 2500, 2, bg));
    },
    clarinet(t, m, d, v) { // woody low-register clarinet
      const f = hz(m), end = t + d * .96 + .03, out = panner(-.2, .38), g = ctx.createGain(); wind(g, t, .055, v * .16, end, .07); g.connect(out);
      const lp = filt('lowpass', Math.min(3000, 1000 + f * 1.1), .9, g);
      const o = osc(W.clar, f, t, end + .1, lp); vib(o, t, f, .0045, .35, 5);
      const bg = ctx.createGain(); wind(bg, t, .04, v * .015, end, .05); bg.connect(out); noise(t, end - t + .1, filt('bandpass', Math.min(5000, f * 2.5), 1.5, bg));
    },
    vibes(t, m, d, v) { // vibraphone with the motor tremolo on
      const f = hz(m), len = Math.min(d + 1.6, 4), end = t + len, out = panner(.3, .45), g = ctx.createGain(), tr = ctx.createGain();
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .2, t + .003); g.gain.setTargetAtTime(v * .2 * .5, t + .003, .5); g.gain.setTargetAtTime(.0001, t + Math.max(d, .3) + .4, .35);
      tr.gain.value = .78; const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.6; lg.gain.value = .22; l.connect(lg); lg.connect(tr.gain); l.start(t); l.stop(end + .05);
      g.connect(tr); tr.connect(out); osc(W.vib, f, t, end, filt('lowpass', 5000, 0, g));
      const cg = ctx.createGain(); cg.gain.setValueAtTime(v * .03, t); cg.gain.exponentialRampToValueAtTime(.0001, t + .02); cg.connect(out); noise(t, .025, filt('bandpass', 3000, 1, cg));
    },
    swish(t, m, d, v) { const dur = d * .92, out = panner(-.12, .2), g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .045, t + dur * .6); g.gain.linearRampToValueAtTime(.0001, t + dur); g.connect(out); const bp = filt('bandpass', 2400, .7, g); bp.frequency.setValueAtTime(1800, t); bp.frequency.linearRampToValueAtTime(3400, t + dur); noise(t, dur, bp, .6); },
    tap(t, m, d, v) { const out = panner(-.1, .25), g = ctx.createGain(); g.gain.setValueAtTime(v * .11, t); g.gain.exponentialRampToValueAtTime(.0001, t + .2); g.connect(out); noise(t, .22, filt('bandpass', 2600, .8, g)); const bg = ctx.createGain(); bg.gain.setValueAtTime(v * .05, t); bg.gain.exponentialRampToValueAtTime(.0001, t + .09); bg.connect(out); osc('sine', 185, t, t + .1, bg); },
    ride(t, m, d, v) { const out = panner(.35, .3), g = ctx.createGain(); g.gain.setValueAtTime(v * .05, t); g.gain.exponentialRampToValueAtTime(.0001, t + .9); g.connect(out); const hp = filt('highpass', 5200, 0, g); noise(t, .9, filt('peaking', 8200, 1, hp, 5), 1.2);
      const mg = ctx.createGain(); mg.gain.setValueAtTime(v * .012, t); mg.gain.exponentialRampToValueAtTime(.0001, t + .6); mg.connect(out); const mh = filt('highpass', 3000, 0, mg); [523, 739, 1047].forEach(fq => osc('square', fq * 3.17, t, t + .6, mh, .3)); },
    hat(t, m, d, v) { const out = panner(-.3, .1), g = ctx.createGain(); g.gain.setValueAtTime(v * .04, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .06); g.connect(out); noise(t, .07, filt('highpass', 7500, 0, g), 1.4); },
    kick(t, m, d, v) { const out = panner(0, 0), g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .2, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .28); g.connect(out); const o = osc('sine', 64, t, t + .3, g); o.frequency.exponentialRampToValueAtTime(42, t + .22); },
    swell(t, m, d, v) { const out = panner(.3, .5), g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .05, t + d * .8); g.gain.exponentialRampToValueAtTime(.0001, t + d + 1.6); g.connect(out); noise(t, d + 1.7, filt('highpass', 4500, 0, g)); },
    crackle(t) { const g = ctx.createGain(); g.gain.setValueAtTime(.004 + Math.random() * .01, t); g.gain.exponentialRampToValueAtTime(.0001, t + .01); g.connect(dry); noise(t, .012, filt('highpass', 2200, 0, g)); },
  };
  return I;
}
/* master chain: (dry + lush room reverb) → tape saturation → tape lowpass → gentle compressor → out, plus a faint vinyl hiss */
function makeMaster(ctx, dest) {
  const dry = ctx.createGain(), wet = ctx.createGain(), sat = ctx.createWaveShaper(), hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), comp = ctx.createDynamicsCompressor(), out = ctx.createGain();
  const curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(x * 1.6) / Math.tanh(1.6); }
  sat.curve = curve; sat.oversample = '2x';
  hp.type = 'highpass'; hp.frequency.value = 42; lp.type = 'lowpass'; lp.frequency.value = 7200; lp.Q.value = .4;
  comp.threshold.value = -18; comp.ratio.value = 2.5; comp.attack.value = .02; comp.release.value = .25;
  dry.connect(hp); hp.connect(sat); sat.connect(lp); lp.connect(comp); comp.connect(out); out.connect(dest);
  // reverb: stereo impulse with early reflections and a dark 2.1 s tail
  const sr = ctx.sampleRate, len = Math.floor(sr * 2.1), ir = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lpS = 0; for (let i = 0; i < len; i++) { const x = Math.random() * 2 - 1; lpS += (x - lpS) * (0.55 - 0.4 * i / len); d[i] = lpS * Math.pow(1 - i / len, 3) * 1.6; } [0.011, 0.019, 0.027, 0.041, 0.053].forEach((s, k) => { const j = Math.floor((s + ch * .003) * sr); d[j] += (k % 2 ? -.5 : .6) * (1 - k * .15); }); }
  const cv = ctx.createConvolver(); cv.buffer = ir; const rv = ctx.createGain(); rv.gain.value = .55; wet.connect(cv); cv.connect(rv); rv.connect(hp);
  // vinyl hiss (very quiet, looped)
  let hissSrc = null;
  const hiss = on => {
    if (on && !hissSrc) { const b = ctx.createBuffer(1, sr * 2, sr), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; hissSrc = ctx.createBufferSource(); hissSrc.buffer = b; hissSrc.loop = true; const g = ctx.createGain(); g.gain.value = .0035; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3500; f.Q.value = .5; hissSrc.connect(f); f.connect(g); g.connect(lp); hissSrc.start(); }
    else if (!on && hissSrc) { try { hissSrc.stop(); } catch (e) {} hissSrc = null; }
  };
  return { dry, wet, out, hiss };
}

/* ---------------- sequencer core (shared by both games' players) ---------------- */
function swingT(t, sw) { const b = Math.floor(t), f = t - b; return Math.abs(f - .5) < 1e-6 ? b + sw : b + f; }
function Core(TRACKS) {
  const ARR = {}; Object.keys(TRACKS).forEach(k => { seed = 7 + k.length * 131 + k.charCodeAt(0); ARR[k] = arrange(TRACKS[k]); });
  let ctx = null, M = null, cur = null, timer = 0, onEnd = null, level = .5;
  function attach(c) { if (ctx === c) return; ctx = c; const g = ctx.createGain(); g.gain.value = level * 1.05; M = makeMaster(ctx, g); M.gain = g; g.connect(ctx.destination); }
  function setLevel(x) { level = x; if (M) M.gain.gain.setTargetAtTime(Math.max(0, x) * 1.05, ctx.currentTime, .12); }
  function start(id, fadeIn, endCb) {
    if (!ctx || !TRACKS[id]) return;
    const tr = TRACKS[id], fade = ctx.createGain(), wet = ctx.createGain(), t = ctx.currentTime;
    [fade, wet].forEach(g => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(1, t + (fadeIn || .05)); });
    fade.connect(M.dry); wet.connect(M.wet);
    cur = { id, tr, fade, wet, inst: Engine(ctx, fade, wet), arr: ARR[id], spb: 60 / tr.bpm, loopStart: t + .12, idx: 0, loops: 0 };
    onEnd = endCb || null; M.hiss(true);
    tick(); if (!timer) timer = setInterval(tick, 50);
  }
  function stopCur(sec) {
    if (!cur) return; const c = cur, t = ctx.currentTime; cur = null; onEnd = null;
    [c.fade, c.wet].forEach(g => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(g.gain.value, .0001), t); g.gain.exponentialRampToValueAtTime(.0001, t + sec); });
    setTimeout(() => { try { c.fade.disconnect(); c.wet.disconnect(); } catch (e) {} }, sec * 1000 + 2500);
    clearInterval(timer); timer = 0; if (M) M.hiss(false);
  }
  function tick() {
    if (!cur || !ctx) return;
    if (ctx.state !== 'running') return;
    const c = cur, horizon = ctx.currentTime + .3;
    for (;;) {
      if (c.idx >= c.arr.ev.length) {
        if (c.tr.once) { const endAt = c.loopStart + c.arr.beats * c.spb; if (ctx.currentTime >= endAt) { const cb = onEnd; stopCur(.6); if (cb) cb(); } return; }
        c.loopStart += c.arr.beats * c.spb; c.idx = 0; c.loops++;
      }
      const e = c.arr.ev[c.idx], at = c.loopStart + swingT(e.t, c.tr.swing) * c.spb;
      if (at > horizon) break;
      c.idx++;
      if (at < ctx.currentTime - .05) continue; // fell behind (throttled tab): skip rather than pile up
      const hum = e.i === 'kick' || e.i === 'swish' || e.i === 'bass' ? 0 : (Math.random() - .5) * .014;
      try { c.inst[e.i](at + hum, e.m, (e.d || .5) * c.spb, e.v * (.9 + Math.random() * .2)); } catch (err) {}
    }
    if (Math.random() < .2) c.inst.crackle(ctx.currentTime + .1 + Math.random() * .2);
  }
  // offline render (tests / reference WAVs): stereo AudioBuffer of the first `secs` seconds
  function render(id, secs, sr, only) {
    const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext; sr = sr || 22050;
    const oc = new OC(2, Math.ceil(sr * secs), sr), g = oc.createGain(); g.gain.value = 1.05 * .5; g.connect(oc.destination);
    const m = makeMaster(oc, g), tr = TRACKS[id], arr = ARR[id], inst = Engine(oc, m.dry, m.wet), spb = 60 / tr.bpm; m.hiss(true);
    for (let loop = 0; loop * arr.beats * spb < secs; loop++) { arr.ev.forEach(e => { if (only && only.indexOf(e.i) < 0) return; const at = loop * arr.beats * spb + swingT(e.t, tr.swing) * spb + .05; if (at < secs - .1) inst[e.i](at, e.m, (e.d || .5) * spb, e.v); }); if (tr.once) break; }
    if (!only) for (let t = .2; t < secs; t += .25 + Math.random() * .5) inst.crackle(t); else m.hiss(false);
    return oc.startRendering ? new Promise((res, rej) => { const p = oc.startRendering(); if (p && p.then) p.then(res, rej); else oc.oncomplete = e => res(e.renderedBuffer); }) : null;
  }
  async function renderTest(id, secs) {
    const buf = await render(id, secs, 22050), L = buf.getChannelData(0), R = buf.getChannelData(1), sr = 22050, out = []; let peak = 0;
    for (let s = 0; s < secs; s++) { let sum = 0; for (let i = s * sr; i < Math.min(L.length, (s + 1) * sr); i++) { const x = (L[i] + R[i]) / 2; sum += x * x; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); } out.push(+Math.sqrt(sum / sr).toFixed(4)); }
    return { rms: out, peak: +peak.toFixed(3), loopSec: +(ARR[id].beats * 60 / TRACKS[id].bpm).toFixed(2), events: ARR[id].ev.length };
  }
  const info = id => ({ beats: ARR[id].beats, sec: ARR[id].beats * 60 / TRACKS[id].bpm, events: ARR[id].ev.length });
  return { attach, setLevel, start, stopCur, render, renderTest, info, get cur() { return cur; }, get ctx() { return ctx; } };
}

/* ---- イルカの上海: tracks (original compositions) ---- */
const TRACKS = {
  title: { name: '月夜の桟橋', en: 'Moonlit Pier (lounge ballad)', bpm: 66, swing: .6, key: 'D♭ major', lead: 'sax', oct: -12, lead2: 'vibes', style: 'ballad',
    chords: bars('Dbmaj7 | Bb7 | Ebm7 | Ab7 | Fm7 Bb7 | Ebm7 Ab7 | Dbmaj7 Bbm7 | Ebm7 Ab7 | Dbmaj7 | Bb7 | Ebm7 | Ab7 | Gbmaj7 | Gbm6 | Dbmaj7/F Bb7 | Ebm7 Ab7'),
    melody: mel(`F5:2 Eb5:.5 Db5:.5 C5:1  Bb4:1.5 D5:.5 F5:2  Gb5:1.5 F5:.5 Eb5:1 Db5:1  C5:3 r:1
      C5:1 Eb5:.5 F5:.5 Ab5:1.5 G5:.5  Gb5:1.5 Eb5:.5 Db5:1 Bb4:1  Db5:2 F4:1 Ab4:1  Bb4:1.5 C5:.5 Db5:1 Eb5:1
      F5:2 Ab5:1 F5:1  D5:2 r:.5 F5:.5 Ab5:.5 F5:.5  Gb5:1.5 Bb5:.5 Ab5:1 Gb5:1  Eb5:1 C5:1 Ab4:2
      Bb4:.5 Db5:.5 F5:1 Bb5:2  A5:1.5 Gb5:.5 Eb5:2  Db5:1.5 Eb5:.5 F5:1 D5:1  Eb5:1 Gb5:1 F5:1 C5:1`) },
  play1: { name: '潮見坂スウィング', en: 'Shiomizaka Swing (lounge medium swing, AABA)', bpm: 96, swing: .64, key: 'A♭ major', tr: 1, lead: 'trumpet', lead2: 'piano', oct2: 12, style: 'swing',
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
  play2: { name: 'ガリと緑茶のブルース', en: 'Gari & Green-Tea Blues (after-hours slow blues)', bpm: 78, swing: .66, key: 'E♭ (12-bar blues)', tr: -2, lead: 'piano', lead2: 'sax', oct2: -12, style: 'swing',
    chords: bars(`F7 | Bb7 | F7 | F7 | Bb7 | Bdim7 | F7 | D7 | Gm7 | C7 | F7 D7 | Gm7 C7`),
    melody: mel(`A5:.5 C6:.5 r:.5 A5:.5 Ab5:.5 F5:1.5  Ab5:.5 Bb5:.5 r:.5 Ab5:.5 F5:.5 D5:1.5  A5:.5 C6:.5 r:.5 A5:.5 Ab5:.5 F5:.5 Eb5:.5 C5:.5  F5:3 r:1
      Ab5:.5 Bb5:.5 D6:1 C6:.5 Bb5:.5 Ab5:1  B5:1 D6:1 F6:1 Ab5:1  A5:.5 C6:.5 A5:.5 F5:.5 C5:1 Eb5:1  F#5:1 A5:1 C6:1 D6:1
      Bb5:1.5 G5:.5 D5:1 F5:1  E5:1 G5:.5 Bb5:.5 E5:1 C5:1  F5:1 A5:1 F#5:1 C6:1  Bb5:1 D5:1 E5:1 G5:1`) },
  clear: { name: '開通のしらべ', en: 'Kaitsū Coda (lounge ending tag, plays once)', bpm: 100, swing: .62, key: 'B♭ major', lead: 'vibes', style: 'tag', once: true,
    chords: bars('Bbmaj7 | Gm7 C7 | Cm7 F7 | Bb6 | Bb6'),
    melody: mel('D5:.5 F5:.5 A5:1 G5:.5 F5:1.5  Bb5:1 A5:.5 G5:.5 E5:1 C5:1  Eb5:1 G5:.5 Bb5:.5 A5:1 F5:1  D6:4  r:4'),
    counter: mel('F3:2 D4:2  Bb3:2 E4:2  Eb4:2 A3:2  D4:4  r:4'), counterInst: 'sax' },
};

/* ---- player API used by the game ---- */
const C = Core(TRACKS);
let vol = .5, duck = 1;
const lv = () => C.setLevel(vol * duck);
function attach(c) { C.attach(c); lv(); }
function setVolume(v) { vol = Math.max(0, Math.min(1, v)); lv(); }
function setDuck(d) { if (d === duck) return; duck = d; lv(); }
function play(id, endCb) { if (!C.ctx || !TRACKS[id]) return; if (C.cur && C.cur.id === id) return; C.stopCur(.7); C.start(id, TRACKS[id].once ? .05 : 1.2, endCb); }
function stop(fast) { C.stopCur(fast ? .05 : .7); }
root.IrukaMusic = { TRACKS, attach, play, stop, setVolume, setDuck, renderTest: C.renderTest, render: C.render, info: C.info, get current() { return C.cur ? C.cur.id : null; } };

})(typeof window !== 'undefined' ? window : this);
