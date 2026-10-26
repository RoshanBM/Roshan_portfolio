import '@fontsource/playfair-display/400.css';
import '@fontsource-variable/geist';
import '@fontsource/geist-mono/500.css';
import '@fontsource/shadows-into-light/400.css';
import './styles.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';

import iconDownload from '@phosphor-icons/core/assets/regular/download-simple.svg?raw';
import iconX from '@phosphor-icons/core/assets/regular/x.svg?raw';
import iconArrowRight from '@phosphor-icons/core/assets/regular/arrow-right.svg?raw';
import iconArrowUpRight from '@phosphor-icons/core/assets/regular/arrow-up-right.svg?raw';

import { person, discs } from './content.js';
import { drawDisc, drawSpinBlur, drawBackAlpha, drawPoster, isLightArt } from './discArt.js';
import { createStage, webglAvailable } from './scene.js';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = (t) => (reduce ? 0 : t);
const ICONS = { download: iconDownload, x: iconX, arrow: iconArrowRight, out: iconArrowUpRight };
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
const panel = $('.panel');
const panelScroll = $('.panel__scroll');
const closeBtn = $('.panel__close');

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
  };
}

let stage;
let active = 0;
let target = 0;
let panelOpen = false;
let panelIndex = -1;

function sectionHeight() {
  return track.firstElementChild.offsetHeight;
}

function goTo(i, instant = false) {
  const n = discs.length;
  const idx = (i + n) % n;
  window.scrollTo({ top: idx * sectionHeight(), behavior: instant || reduce ? 'auto' : 'smooth' });
}

function updateActive() {
  dockBtns.forEach((b, i) => b.setAttribute('aria-current', String(i === active)));
  setInfo(active, true);
}

/* ---------- hit area over the centred disc ---------- */

let hitVisible = false;
function positionHit() {
  const e = panelOpen ? null : stage.activeEllipse();
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
  if (panelOpen) {
    if (e.key === 'Escape') closeRoute();
    if (e.key === 'Tab') trapFocus(e);
    return;
  }
  if (e.key === 'ArrowRight') goTo(Math.min(active + 1, discs.length - 1));
  if (e.key === 'ArrowLeft') goTo(Math.max(active - 1, 0));
});

/* ---------- detail panel ---------- */

const HILL =
  '<svg class="band__hill" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0H1440V118C1300 124 1210 66 1060 42C930 22 820 72 700 66C560 58 470 12 330 22C200 31 110 98 0 106Z"/></svg>';
const posters = new Map();

function posterFor(i) {
  if (!posters.has(i)) {
    const w = window.innerWidth < 700 ? 900 : 1800;
    posters.set(i, drawPoster(discs[i], w, Math.round(w * 0.62)));
  }
  return posters.get(i);
}

function panelHTML(i) {
  const d = discs[i];
  const next = discs[(i + 1) % discs.length];
  const link = ([label, href]) =>
    `<a class="tlink" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} <span class="icon" data-icon="out"></span></a>`;

  return `
  <header class="panel__head">
    <h2 class="panel__title" id="panel-title">${esc(d.title)}</h2>
    <p class="panel__byline">${d.byline.map(([k, v]) => `<span><span class="lbl">${esc(k)}</span>${esc(v)}</span>`).join('')}</p>
  </header>
  <dl class="panel__specs">
    ${d.specs.map(([k, v]) => `<div class="panel__spec"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
  </dl>
  <figure class="band ${isLightArt(d) ? '' : 'band--dark-ink'}">
    ${HILL}
    <img class="band__img" src="${posterFor(i)}" alt="">
    <ul class="band__lines" aria-label="${esc(d.statement.join(' '))}">
      ${d.statement.map((l) => `<li class="band__line" aria-hidden="true"><span>${esc(l)}</span></li>`).join('')}
    </ul>
  </figure>
  <section class="panel__body">
    <p class="panel__intro">${esc(d.intro)}</p>
    <ol class="tracks">
      ${d.tracks
        .map(
          (t, k) => `
        <li class="track-item">
          <span class="track-item__num">${String(k + 1).padStart(2, '0')}</span>
          <div>
            <h3 class="track-item__title">${esc(t.title)}</h3>
            <p class="track-item__meta">${esc(t.meta)}</p>
          </div>
          <span class="track-item__time">${esc(t.time)}</span>
          <div class="track-item__body">
            ${t.body.map((p) => `<p>${esc(p)}</p>`).join('')}
            ${t.links ? `<div class="track-item__links">${t.links.map(link).join('')}</div>` : ''}
          </div>
        </li>`
        )
        .join('')}
    </ol>
  </section>
  <footer class="panel__foot">
    <div class="foot__contact">
      <a class="foot__big" href="mailto:${esc(person.email)}">Email me</a>
      <div class="foot__links">
        ${link(['LinkedIn', person.linkedin])}
        ${link(['GitHub', person.github])}
        <a class="tlink" href="${esc(person.cv)}" download>CV <span class="icon" data-icon="download"></span></a>
      </div>
    </div>
    <button class="next" type="button" data-next="${(i + 1) % discs.length}">
      <span><span class="lbl">Next disc</span><span class="next__title">${esc(next.title)}</span></span>
      <span class="icon" data-icon="arrow"></span>
    </button>
  </footer>`;
}

let panelCtx;
let lastFocus;

function buildPanelContent(i, lead = 0) {
  panelCtx?.revert();
  panelScroll.innerHTML = panelHTML(i);
  panelScroll.scrollTop = 0;
  fillIcons(panelScroll);
  $('.next', panelScroll).addEventListener('click', (e) => {
    const n = Number(e.currentTarget.dataset.next);
    history.replaceState(null, '', `#${discs[n].id}`);
    route();
  });

  panelCtx = gsap.context(() => {
    if (reduce) return;
    const scroller = panelScroll;
    const title = SplitText.create('.panel__title', { type: 'chars', mask: 'chars' });
    gsap.from(title.chars, { yPercent: 105, duration: 1, ease: 'expo.out', stagger: 0.035, delay: lead + 0.5 });
    gsap.from('.panel__byline, .panel__spec', {
      y: 14,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.06,
      delay: lead + 0.75,
    });

    gsap.fromTo(
      '.band__img',
      { yPercent: -8, scale: 1.12 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: '.band', scroller, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
    gsap.from('.band__line > span', {
      yPercent: 110,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.09,
      scrollTrigger: { trigger: '.band__lines', scroller, start: 'top 70%' },
    });

    SplitText.create('.panel__intro', {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 100,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: { trigger: '.panel__intro', scroller, start: 'top 85%' },
        }),
    });

    const items = gsap.utils.toArray('.track-item');
    gsap.set(items, { autoAlpha: 0, y: 18 });
    ScrollTrigger.batch(items, {
      scroller,
      start: 'top 92%',
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }),
    });
  }, panel);
}

