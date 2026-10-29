// "RBM Media Player": the retro app window that opens when a disc is clicked.
// About opens an artist page; every other disc opens a library-style tracklist.

import { gsap } from 'gsap';

import iCaretL from '@phosphor-icons/core/assets/regular/caret-left.svg?raw';
import iCaretR from '@phosphor-icons/core/assets/regular/caret-right.svg?raw';
import iSearch from '@phosphor-icons/core/assets/regular/magnifying-glass.svg?raw';
import iUser from '@phosphor-icons/core/assets/regular/user.svg?raw';
import iFolder from '@phosphor-icons/core/assets/regular/folder-simple.svg?raw';
import iBriefcase from '@phosphor-icons/core/assets/regular/briefcase.svg?raw';
import iBook from '@phosphor-icons/core/assets/regular/book-open-text.svg?raw';
import iFile from '@phosphor-icons/core/assets/regular/file-arrow-down.svg?raw';
import iGithub from '@phosphor-icons/core/assets/regular/github-logo.svg?raw';
import iLinkedin from '@phosphor-icons/core/assets/regular/linkedin-logo.svg?raw';
import iMail from '@phosphor-icons/core/assets/regular/envelope-simple.svg?raw';
import iDisc from '@phosphor-icons/core/assets/regular/disc.svg?raw';
import iMinus from '@phosphor-icons/core/assets/regular/minus.svg?raw';
import iSquare from '@phosphor-icons/core/assets/regular/square.svg?raw';
import iCopy from '@phosphor-icons/core/assets/regular/copy.svg?raw';
import iX from '@phosphor-icons/core/assets/regular/x.svg?raw';
import iOut from '@phosphor-icons/core/assets/regular/arrow-up-right.svg?raw';
import iPlay from '@phosphor-icons/core/assets/fill/play-fill.svg?raw';
import iPause from '@phosphor-icons/core/assets/fill/pause-fill.svg?raw';
import iStop from '@phosphor-icons/core/assets/fill/stop-fill.svg?raw';
import iPrev from '@phosphor-icons/core/assets/fill/skip-back-fill.svg?raw';
import iNext from '@phosphor-icons/core/assets/fill/skip-forward-fill.svg?raw';

import { drawCover, drawArtistArt } from './discArt.js';

const DISC_ICONS = { about: iUser, projects: iFolder, experience: iBriefcase, research: iBook };
const TRACK_SECONDS = 10; // how long each track stays "playing" before auto-advancing

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const $ = (s, root) => root.querySelector(s);
const $$ = (s, root) => [...root.querySelectorAll(s)];
const pad2 = (n) => String(n).padStart(2, '0');
const icon = (svg) => `<span class="ico" aria-hidden="true">${svg}</span>`;

