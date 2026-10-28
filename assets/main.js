/* Osobný akademický web – správanie stránky (bez externých knižníc) */
(function () {
  var root = document.documentElement;

  /* ---------- Jazyk (SK / EN) ---------- */

  function setLang(lang, save) {
    root.setAttribute('data-lang', lang);
    root.lang = lang;

    var title = root.getAttribute('data-title-' + lang);
    if (title) document.title = title;

    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-set-lang') === lang));
    });
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute('data-placeholder-' + lang));
    });
    document.querySelectorAll('[data-label-' + lang + ']').forEach(function (el) {
      el.setAttribute('aria-label', el.getAttribute('data-label-' + lang));
    });

    if (save) {
      try { localStorage.setItem('lang', lang); } catch (e) { /* súkromné okno a pod. */ }
    }
  }

  setLang(root.getAttribute('data-lang') === 'en' ? 'en' : 'sk', false);

  document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(btn.getAttribute('data-set-lang'), true); });
  });

  /* ---------- Mobilné menu ---------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');

  function closeNav() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { closeNav(); toggle.focus(); }
    });
  }

  /* ---------- Hlavička: linka po odscrollovaní ---------- */

  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Aktuálny rok v pätičke ---------- */

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Publikácie: filter a vyhľadávanie ---------- */

  var pubs = document.querySelector('[data-pubs]');
  if (pubs) {
    var chips = document.querySelectorAll('[data-filter]');
    var search = document.querySelector('[data-pub-search]');
    var count = document.querySelector('[data-pub-count]');
    var empty = document.querySelector('[data-pub-empty]');
    var active = 'all';

    // Vyhľadávanie ignoruje diakritiku a veľké písmená („unia“ nájde „Únia“)
    function norm(s) {
      return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    function apply() {
      var q = search ? norm(search.value.trim()) : '';
      var shown = 0;
      pubs.querySelectorAll('.year-group').forEach(function (group) {
        var n = 0;
        group.querySelectorAll('.pub').forEach(function (pub) {
          var topics = (pub.getAttribute('data-topic') || '').split(' ');
          var ok = (active === 'all' || topics.indexOf(active) !== -1) &&
                   (!q || norm(pub.textContent).indexOf(q) !== -1);
          pub.hidden = !ok;
          if (ok) n++;
        });
        group.hidden = n === 0;
        shown += n;
      });
      if (count) count.textContent = shown;
      if (empty) empty.hidden = shown !== 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        active = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
    apply();
  }

  /* ---------- Kopírovanie citácie ---------- */

  document.querySelectorAll('[data-copy-cite]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pub = btn.closest('.pub');
      var text = pub && pub.getAttribute('data-cite');
      if (!text) return;
      var original = btn.innerHTML;

      function done() {
        btn.innerHTML = '<span lang="sk">Skopírované ✓</span><span lang="en">Copied ✓</span>';
        setTimeout(function () { btn.innerHTML = original; }, 1800);
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
      } else {
        fallback(text);
        done();
      }
    });
  });

  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* nič */ }
    document.body.removeChild(ta);
  }
})();
