'use strict';
(() => {
const SAVE_KEY = 'nonbiri-shanghai-v1';
const OPT_KEY = 'nonbiri-shanghai-opts';
const BEST_KEY = 'nonbiri-shanghai-best';
const RATIO = 1.28;   // tile height / width
const DEPTH = 0.12;   // layer thickness as fraction of tile width

/* ---------------- faces ---------------- */
const SUITS = ['m', 'p', 's'];
const BASE = [];
SUITS.forEach(s => { for (let n = 1; n <= 9; n++) BASE.push(s + n); });
['wE', 'wS', 'wW', 'wN', 'dC', 'dF', 'dP'].forEach(f => BASE.push(f));
// Classic rule: any season matches any season, any flower any flower. Strict option: identical faces only.
const group = f => ((S && S.strict) ? f : f[0] === 'x' ? 'x' : f[0] === 'f' ? 'f' : f);
function pairPool(strict) {
  const p = [];
  BASE.forEach(f => { p.push([f, f]); p.push([f, f]); });
  if (strict) {
    // same-picture pairs only: two random seasons and two random flowers, each appearing twice
    const xs = shuffleArr(['x1', 'x2', 'x3', 'x4']).slice(0, 2), fs = shuffleArr(['f1', 'f2', 'f3', 'f4']).slice(0, 2);
    xs.concat(fs).forEach(f => p.push([f, f]));
  } else p.push(['x1', 'x2'], ['x3', 'x4'], ['f1', 'f2'], ['f3', 'f4']);
  return p; // 72 pairs = 144 tiles
}

/* ---- original "sumi & shu" brush style faces (all drawn here, no external art) ---- */
const INK = '#1d1a17', SHU = '#c8321e', AI = '#1f3f8f', MATSU = '#1d6b38', WASHI = '#fffaf0';
const FONT = `font-family="Hiragino Mincho ProN,Yu Mincho,Noto Serif CJK JP,Noto Serif JP,Hiragino Sans,Noto Sans CJK JP,serif" font-weight="900" text-anchor="middle" dominant-baseline="central"`;
const KANJI_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const txt = (x, y, s, c, t, extra = '') => `<text x="${x}" y="${y}" font-size="${s}" fill="${c}" stroke="${c}" stroke-width="${(s / 34).toFixed(2)}" stroke-linejoin="round" ${FONT} ${extra}>${t}</text>`;
// Number badges (kanji, no Arabic digits): 筒 = formal kanji on an indigo square, 索 = plain kanji on a green circle.
const DAIJI = ['', '壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖'];
const BADGE_FONT = `font-family="Hiragino Sans,Hiragino Kaku Gothic ProN,Noto Sans CJK JP,Noto Sans JP,Yu Gothic,sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="central"`;
const corner = (n, kind) => (kind === 'p'
  ? `<rect x="0.5" y="0.5" width="30" height="30" rx="6" fill="${AI}"/><text x="15.5" y="16.3" font-size="25" fill="#fff" ${BADGE_FONT}>${DAIJI[n]}</text>`
  : `<circle cx="15.5" cy="15.5" r="15" fill="${MATSU}"/><text x="15.5" y="16.3" font-size="25" fill="#fff" stroke="#fff" stroke-width=".7" ${BADGE_FONT}>${KANJI_NUM[n]}</text>`);
const shrink = (b, nums) => (nums ? `<g transform="translate(17.5 23) scale(.71)">${b}</g>` : b);
// ensō ring: an open brush circle with a coloured heart
const enso = (x, y, r, c, heart, rot) => {
  const rr = r * .74, L = 2 * Math.PI * rr;
  return `<circle cx="${x}" cy="${y}" r="${rr.toFixed(2)}" fill="none" stroke="${c}" stroke-width="${(r * .46).toFixed(2)}" stroke-linecap="round" stroke-dasharray="${(L * .84).toFixed(2)} ${L.toFixed(2)}" transform="rotate(${rot} ${x} ${y})"/>` +
    `<circle cx="${x}" cy="${y}" r="${(r * .3).toFixed(2)}" fill="${heart}"/>`;
};
const PIN = {
  2: [[30, 22, AI], [30, 58, MATSU]],
  3: [[15, 17, AI], [30, 40, SHU], [45, 63, MATSU]],
  4: [[18, 22, AI], [42, 22, MATSU], [18, 58, MATSU], [42, 58, AI]],
  5: [[17, 18, AI], [43, 18, MATSU], [30, 40, SHU], [17, 62, MATSU], [43, 62, AI]],
  6: [[19, 15, MATSU], [41, 15, MATSU], [19, 42, SHU], [41, 42, SHU], [19, 64, SHU], [41, 64, SHU]],
  7: [[14, 12, MATSU], [30, 19, MATSU], [46, 26, MATSU], [19, 46, SHU], [41, 46, SHU], [19, 66, SHU], [41, 66, SHU]],
  8: [[19, 12, AI], [41, 12, AI], [19, 31, AI], [41, 31, AI], [19, 50, AI], [41, 50, AI], [19, 68, AI], [41, 68, AI]],
  9: [[14, 15, AI], [30, 15, AI], [46, 15, AI], [14, 40, SHU], [30, 40, SHU], [46, 40, SHU], [14, 65, MATSU], [30, 65, MATSU], [46, 65, MATSU]],
};
const PIN_R = { 2: 12, 3: 10, 4: 10.5, 5: 9.5, 6: 9.2, 7: 8.4, 8: 8.4, 9: 7.8 };
const heartOf = c => (c === SHU ? AI : c === AI ? SHU : INK);
const SOU = {
  2: [[30, 22, 28, MATSU], [30, 58, 28, MATSU]],
  3: [[30, 22, 28, MATSU], [17, 58, 28, MATSU], [43, 58, 28, MATSU]],
  4: [[19, 22, 28, MATSU], [41, 22, 28, MATSU], [19, 58, 28, MATSU], [41, 58, 28, MATSU]],
  5: [[16, 22, 28, MATSU], [44, 22, 28, MATSU], [30, 40, 28, SHU], [16, 58, 28, MATSU], [44, 58, 28, MATSU]],
  6: [[14, 22, 28, MATSU], [30, 22, 28, MATSU], [46, 22, 28, MATSU], [14, 58, 28, MATSU], [30, 58, 28, MATSU], [46, 58, 28, MATSU]],
  7: [[30, 13, 20, SHU], [14, 40, 20, MATSU], [30, 40, 20, MATSU], [46, 40, 20, MATSU], [14, 66, 20, MATSU], [30, 66, 20, MATSU], [46, 66, 20, MATSU]],
  8: [[12, 22, 28, MATSU], [24, 22, 28, MATSU], [36, 22, 28, MATSU], [48, 22, 28, MATSU], [12, 58, 28, MATSU], [24, 58, 28, MATSU], [36, 58, 28, MATSU], [48, 58, 28, MATSU]],
  9: [[14, 15, 21, MATSU], [30, 15, 21, SHU], [46, 15, 21, MATSU], [14, 40, 21, MATSU], [30, 40, 21, SHU], [46, 40, 21, MATSU], [14, 65, 21, MATSU], [30, 65, 21, SHU], [46, 65, 21, MATSU]],
};
// bamboo stalk: tapered brush stroke, slanted ends, ink node and a little leaf flick
const stalk = (x, y, h, c, w = 7.5) => {
  const t = y - h / 2, b = y + h / 2, a = w / 2;
  return `<path d="M${x - a} ${t + 1.6} L${x + a} ${t - .4} L${x + a * .82} ${b - .6} L${x - a * .86} ${b + .8} Z" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/>` +
    `<path d="M${x - a - 1.2} ${y + .6} Q${x} ${y - 1.4} ${x + a + 1.2} ${y + .2}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    `<path d="M${x - a * .3} ${t + 3} L${x - a * .3} ${y - 2.5}" stroke="${WASHI}" stroke-width="1.2" stroke-linecap="round" opacity=".75"/>`;
};
const P = (d, c, op = 1) => `<path d="${d}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const petals = (cx, cy, r, n, pr, c, rx, ry, rot = 0) => { let s = ''; for (let i = 0; i < n; i++) { const a = rot + i * 360 / n; s += `<ellipse cx="${cx}" cy="${cy - r}" rx="${rx}" ry="${ry}" fill="${c}" transform="rotate(${a} ${cx} ${cy})"/>`; } return s; };
const MOTIF = {
  // pale washes drawn behind the big character
  sakura: c => petals(30, 46, 11, 5, 0, c, 7, 10.5, 0) + `<circle cx="30" cy="46" r="4" fill="${c}"/>`,
  sun: c => `<circle cx="30" cy="46" r="12" fill="${c}"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M30 25 L33 30 L27 30 Z" fill="${c}" transform="rotate(${i * 45} 30 46)"/>`).join(''),
  maple: c => P('M30 22 L34 34 L45 29 L39 40 L49 45 L37 48 L40 60 L31 52 L30 66 L29 52 L20 60 L23 48 L11 45 L21 40 L15 29 L26 34 Z', c),
  snow: c => [0, 60, 120].map(a => `<g transform="rotate(${a} 30 46)"><path d="M30 26 L30 66 M25 31 L30 35 L35 31 M25 61 L30 57 L35 61" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none"/></g>`).join(''),
  plum: c => petals(30, 46, 10, 5, 0, c, 8.5, 8.5, 36),
  orchid: c => P('M14 66 Q22 40 44 26 Q28 44 18 66 Z', c) + P('M46 66 Q40 46 22 34 Q38 40 50 66 Z', c) + P('M30 66 Q28 50 34 38 Q32 52 34 66 Z', c),
  kiku: c => petals(30, 46, 11, 14, 0, c, 3.4, 9, 0) + `<circle cx="30" cy="46" r="5" fill="${c}"/>`,
  take: c => P('M30 66 Q14 48 22 26 Q30 46 30 66 Z', c) + P('M31 64 Q46 52 48 32 Q36 46 31 64 Z', c) + P('M30 66 Q24 56 10 54 Q22 62 30 66 Z', c),
};
// Seasons: amber frame + 季 badge. Flowers: plum-purple frame + 花 badge.
const FAMILY = { x: { frame: '#b86e00', bg: '#fff3d9', badge: '季' }, f: { frame: '#7d3a9a', bg: '#f8ecff', badge: '花' } };
const SEASON = [['春', '#c92a62', 'sakura', '#f7b6cc'], ['夏', '#c24100', 'sun', '#ffd27a'], ['秋', '#8f3d0c', 'maple', '#f2b07a'], ['冬', '#1b56a6', 'snow', '#b9d4f5']];
const FLOWER = [['梅', '#b0173f', 'plum', '#f5b3c3'], ['蘭', '#5a2fc0', 'orchid', '#d3c4f7'], ['菊', '#a54e00', 'kiku', '#ffd08a'], ['竹', '#1c6b33', 'take', '#bfe3c4']];
const WIND = {
  E: ['東', `<circle cx="42" cy="22" r="11" fill="#f8c4b4"/><path d="M4 70 L22 34 Q30 28 38 34 L56 70 Z" fill="#c9d6ee"/><path d="M22 34 Q30 28 38 34 L41 41 Q36 38 33 42 Q30 37 27 42 Q24 38 19 41 Z" fill="#fff"/>`], // 富士と日の出
  S: ['南', P('M30 8 Q54 40 30 74 Q6 40 30 8 Z', '#fbd88a')],                                     // warm flame
  W: ['西', P('M40 12 A29 29 0 1 0 40 70 A36 36 0 0 1 40 12 Z', '#c5cff0')],                      // crescent moon
  N: ['北', [0, 60, 120].map(a => `<g transform="rotate(${a} 30 41)"><path d="M30 13 L30 69 M23 19 L30 25 L37 19 M23 63 L30 57 L37 63" stroke="#bcd6f2" stroke-width="5.5" stroke-linecap="round" fill="none"/></g>`).join('')] }; // snow crystal
const svgCache = {};
function faceSVG(f, nums) {
  const key = f + (nums ? '#' : '');
  if (svgCache[key]) return svgCache[key];
  let b = '';
  const k = f[0], n = +f[1];
  if (k === 'm') {
    b = txt(30, 24, 36, INK, KANJI_NUM[n]) +
      `<g transform="rotate(-4 30 59)"><rect x="12" y="44" width="36" height="30" rx="6" fill="${SHU}"/><rect x="15" y="47" width="30" height="24" rx="4" fill="none" stroke="${WASHI}" stroke-width="1.2" opacity=".8"/></g>` +
      `<text x="30" y="59.5" font-size="22" fill="${WASHI}" ${FONT} transform="rotate(-4 30 59)">萬</text>`;
  } else if (k === 'p') {
    if (n === 1) b = enso(30, 40, 26, INK, 'none', -70) + `<circle cx="30" cy="40" r="10" fill="${SHU}"/>` + petals(30, 40, 3.2, 5, 0, WASHI, 1.8, 1.8, 0);
    else b = PIN[n].map(([x, y, c], i) => enso(x, y, PIN_R[n], c, heartOf(c), -80 + i * 47)).join('');
    b = shrink(b, nums); if (nums) b += corner(n, 'p');
  } else if (k === 's') {
    if (n === 1) b = stalk(12, 42, 62, MATSU, 8) + // 鯛 (sea bream) leaping past bamboo
      `<g transform="rotate(-28 34 42)"><path d="M14 42 Q22 22 42 26 Q52 30 54 42 Q52 54 42 58 Q22 62 14 42 Z" fill="${SHU}" stroke="#7a1a10" stroke-width="2"/>` +
      `<path d="M54 42 L64 32 L62 42 L64 52 Z" fill="${SHU}" stroke="#7a1a10" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M24 28 Q34 18 44 27" fill="#e85a3c" stroke="#7a1a10" stroke-width="1.5"/>` +
      `<circle cx="22" cy="38" r="3.4" fill="#fff"/><circle cx="22" cy="38" r="1.8" fill="#111"/>` +
      `<path d="M30 34 Q34 42 30 50 M38 33 Q42 42 38 51" stroke="#ffd2c4" stroke-width="1.6" fill="none"/></g>`;
    else b = SOU[n].map(([x, y, h, c]) => stalk(x, y, h, c)).join('');
    b = shrink(b, nums); if (nums) b += corner(n, 's');
  } else if (k === 'w') {
    const [ch, wash] = WIND[f[1]];
    b = wash + txt(30, 41, 44, INK, ch);
  } else if (k === 'd') {
    if (f[1] === 'C') b = `<g fill="#f6c6bb"><path d="M4 16 Q30 10 56 16 L54 22 Q30 17 6 22 Z"/><rect x="9" y="26" width="42" height="5"/><rect x="14" y="20" width="6" height="52"/><rect x="40" y="20" width="6" height="52"/></g>` + txt(30, 42, 46, SHU, '中'); // 鳥居
    else if (f[1] === 'F') b = `<g transform="translate(-3 -6) scale(1.1)">${MOTIF.take('#b5ddb9')}</g>` + txt(30, 40, 42, MATSU, '發');
    else { // ガリ: pink pickled-ginger slices on an indigo-rimmed dish
      const slice = (x, y, r, c) => `<path d="M${x - 15} ${y + 4} Q${x - 14} ${y - 12} ${x} ${y - 13} Q${x + 15} ${y - 12} ${x + 15} ${y + 3} Q${x + 6} ${y - 1} ${x} ${y + 3} Q${x - 7} ${y - 1} ${x - 15} ${y + 4} Z" fill="${c}" stroke="#c2456f" stroke-width="1.6" stroke-linejoin="round" transform="rotate(${r} ${x} ${y})"/>`;
      b = `<ellipse cx="30" cy="58" rx="25" ry="11" fill="#fff" stroke="${AI}" stroke-width="3"/><ellipse cx="30" cy="57" rx="17" ry="6" fill="none" stroke="${AI}" stroke-width="1" opacity=".5"/>` +
        slice(24, 54, -14, '#ffc2d4') + slice(36, 52, 12, '#ff9fbd') + slice(30, 44, -2, '#ffb3ca') +
        `<path d="M22 46 Q24 42 28 41 M32 40 Q37 41 39 44" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".9"/>` +
        txt(30, 17, 19, '#c2185b', 'ガリ');
    }
  } else if (k === 'x' || k === 'f') {
    const [ch, c, motif, pale] = (k === 'x' ? SEASON : FLOWER)[n - 1];
    const F = FAMILY[k];
    b = `<rect x="2.5" y="2.5" width="55" height="75" rx="7" fill="${F.bg}" stroke="${F.frame}" stroke-width="4.5"/>` +
      `<rect x="7" y="7" width="46" height="66" rx="4" fill="none" stroke="${F.frame}" stroke-width="1" stroke-dasharray="3 2.5" opacity=".7"/>` +
      `<g opacity=".85">${MOTIF[motif](pale)}</g>` + txt(30, 47, 36, c, ch) +
      `<circle cx="13" cy="13" r="10" fill="${F.frame}"/><text x="13" y="13.5" font-size="13" fill="#fff" ${FONT}>${F.badge}</text>`;
  }
  return (svgCache[key] = `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">${b}</svg>`);
}

/* ---- mascot: the owner's own イルカ character artwork ---- */
// Stamps from the owner's LINE sticker set (background removed, img/st/*.webp). Shown briefly in a corner; never blocks play.
const STAMP_DATA = null; // replaced by inline data URIs in the single-file build
const stampSrc = n => (STAMP_DATA && STAMP_DATA[n]) || 'img/st/' + n + '.webp';
const stampImg = (n, cls = '') => `<img class="stamp ${cls}" src="${stampSrc(n)}" alt="" draggable="false">`;
const pick = a => a[Math.floor(Math.random() * a.length)];
let palT = 0, palLast = 0;
function pal(n, ms = 1700, force = false) {
  const now = Date.now(); if (!force && now - palLast < 900) return; palLast = now;
  const el = document.getElementById('pal'); if (!el) return;
  el.innerHTML = stampImg(n); el.style.animationDuration = (ms / 1000) + 's'; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(palT); palT = setTimeout(() => el.classList.remove('show'), ms);
}
const titleHidden = () => { const t = document.getElementById('ovTitle'); return !t || t.hidden; };

/* ---------------- layouts (tile units, may use .5) ---------------- */
function rect(t, x0, y0, c, r, z) { for (let j = 0; j < r; j++) for (let i = 0; i < c; i++) t.push({ hx: Math.round(2 * (x0 + i)), hy: Math.round(2 * (y0 + j)), z }); }
function uniq(t) { const s = new Set(); return t.filter(p => { const k = p.hx + ',' + p.hy + ',' + p.z; if (s.has(k)) return false; s.add(k); return true; }); }
// difficulty shown on a banner at game start (by tile count / stacking height)
const DIFF = { easy: 0, diamond: 0, cross: 1, pyramid: 1, butterfly: 1, castle: 2, tower: 2, turtle: 3 };
const DIFF_INFO = [['かんたん', '★☆☆☆', 'ryokai'], ['ふつう', '★★☆☆', 'shuppatsu'], ['むずかしい', '★★★☆', 'chui'], ['スーパーハード', '★★★★', 'anzendaiichi']];
const SLOTS = 4, MAGNETS = 3;
const LAYOUTS = [
  { id: 'easy', name: '小舟', build() { const t = []; rect(t, 0, 0, 4, 6, 0); rect(t, 1, 1, 2, 4, 1); return t; } },
  { id: 'diamond', name: '菱餅', build() {
      const t = [];[2, 4, 6, 6, 4, 2].forEach((w, y) => rect(t, (6 - w) / 2, y, w, 1, 0));
      [2, 4, 4, 2].forEach((w, i) => rect(t, (6 - w) / 2, i + 1, w, 1, 1));
      rect(t, 2, 2, 2, 2, 2); return t; } },
  { id: 'cross', name: '手裏剣', build() {
      const t = []; rect(t, 2, 0, 2, 8, 0); rect(t, 0, 3, 6, 2, 0);
      rect(t, 2, 1, 2, 6, 1); rect(t, 1, 3, 4, 2, 1); rect(t, 2, 3, 2, 2, 2); return uniq(t); } },
  { id: 'pyramid', name: '富士山', build() { const t = []; rect(t, 0, 0, 6, 6, 0); rect(t, 1, 1, 4, 4, 1); rect(t, 2, 2, 2, 2, 2); return t; } },
  { id: 'butterfly', name: '扇', build() {
      const t = []; rect(t, 0, 0, 3, 6, 0); rect(t, 4, 0, 3, 6, 0); rect(t, 3, 2, 1, 2, 0);
      rect(t, 0.5, 1, 2, 4, 1); rect(t, 4.5, 1, 2, 4, 1); rect(t, 1, 2.5, 1, 1, 2); rect(t, 5, 2.5, 1, 1, 2); return t; } },
  { id: 'castle', name: 'お城', build() {
      const t = []; rect(t, 0, 0, 8, 6, 0);
      [[0, 0], [6, 0], [0, 4], [6, 4]].forEach(([x, y]) => { rect(t, x, y, 2, 2, 1); rect(t, x + .5, y + .5, 1, 1, 2); });
      rect(t, 3, 2, 2, 2, 1); return t; } },
  { id: 'tower', name: '五重塔', build() { const t = []; rect(t, 0, 0, 6, 8, 0); rect(t, 1, 1, 4, 6, 1); rect(t, 2, 2, 2, 4, 2); rect(t, 2, 3, 2, 2, 3); return t; } },
  { id: 'turtle', name: '亀（定番）', build() {
      const t = [];
      [[1, 12], [3, 8], [2, 10], [1, 12], [1, 12], [2, 10], [3, 8], [1, 12]].forEach(([x, w], y) => rect(t, x, y, w, 1, 0));
      rect(t, 0, 3.5, 1, 1, 0); rect(t, 13, 3.5, 2, 1, 0);
      rect(t, 4, 1, 6, 6, 1); rect(t, 5, 2, 4, 4, 2); rect(t, 6, 3, 2, 2, 3); rect(t, 6.5, 3.5, 1, 1, 4);
      return t; } },
];

/* ---------------- geometry / rules ---------------- */
function neighbors(tiles) {
  return tiles.map((a, i) => {
    const nb = { up: [], l: [], r: [] };
    tiles.forEach((b, j) => {
      if (i === j) return;
      const dx = b.hx - a.hx, dy = b.hy - a.hy;
      if (Math.abs(dy) >= 2) return;
      if (b.z > a.z && Math.abs(dx) < 2) nb.up.push(j);
      else if (b.z === a.z && dx === -2) nb.l.push(j);
      else if (b.z === a.z && dx === 2) nb.r.push(j);
    });
    return nb;
  });
}
function isFree(nb, alive, i) {
  const n = nb[i];
  if (n.up.some(j => alive[j])) return false;
  return !n.l.some(j => alive[j]) || !n.r.some(j => alive[j]);
}
const rnd = n => Math.floor(Math.random() * n);
function shuffleArr(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Reverse-placement deal: remove random free pairs from the empty structure; that removal order
// is a guaranteed solution, then put matching pairs on each removed couple.
let lastOrder = null; // removal order that is guaranteed to clear the deal (used by tests)
// Like solvableAssign, but some faces are "singles": their partner is already held in a slot, so a single
// free position is enough to remove them. Order entries are [a, b] (pair) or [a] (single vs. slot).
function solvableAssignSingles(nb, n, idxs, pairs, singles, tries = 600) {
  for (let t = 0; t < tries; t++) {
    const alive = new Array(n).fill(false); idxs.forEach(i => alive[i] = true);
    let left = idxs.length, sLeft = singles.length; const order = []; let ok = true;
    while (left > 0) {
      const free = idxs.filter(i => alive[i] && isFree(nb, alive, i));
      if (!free.length) { ok = false; break; }
      const pairsLeft = (left - sLeft) / 2;
      const takeSingle = sLeft > 0 && (free.length < 2 || pairsLeft === 0 || Math.random() < sLeft / (sLeft + pairsLeft));
      if (takeSingle) { const a = free[rnd(free.length)]; alive[a] = false; order.push([a]); left--; sLeft--; continue; }
      if (free.length < 2) { ok = false; break; }
      const a = free.splice(rnd(free.length), 1)[0], b = free[rnd(free.length)];
      alive[a] = alive[b] = false; order.push([a, b]); left -= 2;
    }
    if (!ok) continue;
    lastOrder = order;
    const ps = shuffleArr(pairs.slice()), ss = shuffleArr(singles.slice()); const faces = {}; let pk = 0, sk = 0;
    order.forEach(o => { if (o.length === 1) faces[o[0]] = ss[sk++]; else { const s2 = Math.random() < .5, p = ps[pk++]; faces[o[0]] = p[s2 ? 0 : 1]; faces[o[1]] = p[s2 ? 1 : 0]; } });
    return faces;
  }
  return null;
}
function solvableAssign(nb, n, idxs, pairs, tries = 400) {
  for (let t = 0; t < tries; t++) {
    const alive = new Array(n).fill(false); idxs.forEach(i => alive[i] = true);
    let left = idxs.length; const order = []; let ok = true;
    while (left > 0) {
      const free = idxs.filter(i => alive[i] && isFree(nb, alive, i));
      if (free.length < 2) { ok = false; break; }
      const a = free.splice(rnd(free.length), 1)[0];
      const b = free[rnd(free.length)];
      alive[a] = alive[b] = false; order.push([a, b]); left -= 2;
    }
    if (!ok) continue;
    lastOrder = order;
    const ps = shuffleArr(pairs.slice()); const faces = {};
    order.forEach(([a, b], k) => { const s = Math.random() < .5; faces[a] = ps[k][s ? 0 : 1]; faces[b] = ps[k][s ? 1 : 0]; });
    return faces;
  }
  return null;
}

/* ---------------- state ---------------- */
let S = null, NB = null, sel = -1, selSlot = -1, hintPair = null, els = [], busy = false, opts = { dim: true, nums: true, strict: false, sound: true };
const SEEN_KEY = 'nonbiri-shanghai-seen';
const $ = id => document.getElementById(id);
const board = $('board');

function loadOpts() { try { Object.assign(opts, JSON.parse(localStorage.getItem(OPT_KEY) || '{}')); } catch (e) {} if (!opts.v15) { opts.dim = true; opts.v15 = 1; } }
function saveOpts() { try { localStorage.setItem(OPT_KEY, JSON.stringify(opts)); } catch (e) {} }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }

function boardSize() { return { w: Math.max(board.clientWidth, 100), h: Math.max(board.clientHeight, 100) }; }
function extents(tiles) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  tiles.forEach(p => {
    const x = p.hx / 2 - p.z * DEPTH, y = p.hy / 2 * RATIO - p.z * DEPTH;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1 + DEPTH); y1 = Math.max(y1, y + RATIO + DEPTH);
  });
  return { x0, y0, w: x1 - x0, h: y1 - y0 };
}
function fitW(tiles, bw, bh) { const e = extents(tiles); return Math.min((bw - 10) / e.w, (bh - 10) / e.h); }