function openPanel(i) {
  const switching = panelOpen;
  panelIndex = i;

  // keep the disc behind the panel in sync with what is open
  if (i !== active) {
    goTo(i, true);
    target = i;
    stage.state.progress = i;
  }

  if (switching) {
    gsap.to(panelScroll, {
      autoAlpha: 0,
      duration: D(0.25),
      onComplete: () => {
        buildPanelContent(i);
        gsap.to(panelScroll, { autoAlpha: 1, duration: D(0.4) });
        $('.panel__title', panelScroll).setAttribute('tabindex', '-1');
        $('.panel__title', panelScroll).focus({ preventScroll: true });
      },
    });
    return;
  }

  panelOpen = true;
  lastFocus = document.activeElement;
  setHover(false);
  gsap.killTweensOf([panel, stage.state]);
  gsap.set(panel, { clearProps: 'all' });
  gsap.set(panel, { yPercent: reduce ? 0 : 100 });
  // the panel must be laid out before its ScrollTriggers measure anything
  panel.hidden = false;
  html.classList.add('is-locked');
  buildPanelContent(i, reduce ? 0 : 1.3);
  const tl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
  if (!reduce) {
    // spin up like a drive reading the disc, hold, then open the page
    tl.to(stage.state, { loading: 1, duration: 0.8, ease: 'power2.in' }).to({}, { duration: 0.5 });
  }
  tl.addLabel('open')
    .to(panel, { yPercent: 0, duration: D(1.05), ease: 'expo.inOut' }, 'open')
    .to(stage.state, { open: 1, duration: D(1.05), ease: 'expo.inOut' }, 'open')
    .set(stage.state, { loading: 0 })
    .add(() => closeBtn.focus({ preventScroll: true }), `open+=${D(0.6)}`);
}

function closePanel() {
  if (!panelOpen) return;
  panelOpen = false;
  html.classList.remove('is-locked');
  gsap.killTweensOf([panel, stage.state]);
  gsap
    .timeline({
      onComplete: () => {
        panel.hidden = true;
        panelCtx?.revert();
        panelCtx = null;
        panelScroll.innerHTML = '';
        gsap.set([panel, panelScroll], { clearProps: 'all' });
      },
    })
    .to(panel, { autoAlpha: 0, y: 24, duration: D(0.35), ease: 'power2.in' }, 0)
    .to(stage.state, { open: 0, duration: D(1.1), ease: 'expo.out' }, D(0.15))
    .to(stage.state, { loading: 0, duration: D(0.4) }, 0);
  (lastFocus && document.contains(lastFocus) ? lastFocus : dockBtns[active]).focus({ preventScroll: true });
}

function trapFocus(e) {
  const focusables = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', panel).filter(
    (el) => el.offsetParent !== null
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
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
    if (!panelOpen || panelIndex !== i) openPanel(i);
  } else if (panelOpen) {
    closePanel();
  }
}
window.addEventListener('hashchange', route);
closeBtn.addEventListener('click', closeRoute);

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
  stage.state.progress = target;
  active = Math.round(target);
  dockBtns.forEach((b, i) => b.setAttribute('aria-current', String(i === active)));

  gsap.ticker.add((time, deltaMs) => {
    const k = reduce ? 1 : 1 - Math.exp((-deltaMs / 1000) * 7);
    stage.state.progress += (target - stage.state.progress) * k;
    const idx = Math.round(stage.state.progress);
    if (idx !== active && !panelOpen) {
      active = idx;
      updateActive();
    }
    if (!(panelOpen && stage.state.open >= 0.999)) stage.render();
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
    .from('.dock', { y: 40, autoAlpha: 0, duration: D(0.9), ease: 'expo.out' }, '<0.1')
    .from('.corner__link', { y: -8, autoAlpha: 0, duration: D(0.6), stagger: 0.08 }, '<')
    .add(() => hashIndex >= 0 && route(), '<0.6');
}

boot();
