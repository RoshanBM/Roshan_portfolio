import '@fontsource/playfair-display/400.css';
import '@fontsource-variable/geist';
import '@fontsource/geist-mono/500.css';
import '@fontsource/shadows-into-light/400.css';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/vt323/400.css';
import '@fontsource-variable/pixelify-sans';
import './styles.css';
import './player.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { Observer } from 'gsap/Observer';

import iconDownload from '@phosphor-icons/core/assets/regular/download-simple.svg?raw';
import iconCaretLeft from '@phosphor-icons/core/assets/regular/caret-left.svg?raw';
import iconCaretRight from '@phosphor-icons/core/assets/regular/caret-right.svg?raw';

import { person, discs } from './content.js';
import { drawDisc, drawSpinBlur, drawBackAlpha } from './discArt.js';
import { createStage, webglAvailable } from './scene.js';
import { createPlayer } from './player.js';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, Observer);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = (t) => (reduce ? 0 : t);
const ICONS = { download: iconDownload, caretLeft: iconCaretLeft, caretRight: iconCaretRight };
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));

function fillIcons(root = document) {
  $$('[data-icon]', root).forEach((el) => {
    if (!el.innerHTML) el.innerHTML = ICONS[el.dataset.icon] || '';
  });
}

/* ---------- static DOM ---------- */

const html = document.documentElement;
const track = $('.track');
const info = $('.info');
const titleInner = $('.info__title-inner');
const rowsEl = $('.info__rows');
const highlightsEl = $('.highlights');
const dockList = $('.dock__list');
const hit = $('.disc-hit');
const dock = $('.dock');
const arrowPrev = $('.arrow--prev');
const arrowNext = $('.arrow--next');

$('[data-cv]').href = person.cv;
$('[data-email]').href = `mailto:${person.email}`;
fillIcons();

track.innerHTML = discs.map((d, i) => `<section data-index="${i}"></section>`).join('');

dockList.innerHTML = discs
  .map((d, i) => `<li><button class="dock__btn" type="button" data-index="${i}">${esc(d.label)}</button></li>`)
  .join('');
const dockBtns = $$('.dock__btn');

rowsEl.innerHTML = discs[0].credits.map(() => '<div class="info__row"><dt></dt><dd></dd></div>').join('');
const rows = $$('.info__row').map((r) => ({ dt: $('dt', r), dd: $('dd', r) }));

highlightsEl.innerHTML = [0, 1]
  .map(() => '<div class="hl"><span class="hl__src"></span><span class="hl__text"><span></span></span></div>')
  .join('');
const hls = $$('.hl').map((h) => ({ src: $('.hl__src', h), text: $('.hl__text > span', h) }));

/* ---------- top-left credits ---------- */