function newGame(layoutIdx, level) {
  const L = LAYOUTS[layoutIdx];
  let tiles = L.build();
  // Turn wide layouts sideways when that makes tiles bigger on this screen (kept for the whole game).
  const { w, h } = boardSize();
  const tr = tiles.map(p => ({ hx: p.hy, hy: p.hx, z: p.z }));
  const f0 = fitW(tiles, w, h), f1 = fitW(tr, w, h);
  const lw = t => { const e = extents(t); return longW((w - 10) / e.w, (h - 10) / e.h); };
  let useTr = f1 > f0 * 1.08;
  // will start zoomed: keep that orientation if it zooms to 40px+ scrolling one way, else take the one that zooms bigger
  if (opts.autoZoom !== false && Math.max(f0, f1) < ZOOM_AUTO_BELOW && lw(useTr ? tr : tiles) < 40) useTr = lw(tr) > lw(tiles);
  if (useTr) tiles = tr;
  const nb = neighbors(tiles);
  const strict = !!opts.strict;
  const pairs = shuffleArr(pairPool(strict)).slice(0, tiles.length / 2);
  const idxs = tiles.map((_, i) => i);
  const faces = solvableAssign(nb, tiles.length, idxs, pairs, 2000);
  S = { v: 1, strict, layout: layoutIdx, level, tiles, faces: tiles.map((_, i) => faces[i]), alive: tiles.map(() => true),
        hist: [], time: 0, done: false, initFaces: null, aid: { h: 0, u: 0, s: 0, m: 0, k: 0 },
        held: Array.from({ length: SLOTS }, () => []), magnet: MAGNETS, zoom: 0 };
  S.initFaces = S.faces.slice();
  S.zoom = autoZoom();
  NB = nb; sel = -1; selSlot = -1; hintPair = null;
  build(); save(); hideOv();
  if (titleHidden()) banner();
}
function restartSame() {
  S.faces = S.initFaces.slice(); S.alive = S.tiles.map(() => true); S.hist = []; S.time = 0; S.done = false; S.aid = { h: 0, u: 0, s: 0, m: 0, k: 0 };
  S.held = Array.from({ length: SLOTS }, () => []); S.magnet = MAGNETS;
  sel = -1; selSlot = -1; hintPair = null; build(); save(); hideOv();
}

