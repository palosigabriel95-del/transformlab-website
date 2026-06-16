/* ============================================================
   Transform·Lab — JS principal (vanilla, sin dependencias)
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── NAV: clase .scrolled al hacer scroll ─── */
  const nav = document.getElementById('siteNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ─── SCROLL REVEAL (IntersectionObserver) ─── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach(el => revealObserver.observe(el));
    }
  }

  /* ─── CONTADOR DE NÚMEROS (numbers-strip) — se repite mientras está visible ─── */
  const numbersStrip = document.querySelector('.numbers-strip');
  if (numbersStrip) {
    const priceEl   = numbersStrip.querySelector('.num-value[data-count-to="60"]');
    const kautionEl = numbersStrip.querySelector('.num-value[data-count-to="199"]');
    const weeksEl   = numbersStrip.querySelector('.num-value[data-count-to="8"]');
    const percentEl = numbersStrip.querySelector('.num-value[data-count-to="100"]');

    const DURATION     = 2400;  // más lento, para que se pueda leer
    const REPEAT_EVERY = 7000;  // repite la cuenta cada 7s mientras es visible

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    function animateValue(duration, onFrame) {
      const startTime = performance.now();
      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        onFrame(easeOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function runCycle() {
      if (priceEl) {
        priceEl.textContent = 139;
        animateValue(DURATION, t => { priceEl.textContent = Math.round(139 + (60 - 139) * t); });
      }
      // semanas y kaución suben sincronizadas y proporcionales (~25€ por semana)
      setTimeout(() => {
        if (weeksEl)   weeksEl.textContent = 0;
        if (kautionEl) kautionEl.textContent = 0;
        animateValue(DURATION, t => {
          const weekVal = t * 8;
          if (weeksEl)   weeksEl.textContent = Math.round(weekVal);
          if (kautionEl) kautionEl.textContent = Math.round(weekVal * (199 / 8));
        });
      }, 200);
      setTimeout(() => {
        if (percentEl) {
          percentEl.textContent = 0;
          animateValue(DURATION, t => { percentEl.textContent = Math.round(100 * t); });
        }
      }, 400);
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      if (priceEl)   priceEl.textContent   = 60;
      if (kautionEl) kautionEl.textContent = 199;
      if (weeksEl)   weeksEl.textContent   = 8;
      if (percentEl) percentEl.textContent = 100;
    } else {
      let intervalId = null;
      const stripObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (intervalId) return;
            runCycle();
            intervalId = setInterval(runCycle, REPEAT_EVERY);
          } else if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        });
      }, { threshold: 0.4 });
      stripObserver.observe(numbersStrip);
    }
  }

  /* ─── PARALLAX HERO (solo si no hay reduced-motion) ─── */
  const heroBg   = document.querySelector('.hero-bg');
  const heroGrid = document.querySelector('.hero-grid');
  if ((heroBg || heroGrid) && !reduceMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (heroBg)   heroBg.style.transform   = `translateY(${y * 0.15}px)`;
        if (heroGrid) heroGrid.style.transform = `translateY(${y * 0.3}px)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ─── CURSOR GLOW (solo desktop) ─── */
  const glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(pointer: fine)').matches) {
    let visible = false;
    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
      if (!visible) { glow.style.opacity = '1'; visible = true; }
    }, { passive: true });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; visible = false; });
  }

  /* ─── FORMULARIO → FORMSPREE → STRIPE ─── */
  const form = document.getElementById('solicitudForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const stripeUrl = form.querySelector('input[name="_next"]').value;

      btn.disabled = true;
      btn.textContent = 'Wird gesendet…';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          window.location.href = stripeUrl;
        } else {
          btn.disabled = false;
          btn.textContent = 'Weiter zur Zahlung — 259 €';
          alert('Fehler beim Senden. Bitte versuche es erneut.');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Weiter zur Zahlung — 259 €';
        alert('Verbindungsfehler. Bitte versuche es erneut.');
      }
    });
  }

  /* ─── FAQ ACORDEÓN ─── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

})();
