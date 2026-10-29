// Procedural artwork for each disc. Everything is drawn on <canvas>,
// so the site ships no image files besides the CV.

const SERIF = '"Playfair Display", Georgia, serif';
const MONO = '"Geist Mono", ui-monospace, monospace';
const SANS = '"Geist Variable", system-ui, sans-serif';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
}

function grain(ctx, w, h, amount = 10, seed = 7) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const r = rng(seed);
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

/* ---------- artworks (draw a full rectangle) ---------- */

function aboutArt(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#1b2027');
  g.addColorStop(1, '#3a4756');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.72, h * 0.3, 0, w * 0.72, h * 0.3, Math.max(w, h) * 0.6);
  glow.addColorStop(0, 'rgba(214,170,128,0.42)');
  glow.addColorStop(1, 'rgba(214,170,128,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Fingerprint-like contour field: identity, drawn as distorted loops
  const r = rng(11);
  const cx = w * 0.62;
  const cy = h * 0.62;
  const s = Math.min(w, h);
  const phase = [r() * 6, r() * 6, r() * 6];
  ctx.lineWidth = s * 0.0016;
  for (let k = 1; k < 46; k++) {
    const base = k * s * 0.016;
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.02) {
      const wob =
        Math.sin(a * 3 + phase[0] + k * 0.07) * s * 0.012 +
        Math.sin(a * 5 + phase[1] - k * 0.05) * s * 0.006 +
        Math.sin(a * 2 + phase[2]) * k * s * 0.0012;
      const rr = base + wob;
      const x = cx + Math.cos(a) * rr * 1.18;
      const y = cy + Math.sin(a) * rr * 0.9;
      a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(236,232,224,${0.05 + 0.1 * Math.max(0, 1 - k / 46)})`;
    ctx.stroke();
  }
}

function projectsArt(ctx, w, h) {
  const g = ctx.createLinearGradient(0, h, w, 0);
  g.addColorStop(0, '#4d4b22');
  g.addColorStop(1, '#8b8641');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const s = Math.min(w, h);

  // faint axes grid
  ctx.strokeStyle = 'rgba(240,234,200,0.08)';
  ctx.lineWidth = s * 0.0012;
  for (let i = 1; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo((w / 12) * i, 0);
    ctx.lineTo((w / 12) * i, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, (h / 12) * i);
    ctx.lineTo(w, (h / 12) * i);
    ctx.stroke();
  }

  // four clusters, a nod to the K-Means patient segments
  const r = rng(23);
  const clusters = [
    { x: 0.3, y: 0.62, sx: 0.07, sy: 0.05, c: '#efe8c8', n: 260 },
    { x: 0.66, y: 0.36, sx: 0.06, sy: 0.08, c: '#e4643c', n: 220 },
    { x: 0.7, y: 0.72, sx: 0.08, sy: 0.04, c: '#a9d5c9', n: 200 },
    { x: 0.42, y: 0.3, sx: 0.05, sy: 0.05, c: '#26250f', n: 170 },
  ];
  for (const cl of clusters) {
    ctx.setLineDash([s * 0.006, s * 0.006]);
    ctx.strokeStyle = 'rgba(240,234,200,0.35)';
    ctx.lineWidth = s * 0.0016;
    ctx.beginPath();
    ctx.ellipse(cl.x * w, cl.y * h, cl.sx * s * 2.6, cl.sy * s * 2.6, 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = cl.c;
    for (let i = 0; i < cl.n; i++) {
      const x = cl.x * w + gauss(r) * cl.sx * s;
      const y = cl.y * h + gauss(r) * cl.sy * s;
      const rad = s * (0.0022 + r() * 0.0035);
      ctx.globalAlpha = 0.55 + r() * 0.45;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // centroid cross
    ctx.strokeStyle = cl.c;
    ctx.lineWidth = s * 0.003;
    const cs = s * 0.012;
    ctx.beginPath();
    ctx.moveTo(cl.x * w - cs, cl.y * h);
    ctx.lineTo(cl.x * w + cs, cl.y * h);
    ctx.moveTo(cl.x * w, cl.y * h - cs);
    ctx.lineTo(cl.x * w, cl.y * h + cs);
    ctx.stroke();
  }
}

function experienceArt(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0d1626');
  g.addColorStop(1, '#1f3257');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const s = Math.min(w, h);
  const r = rng(5);

  // stars
  for (let i = 0; i < 420; i++) {
    ctx.fillStyle = `rgba(230,236,255,${0.2 + r() * 0.6})`;
    const rad = s * (0.0008 + r() * 0.0018);
    ctx.beginPath();
    ctx.arc(r() * w, r() * h, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // globe with graticule
  const gx = w * 0.4;
  const gy = h * 0.66;
  const gr = s * 0.3;
  const body = ctx.createRadialGradient(gx - gr * 0.3, gy - gr * 0.4, gr * 0.1, gx, gy, gr);
  body.addColorStop(0, '#36507f');
  body.addColorStop(1, '#101b30');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(gx, gy, gr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,210,255,0.22)';
  ctx.lineWidth = s * 0.0014;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(gx, gy, Math.abs(gr * (i / 3.5)), gr, 0, 0, Math.PI * 2);
    ctx.stroke();
    const y = gy + (gr * i) / 3.5;
    const half = Math.sqrt(Math.max(0, gr * gr - (y - gy) * (y - gy)));
    ctx.beginPath();
    ctx.moveTo(gx - half, y);
    ctx.lineTo(gx + half, y);
    ctx.stroke();
  }

  // orbits
  const orbits = [
    [1.5, 0.42, -0.35],
    [1.85, 0.5, 0.25],
    [2.25, 0.36, -0.08],
  ];
  for (const [a, b, rot] of orbits) {
    ctx.strokeStyle = 'rgba(220,230,255,0.3)';
    ctx.lineWidth = s * 0.0016;
    ctx.beginPath();
    ctx.ellipse(gx, gy, gr * a, gr * a * b, rot, 0, Math.PI * 2);
    ctx.stroke();
  }
  // highlighted orbit arc and satellite
  const [a, b, rot] = orbits[1];
  ctx.strokeStyle = '#ff7a3d';
  ctx.lineWidth = s * 0.004;
  ctx.beginPath();
  ctx.ellipse(gx, gy, gr * a, gr * a * b, rot, Math.PI * 1.15, Math.PI * 1.75);
  ctx.stroke();
  const t = Math.PI * 1.75;
  const ex = Math.cos(t) * gr * a;
  const ey = Math.sin(t) * gr * a * b;
  const sx = gx + ex * Math.cos(rot) - ey * Math.sin(rot);
  const sy = gy + ex * Math.sin(rot) + ey * Math.cos(rot);
  ctx.fillStyle = '#ff7a3d';
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.011, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,122,61,0.4)';
  ctx.lineWidth = s * 0.002;
  ctx.beginPath();
  ctx.arc(sx, sy, s * 0.024, 0, Math.PI * 2);
  ctx.stroke();
}

function researchArt(ctx, w, h) {
  // two-source interference fringes, a nod to fibre-optic sensing
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const s = Math.min(w, h);
  const s1 = [w * 0.28, h * 0.32];
  const s2 = [w * 0.74, h * 0.24];
  const k = 70 / s;
  const base = [220, 214, 222];
  const ink = [122, 54, 92];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const r1 = Math.hypot(x - s1[0], y - s1[1]);
      const r2 = Math.hypot(x - s2[0], y - s2[1]);
      const v = Math.cos(r1 * k * Math.PI) + Math.cos(r2 * k * Math.PI);
      const t = Math.pow((v + 2) / 4, 3) * 0.55 * (1 - y / h * 0.5);
      const i = (y * w + x) * 4;
      d[i] = base[0] + (ink[0] - base[0]) * t;
      d[i + 1] = base[1] + (ink[1] - base[1]) * t;
      d[i + 2] = base[2] + (ink[2] - base[2]) * t;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // a spectrum with one sharp resonance
  ctx.strokeStyle = '#1e1b22';
  ctx.lineWidth = s * 0.0035;
  ctx.beginPath();
  const y0 = h * 0.8;
  for (let x = 0; x <= w; x += 2) {
    const u = x / w;
    const peak = 0.22 / (1 + Math.pow((u - 0.58) / 0.018, 2));
    const ripple = Math.sin(u * 60) * 0.006;
    const y = y0 - (peak + ripple + 0.03) * h;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(30,27,34,0.35)';
  ctx.lineWidth = s * 0.0012;
  ctx.beginPath();
  ctx.moveTo(0, y0);
  ctx.lineTo(w, y0);
  ctx.stroke();
}

const ARTS = {
  about: { draw: aboutArt, light: true },
  projects: { draw: projectsArt, light: true },
  experience: { draw: experienceArt, light: true },
  research: { draw: researchArt, light: false },
};

/* ---------- blank CD-R face with a handwritten label ---------- */

const HAND = '"Shadows Into Light", "Comic Sans MS", cursive';

function arcText(ctx, text, cx, cy, radius, startAngle, endAngle, color, size, font = MONO) {
  ctx.save();
  ctx.font = `500 ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const chars = [...text];
  const span = startAngle - endAngle;
  chars.forEach((ch, i) => {
    const a = startAngle - (span * (i + 0.5)) / chars.length;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
    ctx.rotate(a - Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

// Printed text in the light grey-on-silver style of a blank disc
function printed(ctx, text, x, y, size, { weight = 600, align = 'left', fill = '#f7f8f9', stroke = 'rgba(92,96,104,0.75)', font = SANS } = {}) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  if (stroke) {
    ctx.lineWidth = Math.max(1, size * 0.06);
    ctx.strokeStyle = stroke;
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function blankFace(ctx, S, monogram) {
  const R = S / 2;

  // matte silver base
  const base = ctx.createRadialGradient(R * 0.85, R * 0.75, R * 0.1, R, R, R);
  base.addColorStop(0, '#cfd2d6');
  base.addColorStop(0.7, '#c3c7cc');
  base.addColorStop(1, '#b3b8be');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);

  // faint rainbow sheen from the dye layer showing through
  if (ctx.createConicGradient) {
    const sheen = ctx.createConicGradient(-0.6, R, R);
    const hues = ['#f6c7a4', '#f3e3a0', '#bfe6c4', '#a9d2ef', '#d6b9ef', '#f2b6c9', '#f6c7a4'];
    hues.forEach((c, i) => sheen.addColorStop(i / (hues.length - 1), c));
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, S, S);
    ctx.globalAlpha = 1;
  }
  const band = ctx.createLinearGradient(0, 0, S, S);
  band.addColorStop(0.3, 'rgba(255,255,255,0)');
  band.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  band.addColorStop(0.6, 'rgba(255,255,255,0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, S, S);

  // own monogram where a maker's logo would be, in a soft holographic print
  ctx.save();
  ctx.font = `700 ${S * 0.085}px ${SANS}`;
  ctx.textAlign = 'center';
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${S * 0.012}px`;
  const holo = ctx.createLinearGradient(R - S * 0.12, 0, R + S * 0.12, 0);
  holo.addColorStop(0, 'rgba(214,128,86,0.8)');
  holo.addColorStop(0.5, 'rgba(190,112,160,0.75)');
  holo.addColorStop(1, 'rgba(100,168,132,0.8)');
  ctx.fillStyle = holo;
  ctx.fillText(monogram, R, S * 0.225);
  ctx.restore();

  // left and right print, like a stock CD-R
  printed(ctx, 'CD-R', S * 0.075, S * 0.505, S * 0.06, { weight: 700 });
  printed(ctx, '700MB/80Min', S * 0.078, S * 0.54, S * 0.019, { weight: 500, stroke: null, fill: 'rgba(255,255,255,0.95)' });
  printed(ctx, '1X - 52X', S * 0.905, S * 0.455, S * 0.034, { align: 'right', weight: 500 });
  ctx.save();
  ctx.font = `500 ${S * 0.019}px ${SANS}`;
  const tag = 'CD-Recordable';
  const tw = ctx.measureText(tag).width;
  const tx = S * 0.905 - tw - S * 0.012;
  const ty = S * 0.472;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.strokeStyle = 'rgba(120,124,132,0.5)';
  ctx.lineWidth = Math.max(1, S * 0.0012);
  ctx.fillRect(tx, ty, tw + S * 0.024, S * 0.03);
  ctx.strokeRect(tx, ty, tw + S * 0.024, S * 0.03);
  ctx.fillStyle = 'rgba(110,114,122,0.95)';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, tx + S * 0.012, ty + S * 0.016);
  ctx.restore();

  // "Contents" writing lines below the hub
  printed(ctx, 'Contents', S * 0.12, S * 0.668, S * 0.022, { weight: 400, stroke: null, fill: 'rgba(255,255,255,0.95)' });
  ctx.strokeStyle = 'rgba(110,114,122,0.6)';
  ctx.lineWidth = Math.max(1, S * 0.0015);
  [0.715, 0.775, 0.835].forEach((t, k) => {
    const y = S * t;
    const half = Math.sqrt(Math.max(0, (R * 0.93) ** 2 - (y - R) ** 2));
    const x0 = R - half + S * (k === 0 ? 0.13 : 0.03);
    const x1 = R + half - S * 0.03;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
  });

  arcText(
    ctx,
    'Do not expose to direct sunlight. Write with a soft-tip pen only.',
    R,
    R,
    R * 0.92,
    Math.PI * 0.86,
    Math.PI * 0.14,
    'rgba(88,92,100,0.9)',
    S * 0.018,
    SANS
  );
}

// Felt-tip handwriting: each letter gets its own small wobble so it never looks typeset
function handwrite(ctx, text, cx, baseline, maxWidth, S, seed) {
  const r = rng(seed);
  let size = S * 0.068;
  ctx.font = `400 ${size}px ${HAND}`;
  const measure = () => ctx.measureText(text).width * 1.04;
  while (measure() > maxWidth && size > S * 0.03) {
    size *= 0.95;
    ctx.font = `400 ${size}px ${HAND}`;
  }
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width * 1.04);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  ctx.save();
  ctx.translate(cx, baseline);
  ctx.rotate(-0.012 + (r() - 0.5) * 0.02);
  ctx.translate(-cx, -baseline);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  chars.forEach((ch, i) => {
    const jitterY = (r() - 0.5) * size * 0.08 - i * size * 0.004;
    const rot = (r() - 0.5) * 0.1;
    const scale = 0.96 + r() * 0.08;
    ctx.save();
    ctx.translate(x, baseline - size * 0.1 + jitterY);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    // a soft bleed under the stroke, then the ink itself
    // felt tip: a stroked pass gives the line some body, then the ink fill
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = size * 0.045;
    ctx.strokeStyle = 'rgba(28,48,160,0.55)';
    ctx.strokeText(ch, 0, 0);
    ctx.fillStyle = 'rgba(22,42,150,0.96)';
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    x += widths[i];
  });
  ctx.restore();
}

function coverImage(ctx, img, S) {
  const k = Math.max(S / img.naturalWidth, S / img.naturalHeight);
  const w = img.naturalWidth * k;
  const h = img.naturalHeight * k;
  ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
}

export function drawDisc(disc, size, monogram, image) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const R = size / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(R, R, R * 0.985, 0, Math.PI * 2);
  ctx.clip();
  if (image) {
    coverImage(ctx, image, size);
  } else {
    blankFace(ctx, size, monogram);
    grain(ctx, size, size, 6, 3);
    handwrite(ctx, disc.scribble, R + size * 0.035, size * 0.708, size * 0.6, size, disc.id.length * 17 + 5);
  }
  ctx.restore();

  // centre hole and clear hub
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(R, R, R * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(R, R, R, 0, Math.PI * 2);
  ctx.arc(R, R, R * 0.985, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  const ring = (r0, r1, fill) => {
    ctx.beginPath();
    ctx.arc(R, R, R * r1, 0, Math.PI * 2);
    ctx.arc(R, R, R * r0, 0, Math.PI * 2, true);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  ring(0.125, 0.3, 'rgba(188,192,198,0.7)');
  ring(0.205, 0.228, 'rgba(232,234,237,0.85)');
  ring(0.125, 0.142, 'rgba(240,242,244,0.9)');
  ring(0.292, 0.3, 'rgba(150,155,163,0.7)');
  ring(0.985, 1.0, 'rgba(222,226,232,0.6)');
  arcText(ctx, 'RECORDABLE     700MB     80MIN', R, R, R * 0.258, Math.PI * 1.25, Math.PI * 0.35, 'rgba(120,124,132,0.6)', size * 0.0105);
  return c;
}

// Rotational blur of a disc label, cross-faded in by the scene while the disc spins fast
export function drawSpinBlur(source, size = 512, spread = 0.7, samples = 28) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const R = size / 2;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 1 / samples;
  for (let k = 0; k < samples; k++) {
    const a = (k / (samples - 1) - 0.5) * spread;
    ctx.save();
    ctx.translate(R, R);
    ctx.rotate(a);
    ctx.drawImage(source, -R, -R, size, size);
    ctx.restore();
  }
  return c;
}

export function drawBackAlpha(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const R = size / 2;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  const disk = (r, col) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(R, R, R * r, 0, Math.PI * 2);
    ctx.fill();
  };
  disk(1, '#888');
  disk(0.985, '#fff');
  disk(0.3, '#777');
  disk(0.125, '#000');
  return c;
}

/* ---------- cover art for the media player ---------- */

const PIXEL = '"Press Start 2P", "VT323", monospace';

// Pixel badge with a track number, like a sticker on a jewel case
function pixelBadge(ctx, text, S) {
  const size = Math.round(S * 0.085);
  ctx.font = `400 ${size}px ${PIXEL}`;
  const pad = Math.round(size * 0.55);
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = size + pad * 2;
  const x = Math.round(S * 0.06);
  const y = Math.round(S - h - S * 0.06);
  ctx.fillStyle = 'rgba(14,16,20,0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#f4f1e8';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(text, x + pad, y + pad + Math.round(size * 0.08));
}

/**
 * Square cover for one track (k >= 0) or for the whole disc (k = -1).
 * Each track uses its disc's artwork with a hue shift, so covers in one list
 * belong together but stay distinct.
 */
export function drawCover(disc, k = -1, size = 192) {
  const S = size;
  const art = document.createElement('canvas');
  art.width = art.height = S;
  ARTS[disc.art].draw(art.getContext('2d'), S, S);

  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  if (k >= 0 && 'filter' in ctx) ctx.filter = `hue-rotate(${k * 47}deg) saturate(1.1)`;
  ctx.drawImage(art, 0, 0);
  ctx.filter = 'none';
  grain(ctx, S, S, 10, 41 + k);

  if (k >= 0) {
    pixelBadge(ctx, String(k + 1).padStart(2, '0'), S);
  } else {
    // disc cover: the title in 8-bit type across the top
    const t = disc.title.toUpperCase();
    let fs = S * 0.1;
    ctx.font = `400 ${fs}px ${PIXEL}`;
    while (ctx.measureText(t).width > S * 0.84 && fs > S * 0.05) {
      fs *= 0.92;
      ctx.font = `400 ${fs}px ${PIXEL}`;
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = ARTS[disc.art].light ? 'rgba(244,241,232,0.95)' : 'rgba(26,22,30,0.92)';
    ctx.fillText(t, S * 0.08, S * 0.09);
  }
  return c.toDataURL('image/png');
}

// Artist portrait placeholder used until a real photo is set
export function drawArtistArt(monogram, size = 320) {
  const S = size;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  ARTS.about.draw(ctx, S, S);
  grain(ctx, S, S, 10, 5);
  let fs = S * 0.2;
  ctx.font = `400 ${fs}px ${PIXEL}`;
  while (ctx.measureText(monogram).width > S * 0.8) {
    fs *= 0.92;
    ctx.font = `400 ${fs}px ${PIXEL}`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(14,16,20,0.35)';
  ctx.fillText(monogram, S / 2 + S * 0.012, S / 2 + S * 0.012);
  ctx.fillStyle = 'rgba(244,241,232,0.96)';
  ctx.fillText(monogram, S / 2, S / 2);
  return c.toDataURL('image/png');
}