/* ---------------- rendering ---------------- */
function build() {
  board.innerHTML = ''; els = [];
  board.classList.toggle('dim', !!opts.dim);
  S.tiles.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'tile pop';
    d.dataset.i = i;
    d.innerHTML = faceSVG(S.faces[i], opts.nums);
    if (!S.alive[i]) d.classList.add('hidden');
    board.appendChild(d); els.push(d);
  });
  ensureState(); layout(); refresh();
  board.scrollLeft = (board.scrollWidth - board.clientWidth) / 2; board.scrollTop = (board.scrollHeight - board.clientHeight) / 2;
  setTimeout(() => els.forEach(e => e.classList.remove('pop')), 400);
}
function layout() {
  if (!S) return;
  const { w, h } = boardSize();
  const e = extents(S.tiles);
  const W = zoomW(e, w, h, S.zoom || 0);
  const H = W * RATIO, D = W * DEPTH, P = 5;
  // when zoomed the board scrolls (native pan); keep a small margin so edge tiles are reachable
  const cw = e.w * W, ch = e.h * W;
  const ox = Math.max(P, (w - cw) / 2) - e.x0 * W, oy = Math.max(P, (h - ch) / 2) - e.y0 * W;
  const fr = { x: board.scrollWidth > w ? (board.scrollLeft + w / 2) / board.scrollWidth : 0.5, y: board.scrollHeight > h ? (board.scrollTop + h / 2) / board.scrollHeight : 0.5 };
  board.style.setProperty('--d', D.toFixed(1) + 'px');
  S.tiles.forEach((p, i) => {
    const s = els[i].style;
    s.left = (ox + p.hx / 2 * W - p.z * D).toFixed(1) + 'px';
    s.top = (oy + p.hy / 2 * H - p.z * D).toFixed(1) + 'px';
    s.width = (W - 1).toFixed(1) + 'px'; s.height = (H - 1).toFixed(1) + 'px';
    s.zIndex = p.z * 1000 + p.hy * 10 + p.hx;
    s.fontSize = W + 'px';
  });
  // spacer so the scroll area includes the right/bottom margin
  let sp = board.querySelector('.spacer'); if (!sp) { sp = document.createElement('i'); sp.className = 'spacer'; board.appendChild(sp); }
  sp.style.left = (Math.max(P, (w - cw) / 2) + cw + P - 1).toFixed(0) + 'px'; sp.style.top = (Math.max(P, (h - ch) / 2) + ch + P - 1).toFixed(0) + 'px';
  board.classList.toggle('zoomed', cw > w + 1 || ch > h + 1);
  if (layout.keep) { board.scrollLeft = fr.x * board.scrollWidth - w / 2; board.scrollTop = fr.y * board.scrollHeight - h / 2; }
  layout.W = W; layout.fit = Math.min((w - 10) / e.w, (h - 10) / e.h);
  const zl = $('zoomL'); if (zl) { zl.textContent = S.zoom ? '全体' : '拡大'; $('zoomPlus').style.display = S.zoom ? 'none' : ''; $('bZoom').classList.toggle('on', !!S.zoom); }
}
// Tile width for zoom level k: 0 = whole board fits; 1 = readable (fill the long side, ~50px+); 2 = big.
function zoomW(e, w, h, k) {
  const a = (w - 10) / e.w, b = (h - 10) / e.h, fit = Math.min(a, b, 130);
  if (!k) return fit;
  const z1 = Math.min(130, Math.max(fit, longW(a, b)));
  if (k === 1) return z1;
  return Math.min(130, Math.max(66, z1 * 1.3));
}
// zoom 1 fills the long side (scrolling one way only) when that gives 40px+, capped at 62px; otherwise 52px both ways
const longW = (a, b) => { const l = Math.max(a, b); return l >= 40 ? Math.min(l, 62) : 52; };
const ZOOM_AUTO_BELOW = 52; // px: auto-zoom when the whole-board tile width would be smaller than this
function autoZoom() {
  if (opts.autoZoom === false) return 0;
  const { w, h } = boardSize(), e = extents(S.tiles);
  return Math.min((w - 10) / e.w, (h - 10) / e.h) < ZOOM_AUTO_BELOW ? nextZoom(0) : 0;
}
// skip level 1 when it would barely change anything (board already fills the long side)
function nextZoom(k) {
  const { w, h } = boardSize(), e = extents(S.tiles);
  let n = (k + 1) % 3;
  if (n === 1 && zoomW(e, w, h, 1) < zoomW(e, w, h, 0) * 1.08) n = 2;
  return n;
}
function setZoom(k) {
  S.zoom = k; layout.keep = true; layout(); layout.keep = false; save();
  if (k && !opts.panTip) { opts.panTip = 1; saveOpts(); toast('拡大中：盤面を指でなぞると動かせます', 2800); }
}
function toggleZoom() { if (!S) return; setZoom(nextZoom(S.zoom || 0)); sfx('sel'); }
function reveal(el) { if (el && board.classList.contains('zoomed') && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }
function freeList() { return S.tiles.map((_, i) => i).filter(i => S.alive[i] && isFree(NB, S.alive, i)); }
function ensureState() {
  if (!Array.isArray(S.held) || S.held.length !== SLOTS) S.held = Array.from({ length: SLOTS }, () => []);
  if (typeof S.magnet !== 'number') S.magnet = MAGNETS;
  if (typeof S.zoom !== 'number') S.zoom = 0;
  aid();
}
const heldTop = k => S.held[k][S.held[k].length - 1];
const heldCount = () => S.held.reduce((n, st) => n + st.length, 0);
const slotOf = g => S.held.findIndex(st => st.length && group(S.faces[st[0]]) === g);
// Every available match. Items are tile indices, or 'h<k>' for the top tile of slot k.
// A slot holding 2+ tiles is itself a pair: ['h<k>', 'h<k>'].
function movePairs() {
  const by = {}; freeList().forEach(i => { const g = group(S.faces[i]); (by[g] = by[g] || []).push(i); });
  const res = []; Object.values(by).forEach(a => { for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) res.push([a[i], a[j]]); });
  if (S.held) S.held.forEach((st, k) => {
    if (!st.length) return;
    if (st.length >= 2) res.push(['h' + k, 'h' + k]);
    (by[group(S.faces[st[0]])] || []).forEach(i => res.push(['h' + k, i]));
  });
  return res;
}
const emptySlot = () => S.held.findIndex(st => !st.length);
const canPark = () => emptySlot() >= 0 && freeList().length > 0;
function fmt(t) { const m = Math.floor(t / 60), s = t % 60; return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`; }
function refresh() {
  const free = new Set(freeList());
  els.forEach((e, i) => {
    e.classList.toggle('blocked', S.alive[i] && !free.has(i));
    e.classList.toggle('sel', i === sel);
    e.classList.toggle('hint', !!hintPair && hintPair.includes(i));
  });
  renderSlots();
  const left = S.alive.filter(Boolean).length + heldCount(), mv = movePairs().length;
  $('left').textContent = left; $('moves').textContent = mv; $('time').textContent = fmt(S.time);
  $('lvl').textContent = 'レベル ' + S.level; $('lname').textContent = LAYOUTS[S.layout].name;
  $('bUndo').disabled = S.hist.length === 0;
  $('bMagnet').disabled = !S.magnet; $('magN').textContent = S.magnet;
  if (!S.done && left === 0) win();
  else if (!S.done && left > 0 && mv === 0 && !canPark()) setTimeout(noMoves, 450);
}

/* ---------------- interaction ---------------- */
function vanish(k) { const el = els[k]; el.classList.remove('sel'); el.classList.add('gone'); setTimeout(() => { if (els[k] === el && !S.alive[k]) el.classList.add('hidden'); }, 340); }
function cleared(fa, fb, sparkEls) { bonusTip(fa, fb); sfx('match'); sparkEls.forEach(spark); }
function shakeTile(i) { const e = els[i]; e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); }
function tap(i) {
  if (S.done || !S.alive[i]) return;
  if (!isFree(NB, S.alive, i)) { shakeTile(i); toast('この牌はまだ取れません'); sfx('bad'); pal('anzendaiichi', 1500); return; }
  if (sel === i) { sel = -1; refresh(); return; }
  // held tile selected → match it with this board tile
  if (selSlot >= 0 && S.held[selSlot].length && group(S.faces[heldTop(selSlot)]) === group(S.faces[i])) {
    const k = selSlot, h = S.held[k].pop(); sel = -1; selSlot = -1; hintPair = null;
    S.alive[i] = false; S.hist.push({ t: 'hp', k, h, b: i });
    cleared(S.faces[h], S.faces[i], [els[i], slotEl(k)]); vanish(i); save(); refresh(); return;
  }
  if (sel >= 0 && group(S.faces[sel]) === group(S.faces[i])) {
    const a = sel, b = i; sel = -1; hintPair = null;
    S.alive[a] = S.alive[b] = false; S.hist.push({ t: 'p', a, b });
    cleared(S.faces[a], S.faces[b], [els[a], els[b]]); [a, b].forEach(vanish);
    save(); refresh(); return;
  }
  sel = i; selSlot = -1; hintPair = null; sfx('sel'); refresh();
}
// Move a free board tile into the holding area (stacks onto a slot of the same kind, else into slot k / any empty slot).
function park(i, k) {
  const g = group(S.faces[i]); let to = slotOf(g);
  if (to < 0) to = (k >= 0 && !S.held[k].length) ? k : emptySlot();
  if (to < 0) { toast('スロットがいっぱいです'); sfx('bad'); return false; }
  S.alive[i] = false; S.held[to].push(i); S.hist.push({ t: 'm', i, k: to }); aid().k++;
  sel = -1; selSlot = -1; hintPair = null; vanish(i); sfx('sel');
  if (S.held[to].length >= 2) toast('そろいました！スロットをタップで消せます', 2200);
  save(); refresh(); return true;
}
function tapSlot(k) {
  if (S.done) return;
  const st = S.held[k];
  if (!st.length) {
    if (sel >= 0) { park(sel, k); return; }
    toast('牌をえらんでから、空きスロットをタップ'); return;
  }
  const g = group(S.faces[st[0]]);
  if (sel >= 0) {
    if (group(S.faces[sel]) === g) { // board tile + held tile
      const b = sel, h = st.pop(); sel = -1; selSlot = -1; hintPair = null;
      S.alive[b] = false; S.hist.push({ t: 'hp', k, h, b });
      cleared(S.faces[h], S.faces[b], [els[b], slotEl(k)]); vanish(b); save(); refresh(); return;
    }
    sel = -1;
  }
  if (st.length >= 2) { // a stack is already a matching pair: one tap clears it
    const a = st.pop(), b = st.pop(); selSlot = -1; hintPair = null;
    S.hist.push({ t: 'hh', k, a, b }); cleared(S.faces[a], S.faces[b], [slotEl(k)]); save(); refresh(); return;
  }
  selSlot = selSlot === k ? -1 : k; hintPair = null; if (selSlot >= 0) sfx('sel'); refresh();
}
const slotEl = k => document.querySelectorAll('#slots .slot')[k];
function renderSlots() {
  const box = $('slots'); if (!box) return;
  if (box.children.length !== SLOTS) { box.innerHTML = ''; for (let k = 0; k < SLOTS; k++) { const d = document.createElement('button'); d.className = 'slot'; d.dataset.k = k; d.setAttribute('aria-label', 'スロット' + (k + 1)); box.appendChild(d); } }
  S.held.forEach((st, k) => {
    const d = box.children[k], n = st.length, key = n ? st.map(i => S.faces[i]).join(',') + (opts.nums ? '#' : '') : '';
    if (d.dataset.key !== key) {
      d.dataset.key = key;
      d.innerHTML = n ? st.slice(-3).map((i, j, arr) => `<span class="stile" style="--o:${arr.length - 1 - j}">${faceSVG(S.faces[i], opts.nums)}</span>`).join('') + (n > 1 ? `<b class="cnt">×${n}</b>` : '') : '<span class="slot-empty">置く</span>';
    }
    d.classList.toggle('full', n > 0); d.classList.toggle('pair', n >= 2); d.classList.toggle('sel', selSlot === k);
    d.classList.toggle('target', n === 0 && sel >= 0);
    d.classList.toggle('hint', !!hintPair && hintPair.includes('h' + k));
  });
}
document.getElementById('slots').addEventListener('pointerdown', ev => { const t = ev.target.closest('.slot'); if (!t) return; ev.preventDefault(); tapSlot(+t.dataset.k); });
board.addEventListener('click', ev => {
  const t = ev.target.closest('.tile'); if (!t) { if (sel >= 0 || selSlot >= 0) { sel = -1; selSlot = -1; refresh(); } return; }
  ev.preventDefault(); tap(+t.dataset.i);
});
function undo() {
  const h = S.hist.pop(); if (!h) return;
  aid().u++;
  const show = k => { S.alive[k] = true; els[k].classList.remove('hidden', 'gone'); };
  if (h.t === 'p') [h.a, h.b].forEach(show);
  else if (h.t === 'm') { S.held[h.k].pop(); show(h.i); }
  else if (h.t === 'hp') { S.held[h.k].push(h.h); show(h.b); }
  else if (h.t === 'hh') { S.held[h.k].push(h.b, h.a); }
  else { S.faces = h.faces; els.forEach((e, i) => e.innerHTML = faceSVG(S.faces[i], opts.nums)); }
  S.done = false; sel = -1; selSlot = -1; hintPair = null; save(); refresh(); hideOv();
}
// 磁石: removes one available pair automatically (limited uses per game)
function magnet() {
  if (S.done || !S.magnet) return;
  const m = movePairs();
  if (!m.length) { toast('いま磁石で取れる組がありません'); sfx('bad'); return; }
  m.sort((p, q) => (typeof p[0] === 'string') - (typeof q[0] === 'string')); // prefer board pairs (they open the board)
  const best = m.filter(p => typeof p[0] !== 'string'); const pick2 = (best.length ? best : m)[rnd((best.length ? best : m).length)];
  S.magnet--; aid().m++; sel = -1; selSlot = -1; hintPair = null;
  const [x, y] = pick2;
  if (typeof x === 'number') { S.alive[x] = S.alive[y] = false; S.hist.push({ t: 'p', a: x, b: y }); cleared(S.faces[x], S.faces[y], [els[x], els[y]]); [x, y].forEach(vanish); }
  else if (x === y) { const k = +x.slice(1), st = S.held[k], a = st.pop(), b = st.pop(); S.hist.push({ t: 'hh', k, a, b }); cleared(S.faces[a], S.faces[b], [slotEl(k)]); }
  else { const k = +x.slice(1), hh = S.held[k].pop(); S.alive[y] = false; S.hist.push({ t: 'hp', k, h: hh, b: y }); cleared(S.faces[hh], S.faces[y], [els[y], slotEl(k)]); vanish(y); }
  toast(`磁石で1組とりました（のこり ${S.magnet}）`); save(); refresh();
}
function banner() {
  const d = DIFF[LAYOUTS[S.layout].id] || 0, [label, stars, st] = DIFF_INFO[d], el = $('banner');
  el.className = 'd' + d; el.innerHTML = `${stampImg(st)}<div><small>${LAYOUTS[S.layout].name}（${S.tiles.length}枚）</small><b>${label}</b><span>${stars}</span></div>`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(banner.t); banner.t = setTimeout(() => el.classList.remove('show'), 2300);
}
function hint() {
  const m = movePairs();
  if (!m.length) {
    if (canPark()) { const f = freeList(); aid().h++; hintPair = [f[rnd(f.length)], 'h' + emptySlot()]; sel = -1; selSlot = -1; refresh(); toast('取れる組がないので、牌をスロットに置いてみよう', 2600); pal('chui'); return; }
    noMoves(); return;
  }
  aid().h++;
  hintPair = m[rnd(m.length)]; sel = -1; selSlot = -1; refresh(); pal(pick(['chui', 'kakunin']));
  const bt = hintPair.filter(x => typeof x === 'number'); if (bt.length) reveal(els[bt[0]]);
}
function shuffleRemaining(silent) {
  const idxs = S.tiles.map((_, i) => i).filter(i => S.alive[i]);
  if (idxs.length < 2) return;
  const by = {}; idxs.forEach(i => { const g = group(S.faces[i]); (by[g] = by[g] || []).push(S.faces[i]); });
  const pairs = [], singles = []; Object.values(by).forEach(a => { let k = 0; for (; k + 1 < a.length; k += 2) pairs.push([a[k], a[k + 1]]); if (k < a.length) singles.push(a[k]); });
  const prev = S.faces.slice();
  // odd ones out match a tile waiting in a slot, so they only need one free position each
  let faces = singles.length ? solvableAssignSingles(NB, S.tiles.length, idxs, pairs, singles, 800) : solvableAssign(NB, S.tiles.length, idxs, pairs, 600);
  const nf = S.faces.slice();
  if (faces) idxs.forEach(i => nf[i] = faces[i]);
  else { const f = shuffleArr(idxs.map(i => S.faces[i])); idxs.forEach((i, k) => nf[i] = f[k]); }
  S.faces = nf; S.hist.push({ t: 's', faces: prev }); aid().s++;
  sel = -1; selSlot = -1; hintPair = null;
  idxs.forEach(i => { const e = els[i]; e.innerHTML = faceSVG(S.faces[i], opts.nums); e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); });
  save(); hideOv(); refresh();
  if (!silent) { toast(faces ? '残りの牌をまぜました' : 'まぜました'); sfx('shuffle'); pal('shinkochu'); }
}

/* ---------------- sound (synthesized with Web Audio, no files, works offline) ---------------- */
let AC = null;
// iOS Safari: audio may only start inside a user gesture. Create/resume the context and play a silent buffer
// on the first touch (and again after the app returns from background, when iOS suspends/"interrupts" it).
function unlockAudio() {
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state !== 'running') { const pr = AC.resume(); if (pr && pr.catch) pr.catch(() => {}); }
    const b = AC.createBuffer(1, 1, 22050), src = AC.createBufferSource(); src.buffer = b; src.connect(AC.destination); src.start(0);
  } catch (e) {}
}
['touchend', 'pointerdown', 'keydown'].forEach(t => document.addEventListener(t, () => { if (!AC || AC.state !== 'running') unlockAudio(); }, { passive: true, capture: true }));
// iOS ignores user-scalable=no: block page pinch-zoom gestures (the zoomed board pans natively; 🔍 does the zooming)
['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
function sfx(kind) {
  if (opts.sound === false) return;
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state !== 'running') { const pr = AC.resume(); if (pr && pr.catch) pr.catch(() => {}); }
    const t0 = AC.currentTime;
    const tone = (f, at, dur, type = 'triangle', vol = .16) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t0 + at);
      g.gain.setValueAtTime(0, t0 + at); g.gain.linearRampToValueAtTime(vol, t0 + at + .008);
      g.gain.exponentialRampToValueAtTime(.0008, t0 + at + dur);
      o.connect(g).connect(AC.destination); o.start(t0 + at); o.stop(t0 + at + dur + .02);
    };
    if (kind === 'sel') { tone(1180, 0, .07, 'triangle', .12); tone(2360, 0, .04, 'sine', .04); }            // wooden tap
    else if (kind === 'match') { tone(784, 0, .35, 'triangle', .14); tone(1175, .07, .45, 'triangle', .12); tone(2350, .07, .25, 'sine', .03); } // koto-like chime
    else if (kind === 'bad') tone(150, 0, .12, 'square', .05);
    else if (kind === 'shuffle') [0, .05, .1, .15, .2].forEach((a, i) => tone(500 + i * 90, a, .06, 'triangle', .07));
    else if (kind === 'win') [523, 587, 659, 784, 880, 1047].forEach((f, i) => { tone(f, i * .11, .6, 'triangle', .13); tone(f * 2, i * .11, .3, 'sine', .03); });
  } catch (e) {}
}
function spark(e) {
  if (typeof e === 'number') e = els[e]; if (!e) return;
  const r = e.getBoundingClientRect(), d = document.createElement('div'); d.className = 'spark';
  d.style.left = (r.left + r.width / 2) + 'px'; d.style.top = (r.top + r.height / 2) + 'px';
  document.body.appendChild(d); setTimeout(() => d.remove(), 650);
}

/* ---------------- overlays ---------------- */
let toastT = 0;
function toast(m, ms = 1800) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms); }
// First time a season (or flower) pair with different pictures is removed, explain the rule once.
function bonusTip(fa, fb) {
  const k = fa[0]; if ((k !== 'x' && k !== 'f') || fa === fb) return;
  let seen = {}; try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch (e) {}
  if (seen[k]) return;
  seen[k] = 1; try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch (e) {}
  toast(k === 'x' ? '季節牌はどれ同士でも消せます（春夏秋冬）' : '花牌はどれ同士でも消せます（梅蘭菊竹）', 3600);
}
function hideOv() { $('ovMenu').hidden = true; $('ovEnd').hidden = true; $('ovPause').hidden = true; }
function endScreen(title, msg, btns) {
  $('endTitle').textContent = title; $('endMsg').innerHTML = msg;
  const box = $('endBtns'); box.innerHTML = '';
  btns.forEach(([label, fn, cls]) => { const b = document.createElement('button'); b.className = 'big ' + (cls || ''); b.textContent = label; b.onclick = fn; box.appendChild(b); });
  $('ovMenu').hidden = true; $('ovEnd').hidden = false;
}
function nextLevel() { const lv = S.level + 1; newGame((lv - 1) % LAYOUTS.length, lv); }
const RANK_KEY = 'nonbiri-shanghai-rank';
function aid() { if (!S.aid) S.aid = { h: 0, u: 0, s: 0 }; if (S.aid.m == null) S.aid.m = 0; if (S.aid.k == null) S.aid.k = 0; return S.aid; }
/* 今日の上海IQ — a playful score for fun only (not a real IQ). Formula:
 *   n    = tiles on the layout, par = 2.5 s per tile (かめ 144 tiles → 6:00)
 *   speed = clamp(par / clearTime, 0.25, 4)
 *   raw  = 100 + 30·log2(speed)            (on par → 100, twice as fast → 130)
 *        + 10·log2(n / 32)                 (bigger boards earn more: かめ +21.7)
 *        − (3·hints + 1·undos + 6·shuffles + 5·magnets + 0.5·slotMoves) · √(144 / n)
 *                                          (aids cost more on small boards; 磁石 = a hint that also plays the move;
 *                                           parking a tile in a slot costs only a little)
 *   IQ   = round(clamp(raw, 80, 160))
 */
function shanghaiIQ(n, time, a) {
  const par = n * 2.5, speed = Math.min(4, Math.max(.25, par / Math.max(time, 1)));
  const raw = 100 + 30 * Math.log2(speed) + 10 * Math.log2(n / 32) - (3 * a.h + a.u + 6 * a.s + 5 * (a.m || 0) + .5 * (a.k || 0)) * Math.sqrt(144 / n);
  return Math.round(Math.min(160, Math.max(80, raw)));
}
function loadRank() { try { return JSON.parse(localStorage.getItem(RANK_KEY) || '{}') || {}; } catch (e) { return {}; } }
function today() { const d = new Date(); return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`; }
function rankTable(list, curTs) {
  if (!list || !list.length) return '<p class="rk-empty">まだ記録がありません</p>';
  return '<table class="rank"><tr><th>順位</th><th>IQ</th><th>時間</th><th>日付</th></tr>' + list.map((r, i) =>
    `<tr${r.ts === curTs ? ' class="me"' : ''}><td>${i + 1}</td><td><b>${r.iq}</b></td><td>${fmt(r.t)}</td><td>${r.d.slice(5)}</td></tr>`).join('') + '</table>';
}
function win() {
  S.done = true; save();
  let best = {}; try { best = JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); } catch (e) {}
  const L = LAYOUTS[S.layout], id = L.id, isBest = !best[id] || S.time < best[id];
  if (isBest) { best[id] = S.time; try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch (e) {} }
  const a = aid(), iq = shanghaiIQ(S.tiles.length, S.time, a), ts = Date.now();
  const rank = loadRank(); const list = rank[id] || [];
  list.push({ iq, t: S.time, d: today(), ts, h: a.h, u: a.u, s: a.s, m: a.m, k: a.k });
  list.sort((x, y) => y.iq - x.iq || x.t - y.t || x.ts - y.ts);
  rank[id] = list.slice(0, 10); try { localStorage.setItem(RANK_KEY, JSON.stringify(rank)); } catch (e) {}
  const pos = rank[id].findIndex(r => r.ts === ts);
  confetti(); sfx('win');
  const G0 = S; // ignore if a new game started before the dialog appears
  setTimeout(() => S === G0 && S.done && endScreen('クリア！',
    `<div class="mascot cheer">${stampImg('kanryo')}<i class="tw t1">✦</i><i class="tw t2">✦</i><i class="tw t3">✦</i></div><span class="iq-say">ナイス開通！</span><span class="iq-label">今日の上海IQ</span><span class="iq">${iq}</span>` +
    `<span class="iq-sub">時間 <b>${fmt(S.time)}</b>${isBest ? '（自己ベスト！）' : `（ベスト ${fmt(best[id])}）`}<br>ヒント ${a.h}・もどす ${a.u}・まぜる ${a.s}・磁石 ${a.m}・スロット ${a.k}</span>` +
    `<span class="iq-rank">${pos >= 0 ? `「${L.name}」で <b>${pos + 1}位</b>` : 'ランキング圏外'}</span>` +
    rankTable(rank[id], ts) +
    `<span class="iq-note">※遊び用のお楽しみ数値です（本当のIQとは関係ありません）。記録はこの端末の中だけに保存されます。</span>`,
    [['次のレベルへ', nextLevel], ['同じ盤面をもう一度', () => newGame(S.layout, S.level), 'ghost']]), 500);
  // a second stamp pops in the corner: new record → 到着しました, otherwise a random thank-you
  setTimeout(() => S === G0 && pal(pos === 0 && rank[id].length > 1 || isBest && rank[id].length > 1 ? 'tochaku' : pick(['shochi', 'ryokai', 'arigato']), 2200, true), 1500);
}
function showRanking() {
  const L = LAYOUTS[S.layout], rank = loadRank();
  const others = LAYOUTS.filter(x => x !== L && (rank[x.id] || []).length)
    .map(x => `<span class="iq-sub">${x.name}：最高 IQ <b>${rank[x.id][0].iq}</b>（${fmt(rank[x.id][0].t)}）</span>`).join('');
  endScreen('自分ランキング', `<div class="mascot small">${stampImg('hokoku')}</div><span class="iq-rank">「${L.name}」のトップ10</span>` + rankTable(rank[L.id], -1) + others +
    '<span class="iq-note">※上海IQは遊び用の数値です。この端末の中だけに保存されます。</span>', [['閉じる', hideOv, 'ghost']]);
}
function noMoves() {
  if (S.done || movePairs().length || canPark() || (!S.alive.some(Boolean) && !heldCount()) || !$('ovEnd').hidden) return;
  endScreen('取れる組がありません', `<div class="mascot small">${stampImg('otsukare')}</div>${emptySlot() < 0 ? 'スロットもいっぱいです。' : ''}まぜると続けられます。`, [
    ['残りをまぜる', () => shuffleRemaining()], ['ひとつもどす', undo, 'ghost'], ['新しいゲーム', () => newGame(S.layout, S.level), 'ghost']]);
}
function confetti() {
  const cs = ['#ffd43b', '#ff6b6b', '#4dabf7', '#69db7c', '#fff'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = cs[i % cs.length];
    c.style.animationDuration = (2 + Math.random() * 2) + 's'; c.style.animationDelay = Math.random() * .8 + 's';
    $('app').appendChild(c); setTimeout(() => c.remove(), 5000);
  }
}
function openMenu() {
  const list = $('layoutList'); list.innerHTML = '';
  LAYOUTS.forEach((L, i) => {
    const b = document.createElement('button'); if (i === S.layout) b.className = 'cur';
    b.innerHTML = `${L.name}<small>${L.build().length}枚</small>`;
    b.onclick = () => newGame(i, S.level); list.appendChild(b);
  });
  $('optZoom').checked = opts.autoZoom !== false; $('optDim').checked = !!opts.dim; $('optNum').checked = !!opts.nums; $('optStrict').checked = !!opts.strict; $('optSound').checked = opts.sound !== false;
  $('ovMenu').hidden = false; pal('kyukei');
}
/* ---------------- pause ---------------- */
const overlayOpen = () => !$('ovMenu').hidden || !$('ovEnd').hidden || !$('ovTitle').hidden || !$('ovPause').hidden;
function pause() {
  if (!S || S.done || overlayOpen()) return false;
  sel = -1; selSlot = -1; hintPair = null; refresh();
  $('pauseStamp').innerHTML = stampImg('kyukei');
  $('pauseInfo').innerHTML = `${LAYOUTS[S.layout].name}・のこり ${S.alive.filter(Boolean).length + heldCount()}枚<br>時間 <b>${fmt(S.time)}</b> で止まっています`;
  $('ovPause').hidden = false; document.body.classList.add('paused'); save();
  return true;
}
function resume() { if ($('ovPause').hidden) return; $('ovPause').hidden = true; document.body.classList.remove('paused'); pal('modorimashita', 1500, true); }
$('bPause').onclick = () => { if (pause()) sfx('sel'); };
$('pResume').onclick = resume;
$('pRestart').onclick = () => { document.body.classList.remove('paused'); restartSame(); };
$('pTitle').onclick = () => { document.body.classList.remove('paused'); save(); showTitle(true); };
$('bZoom').onclick = toggleZoom;
$('bMagnet').onclick = magnet; $('bHint').onclick = hint; $('bUndo').onclick = undo; $('bShuffle').onclick = () => shuffleRemaining(); $('bMenu').onclick = openMenu;
function showTitle(bye) {
  const h = new Date().getHours();
  $('mascotTitle').innerHTML = stampImg(h >= 4 && h < 11 ? 'ohayo' : 'yoroshiku');
  hideOv(); document.body.classList.remove('paused'); $('ovTitle').hidden = false; if (bye) pal('osakini', 1800, true);
}
showTitle(false);
$('tStart').onclick = () => { $('ovTitle').hidden = true; if (S && S.hist.length && !S.done) pal('modorimashita', 1700, true); else if (S) banner(); };
$('mTitle').onclick = () => { save(); showTitle(true); };
$('mClose').onclick = () => { hideOv(); pal('modorimashita'); }; $('mRank').onclick = showRanking; $('mRestart').onclick = restartSame; $('mNew').onclick = () => newGame(S.layout, S.level);
$('optDim').onchange = e => { opts.dim = e.target.checked; saveOpts(); board.classList.toggle('dim', opts.dim); };
$('optZoom').onchange = e => { opts.autoZoom = e.target.checked; saveOpts(); if (S) setZoom(e.target.checked ? autoZoom() : 0); };
$('optSound').onchange = e => { opts.sound = e.target.checked; saveOpts(); sfx('sel'); };
$('optStrict').onchange = e => {
  opts.strict = e.target.checked; saveOpts();
  if (!!S.strict === opts.strict) return;
  if (!S.hist.length && !S.done) { newGame(S.layout, S.level); toast(opts.strict ? '同じ絵どうしだけで新しく配りました' : 'どれ同士でも消せるルールで新しく配りました', 2600); pal('taio', 1700, true); }
  else { toast('次の新しいゲームから反映されます', 2600); pal('taio', 1700, true); }
};
$('optNum').onchange = e => { opts.nums = e.target.checked; saveOpts(); els.forEach((el, i) => el.innerHTML = faceSVG(S.faces[i], opts.nums)); renderSlots(); };

