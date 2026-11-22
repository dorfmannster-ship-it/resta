/* Reading preferences, guide search and site navigation. */
(() => {
  'use strict';

  const store = window.BreraStore;
  const root = document.documentElement;
  const $ = id => document.getElementById(id);
  const menu = document.querySelector('.menu-toggle');
  const mobile = $('mobile-navigation');
  const mobileViewport = window.matchMedia('(max-width: 980px)');
  const search = $('chapter-search');
  const clear = $('clear-search');
  const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('it-IT').trim();
  const chapters = new Map(Array.from(document.querySelectorAll('.chapter'), chapter => [
    chapter.id, { chapter, text: normalize(chapter.textContent), title: chapter.querySelector('h3') }
  ]));
  const links = Array.from(document.querySelectorAll('.chapter-links a'));
  const resume = $('resume-reading');

  function closeMenu(restoreFocus = false) {
    if (mobile.hidden) return;
    mobile.hidden = true;
    menu.setAttribute('aria-expanded', 'false');
    if (restoreFocus && mobileViewport.matches) menu.focus();
  }

  mobile.hidden = true;
  menu.hidden = false;
  root.classList.add('navigation-ready');
  menu.addEventListener('click', () => {
    if (!mobile.hidden) {
      closeMenu(true);
      return;
    }
    mobile.hidden = false;
    mobile.scrollTop = 0;
    menu.setAttribute('aria-expanded', 'true');
  });
  mobileViewport.addEventListener('change', () => {
    const inMenu = mobile.contains(document.activeElement) || document.activeElement === menu;
    closeMenu();
    if (!mobileViewport.matches && inMenu) document.querySelector('.topnav a').focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobile.hidden) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  document.addEventListener('focusin', event => {
    if (event.target !== menu && !mobile.contains(event.target)) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !mobile.contains(event.target)) closeMenu();
  });

  const setText = (node, text) => {
    if (node.textContent !== text) node.textContent = text;
  };

  function filterGuide(raw) {
    const query = normalize(raw);
    let count = 0;
    for (const { chapter, text } of chapters.values()) {
      chapter.hidden = !text.includes(query);
      if (!chapter.hidden) count++;
    }
    for (const link of links) link.hidden = chapters.get(link.hash.slice(1)).chapter.hidden;
    clear.hidden = !raw;
    $('no-results').hidden = count > 0;
    setText($('search-status'), query ? `${count} ${count === 1 ? 'tema trovato' : 'temi trovati'}` : `${chapters.size} temi disponibili`);
  }

  const setReading = update => store.update(state => update(state.reading));
  function renderReading() {
    const reading = store.snapshot.reading;
    root.style.setProperty('--font-mult', reading.size);
    root.classList.toggle('high-contrast', reading.contrast);
    root.dataset.line = reading.line;
    root.dataset.spacing = reading.spacing;
    document.body.classList.toggle('quick-active', reading.quick);
    $('contrast').setAttribute('aria-pressed', String(reading.contrast));
    $('quick-mode').setAttribute('aria-pressed', String(reading.quick));
    $('reading-line').value = reading.line;
    $('reading-spacing').value = reading.spacing;
    $('font-down').setAttribute('aria-disabled', String(reading.size <= 0.85));
    $('font-up').setAttribute('aria-disabled', String(reading.size >= 1.5));
    setText($('reading-size'), `Dimensione del testo: ${Math.round(reading.size * 100)}%`);
    setText($('reading-mode-status'), reading.quick ? 'Solo i concetti essenziali' : 'Testo completo visibile');
    const last = chapters.get(reading.chapter);
    resume.hidden = !last;
    if (last) {
      resume.hash = reading.chapter;
      setText(resume, `Riprendi la lettura · ${last.title.textContent}`);
    }
  }

  function resize(delta) {
    setReading(reading => {
      reading.size = Math.min(1.5, Math.max(0.85, Number((reading.size + delta).toFixed(2))));
    });
  }

  function reviewHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const section = chapters.get(id);
    if (!section) return;
    const wasHidden = section.chapter.hidden;
    if (wasHidden) {
      search.value = '';
      filterGuide('');
      section.title.tabIndex = -1;
      section.title.focus({ preventScroll: true });
      section.chapter.scrollIntoView();
    }
    if (store.snapshot.reading.chapter !== id) setReading(reading => { reading.chapter = id; });
  }

  function focusDestination(link) {
    const id = link.hash.slice(1);
    const destination = $(id);
    if (!destination) return;
    const heading = destination.matches('section, article') ? destination.querySelector('h2, h3') : destination;
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    destination.scrollIntoView();
  }

  for (const link of mobile.querySelectorAll('a')) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      closeMenu();
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      focusDestination(link);
    });
  }

  search.addEventListener('input', () => {
    filterGuide(search.value);
    if (normalize(search.value) && store.snapshot.reading.quick) {
      setReading(reading => { reading.quick = false; });
    }
  });
  clear.addEventListener('click', () => {
    search.value = '';
    filterGuide('');
    search.focus();
  });
  for (const link of [...links, resume]) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      reviewHash();
      focusDestination(link);
    });
  }

  $('font-down').addEventListener('click', () => resize(-0.1));
  $('font-up').addEventListener('click', () => resize(0.1));
  $('font-reset').addEventListener('click', () => setReading(reading => { reading.size = 1; }));
  $('contrast').addEventListener('click', () => setReading(reading => { reading.contrast = !reading.contrast; }));
  $('quick-mode').addEventListener('click', () => setReading(reading => { reading.quick = !reading.quick; }));
  for (const [id, key] of [['reading-line', 'line'], ['reading-spacing', 'spacing']]) {
    $(id).addEventListener('change', event => {
      const value = event.target.value;
      setReading(reading => { reading[key] = value; });
    });
  }

  store.events.addEventListener('change', renderReading);
  store.ready.then(() => {
    renderReading();
    for (const id of ['lettura', 'reading-toolbar', 'chapter-search-tools']) $(id).hidden = false;
    reviewHash();
    window.addEventListener('hashchange', reviewHash);
  });
})();