export function createPlayer({ person, discs, reduce, onClose, onDisc }) {
  const D = (t) => (reduce ? 0 : t);
  const wide = window.matchMedia('(min-width: 1100px)');

  /* ---------- skeleton ---------- */

  const layer = document.createElement('div');
  layer.className = 'wmp-layer';
  layer.hidden = true;
  layer.innerHTML = `
    <div class="wmp-backdrop"></div>
    <div class="wmp-wire" aria-hidden="true"></div>
    <section class="wmp" role="dialog" aria-modal="true" aria-labelledby="wmp-title">
      <header class="wmp__titlebar">
        <span class="wmp__appicon">${icon(iDisc)}</span>
        <h2 class="wmp__title" id="wmp-title">RBM Media Player</h2>
        <div class="wmp__winbtns">
          <button class="winbtn" type="button" data-act="min" aria-label="Minimise">${icon(iMinus)}</button>
          <button class="winbtn" type="button" data-act="max" aria-label="Maximise">${icon(iSquare)}</button>
          <button class="winbtn winbtn--close" type="button" data-act="close" aria-label="Close">${icon(iX)}</button>
        </div>
      </header>

      <div class="wmp__toolbar">
        <div class="wmp__navbtns">
          <button class="roundbtn" type="button" data-act="prev-disc" aria-label="Previous disc">${icon(iCaretL)}</button>
          <button class="roundbtn" type="button" data-act="next-disc" aria-label="Next disc">${icon(iCaretR)}</button>
        </div>
        <p class="wmp__crumbs"></p>
        <label class="wmp__search">
          <span class="sr-only">Search this disc</span>
          <input type="search" placeholder="Search" autocomplete="off" spellcheck="false" />
          ${icon(iSearch)}
        </label>
      </div>

      <div class="wmp__body">
        <nav class="wmp__nav" aria-label="Library"></nav>
        <div class="wmp__main" tabindex="-1"></div>
        <aside class="wmp__np" aria-label="Now playing"></aside>
      </div>

      <footer class="wmp__transport">
        <div class="seek" aria-hidden="true"><span class="seek__fill"></span></div>
        <div class="tp__now">
          <span class="tp__artwrap"><img class="tp__art" alt="" /></span>
          <span class="tp__text"><span class="tp__title"></span><span class="tp__sub"></span></span>
        </div>
        <div class="tp__controls">
          <button class="tpbtn" type="button" data-act="stop" aria-label="Stop">${icon(iStop)}</button>
          <button class="tpbtn" type="button" data-act="prev" aria-label="Previous track">${icon(iPrev)}</button>
          <button class="tp__play" type="button" data-act="play" aria-label="Play">${icon(iPlay)}</button>
          <button class="tpbtn" type="button" data-act="next" aria-label="Next track">${icon(iNext)}</button>
        </div>
        <div class="tp__lcd" aria-hidden="true">
          <span class="lcd__time">00:00</span>
          <span class="lcd__track">01/01</span>
        </div>
      </footer>
    </section>`;
  document.body.appendChild(layer);

  const win = $('.wmp', layer);
  const wire = $('.wmp-wire', layer);
  const backdrop = $('.wmp-backdrop', layer);
  const titleEl = $('.wmp__title', layer);
  const crumbs = $('.wmp__crumbs', layer);
  const nav = $('.wmp__nav', layer);
  const main = $('.wmp__main', layer);
  const np = $('.wmp__np', layer);
  const search = $('.wmp__search input', layer);
  const seekFill = $('.seek__fill', layer);
  const tpArt = $('.tp__art', layer);
  const tpTitle = $('.tp__title', layer);
  const tpSub = $('.tp__sub', layer);
  const playBtn = $('.tp__play', layer);
  const lcd = $('.tp__lcd', layer);
  const lcdTime = $('.lcd__time', layer);
  const lcdTrack = $('.lcd__track', layer);
  const maxBtn = $('[data-act="max"]', layer);

  nav.innerHTML = `
    <p class="tree__head">Library</p>
    <ul class="tree">
      ${discs
        .map(
          (d, i) =>
            `<li><button class="tree__item" type="button" data-disc="${i}">${icon(DISC_ICONS[d.id] || iDisc)}<span>${esc(d.label)}</span></button></li>`
        )
        .join('')}
    </ul>
    <p class="tree__head tree__head--links">Links</p>
    <ul class="tree tree--links">
      <li><a class="tree__item" href="${esc(person.cv)}" download>${icon(iFile)}<span>CV</span></a></li>
      <li><a class="tree__item" href="mailto:${esc(person.email)}">${icon(iMail)}<span>Email</span></a></li>
      <li><a class="tree__item" href="${esc(person.github)}" target="_blank" rel="noopener">${icon(iGithub)}<span>GitHub</span></a></li>
      <li><a class="tree__item" href="${esc(person.linkedin)}" target="_blank" rel="noopener">${icon(iLinkedin)}<span>LinkedIn</span></a></li>
    </ul>`;
  const treeItems = $$('[data-disc]', nav);

  /* ---------- covers (generated once, cached) ---------- */

  const covers = new Map();
  const coverFor = (di, k) => {
    const t = k >= 0 ? discs[di].tracks[k] : null;
    if (t?.cover) return t.cover;
    const key = `${di}:${k}`;
    if (!covers.has(key)) covers.set(key, drawCover(discs[di], k, k >= 0 ? 160 : 264));
    return covers.get(key);
  };
  let artistArt;
  const artistPhoto = () => person.photo || (artistArt ??= drawArtistArt(person.monogram, 360));

  /* ---------- markup ---------- */

  const linkBtn = ([label, href]) =>
    `<a class="xpbtn" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ${icon(iOut)}</a>`;

  // Bold Roshan's name in author lists
  const bodyText = (p) => esc(p).replace(/Mahashabde, R\.?\s?B?\.?/g, (m) => `<strong>${m}</strong>`);

  function detailHTML(di, k, { inline = false } = {}) {
    const d = discs[di];
    const t = d.tracks[k];
    return `
      ${inline ? '' : `<div class="np__art"><img src="${coverFor(di, k)}" alt="" /></div>`}
      ${inline ? '' : `<h3 class="np__title">${esc(t.title)}</h3><p class="np__meta">${esc(t.meta)}<span class="np__time">${esc(t.time)}</span></p>`}
      ${d.bodyLabel ? `<p class="np__label">${esc(d.bodyLabel)}</p>` : ''}
      <div class="np__body">${t.body.map((p) => `<p>${bodyText(p)}</p>`).join('')}</div>
      ${t.links ? `<div class="np__links">${t.links.map(linkBtn).join('')}</div>` : ''}`;
  }

  function libHTML(di) {
    const d = discs[di];
    const [c1, c2, c3] = d.columns || ['Title', 'Details', 'Date'];
    return `
      <div class="lib" role="region" aria-label="${esc(d.title)} tracklist">
        <div class="lib__head" aria-hidden="true">
          <span>#</span><span>${esc(c1)}</span><span>${esc(c2)}</span><span>${esc(c3)}</span>
        </div>
        <ol class="lib__list">
          ${d.tracks
            .map(
              (t, k) => `
            <li class="lib__item" data-k="${k}">
              <button class="row" type="button" data-k="${k}" aria-pressed="false" aria-expanded="false">
                <span class="row__num"><span class="row__n">${k + 1}</span><span class="row__eq" aria-hidden="true"><i></i><i></i><i></i></span></span>
                <span class="row__title">
                  <img class="row__thumb" src="${coverFor(di, k)}" alt="" />
                  <span class="row__titletext">
                    <span class="row__name">${esc(t.title)}</span>
                    <span class="row__sub">${esc(t.meta)}<span> - ${esc(t.time)}</span></span>
                  </span>
                </span>
                <span class="row__col" title="${esc(t.meta)}">${esc(t.meta)}</span>
                <span class="row__col row__time">${esc(t.time)}</span>
              </button>
              <div class="row__detail">${detailHTML(di, k, { inline: true })}</div>
            </li>`
            )
            .join('')}
        </ol>
        <p class="lib__empty" hidden></p>
      </div>`;
  }

  function albumHTML(di) {
    const d = discs[di];
    const years = d.specs.find(([k]) => k === 'Years')?.[1];
    return `
      <header class="album">
        <img class="album__art" src="${coverFor(di, -1)}" alt="" />
        <div class="album__info">
          <p class="album__kicker">Disc ${di + 1} of ${discs.length}</p>
          <h3 class="album__title">${esc(d.title)}</h3>
          <p class="album__artist">${esc(person.name)}</p>
          <p class="album__meta">${d.tracks.length} tracks${years ? ` <span>/</span> ${esc(years)}` : ''} <span>/</span> ${esc(d.byline[0][1])}</p>
          <p class="album__intro">${esc(d.intro)}</p>
        </div>
      </header>
      ${libHTML(di)}`;
  }

  function artistHTML(di) {
    const d = discs[di];
    const total = discs.reduce((n, x) => n + x.tracks.length, 0);
    const papers = discs.find((x) => x.id === 'research')?.tracks.length ?? 0;
    const roles = discs.find((x) => x.id === 'experience')?.tracks.length ?? 0;
    const quote = d.statement.join(' ');
    return `
      <section class="artist">
        <div class="artist__hero">
          <img class="artist__photo" src="${esc(artistPhoto())}" alt="${person.photo ? esc(person.name) : ''}" />
          <div class="artist__info">
            <p class="album__kicker">Artist</p>
            <h3 class="artist__name">${esc(person.name)}</h3>
            <p class="artist__role">${esc(person.role)} <span>/</span> ${esc(person.location)}</p>
            <p class="artist__stats">
              <span><b>${discs.length}</b> discs</span>
              <span><b>${total}</b> tracks</span>
              <span><b>${roles}</b> internships</span>
              <span><b>${papers}</b> papers</span>
            </p>
            <div class="artist__actions">
              <a class="xpbtn xpbtn--primary" href="${esc(person.cv)}" download>${icon(iFile)} Download CV</a>
              <a class="xpbtn" href="mailto:${esc(person.email)}">${icon(iMail)} Email</a>
              <a class="xpbtn" href="${esc(person.github)}" target="_blank" rel="noopener">${icon(iGithub)} GitHub</a>
              <a class="xpbtn" href="${esc(person.linkedin)}" target="_blank" rel="noopener">${icon(iLinkedin)} LinkedIn</a>
            </div>
          </div>
        </div>

        <blockquote class="artist__quote">“${esc(quote)}”</blockquote>

        <div class="artist__cols">
          <div>
            <h4 class="sect">Biography</h4>
            <p class="artist__bio">${esc(d.intro)}</p>
            <h4 class="sect">Genres</h4>
            <ul class="tags">${(d.genres || []).map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
          </div>
          <div>
            <h4 class="sect">Details</h4>
            <dl class="facts">${d.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          </div>
        </div>

        <h4 class="sect">Toolkit</h4>
        <div class="toolkit">
          ${(d.toolkit || [])
            .map(([g, items]) => `<div><p class="toolkit__group">${esc(g)}</p><ul class="tags tags--quiet">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`)
            .join('')}
        </div>

        <h4 class="sect">Discography</h4>
        ${libHTML(di)}
      </section>`;
  }

  function playlistHTML(di) {
    const d = discs[di];
    return `
      <p class="np__head">Playlist</p>
      <ol class="pl">
        ${d.tracks
          .map(
            (t, k) =>
              `<li><button class="pl__item" type="button" data-k="${k}" aria-pressed="false"><span class="pl__name">${esc(t.title)}</span><span class="pl__time">${esc(t.time)}</span></button></li>`
          )
          .join('')}
      </ol>
      <p class="pl__foot">${d.tracks.length} items</p>`;
  }

  /* ---------- state ---------- */

  let di = 0;
  let sel = 0;
  let expanded = -1; // which row is expanded in narrow layouts
  let playing = false;
  let elapsed = 0;
  let trackT = 0;
  let isOpen = false;
  let lastSecond = -1;

  const rowsOf = () => $$('.row', main);
  const itemsOf = () => $$('.lib__item', main);

  function render(i) {
    di = i;
    const d = discs[i];
    titleEl.textContent = `RBM Media Player - ${d.title}`;
    crumbs.innerHTML = `<span>Library</span>${icon(iCaretR)}<span>Discs</span>${icon(iCaretR)}<b>${esc(d.title)}</b>`;
    treeItems.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
    main.innerHTML = d.id === 'about' ? artistHTML(i) : albumHTML(i);
    main.scrollTop = 0;
    search.value = '';
    search.placeholder = `Search ${d.label}`;
    sel = -1;
    expanded = -1;
    elapsed = 0;
    trackT = 0;
    select(0, { quiet: true });
    updateLcd(true);
  }

  function select(k, { quiet = false, focus = false } = {}) {
    const d = discs[di];
    const n = d.tracks.length;
    k = ((k % n) + n) % n;
    const changed = k !== sel;
    sel = k;
    rowsOf().forEach((r) => r.setAttribute('aria-pressed', String(Number(r.dataset.k) === k)));
    itemsOf().forEach((li) => li.classList.toggle('is-selected', Number(li.dataset.k) === k));

    if (changed || !np.innerHTML) {
      np.innerHTML = `<p class="np__head">Now playing</p><div class="np__card">${detailHTML(di, k)}</div>${playlistHTML(di)}`;
      if (!quiet && !reduce) {
        gsap.fromTo($('.np__card', np), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24, ease: 'steps(3)' });
      }
    }
    $$('.pl__item', np).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.k) === k)));

    const t = d.tracks[k];
    tpArt.src = coverFor(di, k);
    tpTitle.textContent = t.title;
    tpSub.textContent = `${d.title} / ${t.meta}`;
    if (changed) trackT = 0;
    updateLcd(true);
    updateSeek();
    if (focus) rowsOf()[k]?.focus();
  }

  function setExpanded(k) {
    expanded = k;
    itemsOf().forEach((li) => {
      const on = Number(li.dataset.k) === k;
      li.classList.toggle('is-open', on);
      $('.row', li).setAttribute('aria-expanded', String(on));
    });
  }

  function updateSeek() {
    const n = discs[di].tracks.length;
    gsap.to(seekFill, { scaleX: (sel + trackT) / n, duration: playing ? 0.15 : D(0.35), ease: playing ? 'none' : 'power2.out', overwrite: true });
  }

  function updateLcd(force = false) {
    const s = Math.floor(elapsed);
    if (!force && s === lastSecond) return;
    lastSecond = s;
    lcdTime.textContent = `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
    lcdTrack.textContent = `${pad2(sel + 1)}/${pad2(discs[di].tracks.length)}`;
  }

  function setPlaying(on) {
    playing = on;
    playBtn.innerHTML = icon(on ? iPause : iPlay);
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    lcd.classList.toggle('is-paused', !on && elapsed > 0);
    win.classList.toggle('is-playing', on);
  }

  // Playback clock: only runs while the window is open and playing
  function tick(_, deltaMs) {
    if (!isOpen || !playing) return;
    const dt = deltaMs / 1000;
    elapsed += dt;
    trackT += dt / TRACK_SECONDS;
    if (trackT >= 1) {
      trackT = 0;
      select(sel + 1);
      if (!wide.matches && expanded >= 0) setExpanded(sel);
    }
    updateLcd();
    updateSeek();
  }
  gsap.ticker.add(tick);

  /* ---------- events ---------- */

  layer.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    const row = e.target.closest('.row');
    const pl = e.target.closest('.pl__item');
    const tree = e.target.closest('[data-disc]');

    if (row) {
      const k = Number(row.dataset.k);
      if (!wide.matches) setExpanded(expanded === k && sel === k ? -1 : k);
      select(k);
      return;
    }
    if (pl) return select(Number(pl.dataset.k));
    if (tree) return switchDisc(Number(tree.dataset.disc));
    if (e.target === backdrop) return onClose('close');

    switch (act) {
      case 'close':
        return onClose('close');
      case 'min':
        return onClose('min');
      case 'max': {
        const max = win.classList.toggle('is-max');
        maxBtn.innerHTML = icon(max ? iCopy : iSquare);
        maxBtn.setAttribute('aria-label', max ? 'Restore' : 'Maximise');
        return;
      }
      case 'prev-disc':
        return switchDisc(di - 1);
      case 'next-disc':
        return switchDisc(di + 1);
      case 'play':
        return setPlaying(!playing);
      case 'stop':
        setPlaying(false);
        elapsed = 0;
        trackT = 0;
        lcd.classList.remove('is-paused');
        select(0);
        return;
      case 'prev':
        return select(sel - 1);
      case 'next':
        return select(sel + 1);
    }
  });

  // Arrow keys move through the tracklist, like a real library view
  main.addEventListener('keydown', (e) => {
    if (!e.target.classList?.contains('row')) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const visible = rowsOf().filter((r) => !r.closest('.lib__item').hidden);
    const at = visible.indexOf(e.target);
    const next = visible[at + (e.key === 'ArrowDown' ? 1 : -1)];
    if (next) {
      select(Number(next.dataset.k));
      next.focus();
      if (!wide.matches && expanded >= 0) setExpanded(sel);
    }
  });

  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    const d = discs[di];
    let shown = 0;
    itemsOf().forEach((li) => {
      const t = d.tracks[Number(li.dataset.k)];
      const hay = [t.title, t.meta, t.time, ...t.body].join(' ').toLowerCase();
      li.hidden = q !== '' && !hay.includes(q);
      if (!li.hidden) shown++;
    });
    const empty = $('.lib__empty', main);
    if (empty) {
      empty.hidden = shown > 0;
      empty.textContent = `No tracks on this disc match "${search.value.trim()}".`;
    }
  });

  wide.addEventListener('change', () => setExpanded(-1));

  function switchDisc(i) {
    const n = discs.length;
    const next = ((i % n) + n) % n;
    if (next === di) return;
    onDisc(next);
    show(next);
  }

  /* ---------- open / close / switch ---------- */

  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  };
  const centreRect = () => {
    const s = Math.min(window.innerWidth, window.innerHeight) * 0.3;
    return { left: (window.innerWidth - s) / 2, top: (window.innerHeight - s) / 2, width: s, height: s };
  };

  function revealContent(delay = 0) {
    if (reduce) return;
    const parts = $$('.album, .artist__hero, .artist__quote, .artist__cols, .toolkit, .lib__head, .lib__item, .sect', main);
    gsap.fromTo(
      parts,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power2.out', stagger: { amount: 0.4 }, delay, clearProps: 'transform' }
    );
  }

  function open(i, from) {
    isOpen = true;
    layer.hidden = false;
    win.classList.remove('is-max');
    maxBtn.innerHTML = icon(iSquare);
    render(i);
    setPlaying(false);

    const focusFirst = () => (rowsOf()[0] || main).focus({ preventScroll: true });
    if (reduce) {
      gsap.set([win, backdrop], { autoAlpha: 1 });
      gsap.set(wire, { autoAlpha: 0 });
      focusFirst();
      return gsap.timeline();
    }

    // Classic window-open: a dotted outline zooms out in steps, then the window appears
    const to = rectOf(win);
    const start = from || centreRect();
    gsap.set(win, { autoAlpha: 0 });
    gsap.set(wire, { ...start, autoAlpha: 1 });
    const tl = gsap
      .timeline()
      .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0)
      .to(wire, { ...to, duration: 0.42, ease: 'steps(7)' }, 0)
      .set(wire, { autoAlpha: 0 })
      .set(win, { autoAlpha: 1 })
      .fromTo(
        $$('.wmp__titlebar, .wmp__toolbar, .wmp__nav, .wmp__np, .wmp__transport', win),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.18, ease: 'steps(2)', stagger: 0.04 }
      )
      .add(() => revealContent(), '<')
      .add(focusFirst);
    return tl;
  }

  function close(toRect) {
    isOpen = false;
    setPlaying(false);
    const done = () => {
      layer.hidden = true;
      main.innerHTML = '';
      np.innerHTML = '';
      gsap.set([win, wire, backdrop], { clearProps: 'all' });
    };
    if (reduce) {
      done();
      return gsap.timeline();
    }
    const from = rectOf(win);
    const to = toRect || centreRect();
    gsap.set(wire, { ...from, autoAlpha: 1 });
    gsap.set(win, { autoAlpha: 0 });
    return gsap
      .timeline({ onComplete: done })
      .to(wire, { ...to, duration: 0.34, ease: 'steps(6)' }, 0)
      .set(wire, { autoAlpha: 0 })
      .to(backdrop, { autoAlpha: 0, duration: 0.3 }, 0.1);
  }

  function show(i) {
    setPlaying(false);
    if (reduce) {
      render(i);
      return;
    }
    gsap.to(main, {
      autoAlpha: 0,
      duration: 0.12,
      ease: 'steps(2)',
      onComplete: () => {
        render(i);
        gsap.set(main, { autoAlpha: 1 });
        revealContent();
      },
    });
  }

  function trapFocus(e) {
    const focusables = $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', win).filter(
      (el) => el.offsetParent !== null && !el.closest('[hidden]')
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

  return {
    open,
    close,
    show,
    trapFocus,
    get isOpen() {
      return isOpen;
    },
    get disc() {
      return di;
    },
  };
}