/* ---------------- timer / resize ---------------- */
setInterval(() => {
  if (!S || S.done || document.hidden || overlayOpen()) return;
  S.time++; $('time').textContent = fmt(S.time);
  if (S.time % 5 === 0) save();
}, 1000);
let rT = 0;
window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(layout, 80); });
// slots row height can change with orientation; keep board fitted
if (window.ResizeObserver) new ResizeObserver(() => { clearTimeout(rT); rT = setTimeout(layout, 60); }).observe(board);
// auto-pause when the app goes to the background
document.addEventListener('visibilitychange', () => { if (document.hidden && S) { pause(); save(); } });

/* ---------------- start ---------------- */
loadOpts();
let saved = null;
try { saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
requestAnimationFrame(() => {
  if (saved && saved.v === 1 && Array.isArray(saved.tiles) && saved.tiles.length) {
    S = saved; ensureState(); NB = neighbors(S.tiles); build();
    if (S.done) nextLevel();
  } else newGame(0, 1);
});

// test hook (used by automated tests; harmless for players)
window.__shanghai = { get audioState() { return AC ? AC.state : "none"; }, pause, resume, setZoom, toggleZoom, get tileW() { return layout.W; }, get fitW() { return layout.fit; }, tapSlot, park, magnet, banner, get selSlot() { return selSlot; }, get sel() { return sel; }, SLOTS, pal, showTitle, shanghaiIQ, loadRank, showRanking, get S() { return S; }, get lastOrder() { return lastOrder; }, opts, group, faceSVG, save, LAYOUTS, movePairs, tap, newGame, shuffleRemaining, undo, isFreeAt: i => isFree(NB, S.alive, i) };
})();