const charsHTML = (text) =>
  [...text].map((c) => `<span class="ch">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');

let infoTl;
function setInfo(i, animate = true) {
  const d = discs[i];
  infoTl?.kill();
  gsap.killTweensOf([...$$('.ch', titleInner), ...rows.flatMap((r) => [r.dt, r.dd]), ...hls.flatMap((h) => [h.src, h.text])]);

  if (!animate || reduce) {
    titleInner.innerHTML = charsHTML(d.title);
    rows.forEach((r, k) => {
      r.dt.textContent = d.credits[k][0];
      r.dd.textContent = d.credits[k][1];
      gsap.set([r.dt, r.dd], { clearProps: 'opacity,visibility' });
    });
    hls.forEach((h, k) => {
      h.src.textContent = d.highlights[k][0];
      h.text.textContent = d.highlights[k][1];
      gsap.set([h.src, h.text], { clearProps: 'all' });
    });
    return;
  }

  infoTl = gsap.timeline();
  const oldChars = $$('.ch', titleInner);
  if (oldChars.length) {
    infoTl.to(oldChars, { yPercent: -110, duration: 0.26, ease: 'power2.in', stagger: 0.01 });
  }
  infoTl.add(() => {
    titleInner.innerHTML = charsHTML(d.title);
    gsap.fromTo(
      $$('.ch', titleInner),
      { yPercent: 110 },
      { yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.022 }
    );
  });

  rows.forEach((r, k) => {
    const at = k * 0.05;
    infoTl.to(r.dt, { autoAlpha: 0, duration: 0.14 }, at);
    infoTl.add(() => (r.dt.textContent = d.credits[k][0]), at + 0.14);
    infoTl.to(r.dt, { autoAlpha: 1, duration: 0.3 }, at + 0.14);
    infoTl.to(
      r.dd,
      { duration: 0.8, scrambleText: { text: d.credits[k][1], chars: 'lowerCase', speed: 0.6, revealDelay: 0.2 } },
      at + 0.04
    );
  });

  hls.forEach((h, k) => {
    const at = 0.06 + k * 0.08;
    infoTl.to(h.text, { yPercent: -110, duration: 0.25, ease: 'power2.in' }, at);
    infoTl.to(h.src, { autoAlpha: 0, duration: 0.2 }, at);
    infoTl.add(() => {
      h.src.textContent = d.highlights[k][0];
      h.text.textContent = d.highlights[k][1];
    }, at + 0.26);
    infoTl.fromTo(h.text, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'expo.out', immediateRender: false }, at + 0.27);
    infoTl.to(h.src, { autoAlpha: 1, duration: 0.4 }, at + 0.3);
  });
}

/* ---------- stage (WebGL, or a flat fallback) ---------- */

function createFallback(canvases) {
  html.classList.add('no-webgl');
  const box = $('.fallback');
  box.innerHTML = canvases.map((c, i) => `<img alt="" src="${c.toDataURL('image/png')}" data-i="${i}">`).join('');
  const imgs = $$('img', box);
  const state = { progress: 0, hover: false, pointer: { x: 0, y: 0 }, intro: 1, open: 0, reduce };
  return {
    state,
    render() {
      imgs.forEach((img, i) => {
        const dist = i - state.progress;
        img.style.opacity = String(Math.max(0, 1 - Math.abs(dist) * 1.6) * state.intro * (1 - state.open));
        img.style.transform = `translateX(${dist * 40}vw) rotate(${dist * 40}deg)`;
      });
    },
    activeEllipse() {
      const i = Math.round(state.progress);
      if (Math.abs(i - state.progress) > 0.08 || state.open > 0.01 || state.intro < 0.98) return null;
      const r = imgs[i].getBoundingClientRect();
      return { index: i, cx: r.left + r.width / 2, cy: r.top + r.height / 2, rx: r.width / 2, ry: r.height / 2, angle: 0 };
    },
    restEllipse() {
      // mirrors .fallback img in styles.css
      const r = Math.min(window.innerHeight * 0.6, window.innerWidth * 0.7) / 2;
      return { cx: window.innerWidth / 2, cy: window.innerHeight * 0.48, rx: r, ry: r, angle: 0 };
    },
  };
}

let stage;
let active = 0;
let target = 0;
let aim = null; // the disc a scroll is heading to, so quick repeat taps or swipes each move one disc
let playerOpen = false;
let playerIndex = -1;

function sectionHeight() {
  return track.firstElementChild.offsetHeight;
}

function goTo(i, instant = false) {
  const n = discs.length;
  const idx = (i + n) % n;
  aim = idx;
  updateArrows();
  window.scrollTo({ top: idx * sectionHeight(), behavior: instant || reduce ? 'auto' : 'smooth' });
}

// one disc back or forward, stopping at the ends like the keyboard arrows
function step(dir) {
  const from = aim ?? active;
  const to = Math.min(Math.max(from + dir, 0), discs.length - 1);
  if (to !== from) goTo(to);
}

function updateActive() {
  dockBtns.forEach((b, i) => b.setAttribute('aria-current', String(i === active)));
  setInfo(active, true);
  updateArrows();
}

/* ---------- arrows (phones and tablets) ---------- */

function updateArrows() {
  const i = aim ?? active;
  const last = discs.length - 1;
  const hadFocus = document.activeElement;
  arrowPrev.disabled = i === 0;
  arrowNext.disabled = i === last;
  arrowPrev.setAttribute('aria-label', i === 0 ? 'Previous disc' : `Previous disc: ${discs[i - 1].label}`);
  arrowNext.setAttribute('aria-label', i === last ? 'Next disc' : `Next disc: ${discs[i + 1].label}`);
  // reaching an end disables the arrow that was pressed, so hand focus to the other one
  if (hadFocus === arrowPrev && arrowPrev.disabled) arrowNext.focus({ preventScroll: true });
  if (hadFocus === arrowNext && arrowNext.disabled) arrowPrev.focus({ preventScroll: true });
}

// sit the arrows either side of where the centred disc rests, vertically centred on it
function placeArrows() {
  const e = stage.restEllipse();
  const size = arrowPrev.offsetWidth || 44;
  const gap = 10;
  const edge = 12;
  const half = Math.hypot(e.rx * Math.cos(e.angle), e.ry * Math.sin(e.angle));
  const y = e.cy - size / 2;
  const left = Math.max(edge, e.cx - half - gap - size);
  const right = Math.min(window.innerWidth - edge - size, e.cx + half + gap);
  arrowPrev.style.transform = `translate(${left}px, ${y}px)`;
  arrowNext.style.transform = `translate(${right}px, ${y}px)`;
}

arrowPrev.addEventListener('click', () => step(-1));
arrowNext.addEventListener('click', () => step(1));

/* ---------- hit area over the centred disc ---------- */

let hitVisible = false;
function positionHit() {
  const e = playerOpen ? null : stage.activeEllipse();
  if (!e) {
    if (hitVisible) {
      hit.hidden = true;
      hitVisible = false;
      setHover(false);
    }
    return;
  }
  if (!hitVisible) {
    hit.hidden = false;
    hitVisible = true;
  }
  hit.style.width = `${e.rx * 2}px`;
  hit.style.height = `${e.ry * 2}px`;
  hit.style.transform = `translate(${e.cx - e.rx}px, ${e.cy - e.ry}px) rotate(${e.angle}rad)`;
  const label = `Open ${discs[e.index].label}`;
  if (hit.getAttribute('aria-label') !== label) hit.setAttribute('aria-label', label);
}

let hovering = false;
function setHover(on) {
  if (on === hovering) return;
  hovering = on;
  // hovering only nudges the spin; there is no outline or ring
  stage.state.hover = on;
}

hit.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && setHover(true));
hit.addEventListener('pointerleave', () => setHover(false));
hit.addEventListener('focus', () => setHover(true));
hit.addEventListener('blur', () => setHover(false));
hit.addEventListener('click', () => openRoute(active));

dockBtns.forEach((b) =>
  b.addEventListener('click', () => {
    const i = Number(b.dataset.index);
    if (i === active && Math.abs(stage.state.progress - i) < 0.05) openRoute(i);
    else goTo(i);
  })
);
$('.dock__mark').addEventListener('click', (e) => {
  e.preventDefault();
  goTo(0);
});

window.addEventListener('pointermove', (e) => {
  if (!stage || e.pointerType !== 'mouse') return;
  stage.state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  stage.state.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
});

window.addEventListener('keydown', (e) => {
  if (playerOpen) {
    if (e.key === 'Escape') closeRoute();
    if (e.key === 'Tab') player.trapFocus(e);
    return;
  }
  if (e.key === 'ArrowRight') goTo(Math.min(active + 1, discs.length - 1));
  if (e.key === 'ArrowLeft') goTo(Math.max(active - 1, 0));
});

/* ---------- media player window ---------- */

let lastFocus;
let discRect = null; // where the centred disc sat when the player opened
let closeMode = 'close';

const player = createPlayer({
  person,
  discs,
  reduce,
  onClose: (mode) => {
    closeMode = mode;
    closeRoute();
  },
  // switching discs inside the player keeps the URL and the disc behind it in sync
  onDisc: (i) => {
    playerIndex = i;
    history.replaceState(null, '', `#${discs[i].id}`);
    syncDisc(i);
  },
});

