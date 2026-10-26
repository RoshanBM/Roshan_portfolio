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

/* ---------- disc label ---------- */

function arcText(ctx, text, cx, cy, radius, startAngle, endAngle, color, size) {
  ctx.save();
  ctx.font = `500 ${size}px ${MONO}`;
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

export function drawDisc(disc, size, monogram) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const R = size / 2;
  const art = ARTS[disc.art];

  ctx.save();
  ctx.beginPath();
  ctx.arc(R, R, R * 0.985, 0, Math.PI * 2);
  ctx.clip();
  art.draw(ctx, size, size);
  grain(ctx, size, size, 14, disc.art.length * 31);

  const fg = art.light ? 'rgba(240,236,228,0.95)' : 'rgba(28,24,30,0.92)';
  const fgSoft = art.light ? 'rgba(240,236,228,0.7)' : 'rgba(28,24,30,0.65)';

  // title like a printed CD label
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 ${size * 0.105}px ${SERIF}`;
  ctx.fillText(disc.title, R, size * 0.3);
  ctx.font = `600 ${size * 0.03}px ${SANS}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.006}px`;
  ctx.fillText(monogram, R, size * 0.355);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

  arcText(ctx, disc.rim, R, R, R * 0.915, Math.PI * 0.93, Math.PI * 0.07, fgSoft, size * 0.0165);
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
  ring(0.125, 0.3, 'rgba(214,219,226,0.5)');
  ring(0.205, 0.228, 'rgba(250,251,253,0.75)');
  ring(0.125, 0.142, 'rgba(250,251,253,0.85)');
  ring(0.292, 0.3, 'rgba(160,166,175,0.6)');
  ring(0.985, 1.0, 'rgba(222,226,232,0.55)');
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

export function drawPoster(disc, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ARTS[disc.art].draw(ctx, w, h);
  grain(ctx, w, h, 12, 99);
  return c.toDataURL('image/jpeg', 0.84);
}

export function isLightArt(disc) {
  return ARTS[disc.art].light;
}
