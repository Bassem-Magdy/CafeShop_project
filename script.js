/* ==========================================================================
   CAFE SHOP | script.js  (vanilla JS, no dependencies)
   1. Mobile navigation toggle
   2. Header shadow on scroll
   3. Active nav link (scroll spy)
   4. Menu category filter
   5. Reveal-on-scroll + animated counters
   6. Image error fallback
   7. Contact form validation (demo)
   8. Footer year
   ========================================================================== */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Mobile navigation ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('#primary-nav');

  const setNav = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 992px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  /* ---------- 2. Header shadow on scroll ---------- */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 3. Scroll spy ---------- */
  const links = $$('.nav__link');
  const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => {
          const active = l.getAttribute('href') === `#${entry.target.id}`;
          l.classList.toggle('is-active', active);
          if (active) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- 4. Menu filter ---------- */
  const filterBtns = $$('.filter__btn');
  const items = $$('.gallery__item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      items.forEach((item) => {
        const show = cat === 'all' || item.dataset.category === cat;
        item.classList.toggle('is-hidden', !show);
        // re-trigger a soft fade-in for visible items
        if (show && !reduceMotion) {
          item.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }],
                       { duration: 350, easing: 'ease-out' });
        }
      });
    });
  });

  /* ---------- 5. Reveal on scroll + counters ---------- */
  const revealTargets = $$('.section__head, .card, .media-card, .price-card, .team-card, .post, .split > *, .stats__item, .contact > *');
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion || Number.isNaN(target)) { el.textContent = target + suffix; return; }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        $$('[data-count]', entry.target).forEach(animateCount);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 6. Image fallback ---------- */
  // If a remote image fails, hide it so the branded gradient placeholder behind it shows.
  $$('img').forEach((img) => {
    const fail = () => img.classList.add('is-broken');
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* ---------- 7. Contact form (client-side demo) ---------- */
  const form = $('#contact-form');
  const status = $('#form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    $$('input, textarea', form).forEach((field) => {
      const ok = field.checkValidity() && field.value.trim() !== '';
      field.setAttribute('aria-invalid', String(!ok));
      if (!ok && valid) field.focus();
      valid = valid && ok;
    });

    status.classList.toggle('is-error', !valid);
    if (!valid) {
      status.textContent = 'Please complete all fields with a valid email address.';
      return;
    }
    // TODO: replace with a real endpoint (Formspree, Netlify Forms, your API...)
    status.textContent = 'Thank you! Your message has been sent. We\'ll be in touch soon.';
    form.reset();
  });

  /* ---------- 8. Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