function syncDisc(i) {
  if (i === active) return;
  goTo(i, true);
  target = i;
  stage.state.progress = i;
  active = i;
  dockBtns.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
  setInfo(i, false);
}

// the landing-page UI steps back while the media player is open
const CHROME = '.info, .corner, .highlights, .dock, .arrows';

// horizontal swipes on touch screens move one disc per gesture
let swiped = false;
const swipe = Observer.create({
  target: window,
  type: 'touch',
  lockAxis: true,
  tolerance: 24,
  onPress: () => (swiped = false),
  onLeft: (self) => swipeTo(self, 1),
  onRight: (self) => swipeTo(self, -1),
});
function swipeTo(self, dir) {
  // taps and mostly vertical drags stay as taps and page scrolls
  if (swiped || Math.abs(self.x - self.startX) < Math.abs(self.y - self.startY) * 1.5) return;
  swiped = true;
  step(dir);
}

function rectOf(el) {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function openPlayer(i) {
  playerIndex = i;
  if (playerOpen) {
    syncDisc(i);
    player.show(i);
    return;
  }

  // capture the disc's outline before the hit area hides during the spin
  if (!hit.hidden && hit.offsetWidth) discRect = rectOf(hit);
  syncDisc(i);
  playerOpen = true;
  swipe.disable();
  lastFocus = document.activeElement;
  setHover(false);
  html.classList.add('is-locked');
  gsap.killTweensOf(stage.state);
  gsap.to(CHROME, { autoAlpha: 0, duration: D(0.3), overwrite: 'auto' });

  const tl = gsap.timeline();
  if (!reduce) {
    // spin up like a drive reading the disc, then launch the app
    tl.to(stage.state, { loading: 1, duration: 0.8, ease: 'power2.in' }).to({}, { duration: 0.3 });
  }
  tl.add(() => player.open(i, discRect))
    .to(stage.state, { open: 1, duration: D(0.9), ease: 'expo.inOut' }, '<')
    .set(stage.state, { loading: 0 });
}

function closePlayer() {
  if (!playerOpen) return;
  playerOpen = false;
  swipe.enable();
  html.classList.remove('is-locked');
  gsap.killTweensOf(stage.state);
  // minimise shrinks the window into the dock; close returns it to the disc
  const to = closeMode === 'min' ? rectOf(dock) : discRect;
  closeMode = 'close';
  player.close(to);
  gsap.to(CHROME, { autoAlpha: 1, duration: D(0.4), delay: D(0.25), overwrite: 'auto' });
  gsap
    .timeline()
    .to(stage.state, { loading: 0, duration: D(0.3) }, 0)
    .to(stage.state, { open: 0, duration: D(1.0), ease: 'expo.out' }, D(0.2));
  (lastFocus && document.contains(lastFocus) && lastFocus !== hit ? lastFocus : dockBtns[active]).focus({
    preventScroll: true,
  });
}

/* ---------- routing via #hash ---------- */

let pushedEntry = false;
function openRoute(i) {
  if (`#${discs[i].id}` === location.hash) return route();
  pushedEntry = true;
  location.hash = discs[i].id;
}
function closeRoute() {
  if (pushedEntry) {
    pushedEntry = false;
    history.back();
  } else {
    history.replaceState(null, '', location.pathname + location.search);
    route();
  }
}
function route() {
  const i = discs.findIndex((d) => `#${d.id}` === location.hash);
  if (i >= 0) {
    if (!playerOpen || playerIndex !== i) openPlayer(i);
  } else if (playerOpen) {
    closePlayer();
  }
}
window.addEventListener('hashchange', route);

/* ---------- boot ---------- */

async function boot() {
  const numEl = $('.loader__num');
  const shown = { v: 0 };
  const setLoad = (p) =>
    gsap.to(shown, {
      v: p * 100,
      duration: D(0.45),
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => (numEl.textContent = String(Math.round(shown.v))),
      onComplete: () => (numEl.textContent = String(Math.round(shown.v))),
    });

  await Promise.race([
    Promise.all([
      document.fonts.load('400 40px "Playfair Display"'),
      document.fonts.load('500 20px "Geist Mono"'),
      document.fonts.load('600 20px "Geist Variable"'),
      document.fonts.load('400 40px "Shadows Into Light"'),
      document.fonts.load('400 16px "Press Start 2P"'),
      document.fonts.load('400 20px "VT323"'),
      document.fonts.load('400 16px "Pixelify Sans Variable"'),
    ]),
    wait(2.5),
  ]);
  setLoad(0.15);

  const size = Math.min(window.innerWidth, window.innerHeight) < 700 ? 1024 : 1536;
  const canvases = [];
  for (let k = 0; k < discs.length; k++) {
    await nextFrame();
    // optional artwork: set discImage in content.js (e.g. '/discs/about.jpg') to replace the blank CD-R face
    const img = discs[k].discImage ? await loadImage(discs[k].discImage) : null;
    canvases.push(drawDisc(discs[k], size, person.monogram, img));
    setLoad(0.15 + (0.75 * (k + 1)) / discs.length);
  }

  try {
    if (!webglAvailable()) throw new Error('no webgl2');
    stage = createStage($('.stage'), canvases, canvases.map((c) => drawSpinBlur(c)), drawBackAlpha());
    stage.state.reduce = reduce;
    if (import.meta.env.DEV) window.__stage = stage;
  } catch (err) {
    console.warn('Falling back to flat discs:', err);
    stage = createFallback(canvases);
  }

  placeArrows();
  window.addEventListener('resize', placeArrows);

  // start where the URL points, if anywhere
  const hashIndex = discs.findIndex((d) => `#${d.id}` === location.hash);
  if (hashIndex > 0) goTo(hashIndex, true);

  ScrollTrigger.create({
    trigger: track,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => (target = self.progress * (discs.length - 1)),
    onRefresh: (self) => (target = self.progress * (discs.length - 1)),
  });
  ScrollTrigger.addEventListener('scrollEnd', () => {
    aim = null;
    updateArrows();
  });
  stage.state.progress = target;
  active = Math.round(target);
  dockBtns.forEach((b, i) => b.setAttribute('aria-current', String(i === active)));
  updateArrows();

  gsap.ticker.add((time, deltaMs) => {
    const k = reduce ? 1 : 1 - Math.exp((-deltaMs / 1000) * 7);
    stage.state.progress += (target - stage.state.progress) * k;
    const idx = Math.round(stage.state.progress);
    if (idx !== active && !playerOpen) {
      active = idx;
      updateActive();
    }
    if (!(playerOpen && stage.state.open >= 0.999)) stage.render();
    positionHit();
  });

  setLoad(1);
  await wait(D(0.55));
  stage.state.intro = reduce ? 1 : 0;

  gsap
    .timeline()
    .to('.loader__num', { yPercent: -110, duration: D(0.55), ease: 'power3.in' })
    .to('.loader__side', { autoAlpha: 0, duration: D(0.35) }, '<')
    .to('.loader', { autoAlpha: 0, duration: D(0.5) }, '-=0.1')
    .set('.loader', { display: 'none' })
    .to(stage.state, { intro: 1, duration: D(1.8), ease: 'expo.out' }, '-=0.45')
    .add(() => setInfo(active, true), '<0.25')
    .from('.dock', { y: 40, autoAlpha: 0, duration: D(0.9), ease: 'expo.out', clearProps: 'transform,translate,rotate,scale' }, '<0.1')
    .from('.corner__link', { y: -8, autoAlpha: 0, duration: D(0.6), stagger: 0.08, clearProps: 'transform,translate,rotate,scale' }, '<')
    .from('.arrows', { autoAlpha: 0, duration: D(0.6) }, '<0.2')
    .add(() => hashIndex >= 0 && route(), '<0.6');
}

boot();
