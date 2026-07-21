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

  /* ─── HERO CROSS-FADE MÓVIL (JS, fiable en iOS) ─── */
  if (window.innerWidth <= 768 && !reduceMotion) {
    const womanImg = document.querySelector('.hero-wipe-img--woman');
    if (womanImg) {
      function showWoman() {
        womanImg.classList.add('hero-woman-visible');
        setTimeout(hideWoman, 4000);
      }
      function hideWoman() {
        womanImg.classList.remove('hero-woman-visible');
        setTimeout(showWoman, 4000);
      }
      setTimeout(showWoman, 1000);
    }
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

  /* ─── FORM PROGRESS BAR — highlight step as user scrolls into each block ─── */
  const formProgress = document.querySelector('.form-progress');
  if (formProgress) {
    const fpSteps = formProgress.querySelectorAll('.fp-step');
    const formBlocks = document.querySelectorAll('.form-block');
    if (formBlocks.length && fpSteps.length) {
      const blockObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const idx = Array.from(formBlocks).indexOf(entry.target);
          fpSteps.forEach((s, i) => s.classList.toggle('fp-active', i === idx));
        });
      }, { threshold: 0.4 });
      formBlocks.forEach(b => blockObserver.observe(b));
    }
  }

  /* ─── FORMULARIO → FORMSPREE → STRIPE ─── */
  const form = document.getElementById('solicitudForm');
  if (form) {
    /* Real-time validation: highlight required fields on blur */
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
      if (field.type === 'checkbox' || field.type === 'radio') return;
      field.addEventListener('blur', () => {
        field.classList.toggle('field-error', !field.value.trim());
      });
      field.addEventListener('input', () => field.classList.remove('field-error'));
      field.addEventListener('change', () => field.classList.remove('field-error'));
    });

    /* Checkbox refs — defined here so both submit and change listeners can use them */
    const saludConsent = form.querySelector('#f-salud-consent');
    const avisoMedico  = form.querySelector('#f-aviso');
    const agbConsent   = form.querySelector('#f-agb');
    const checkboxesToValidate = [saludConsent, avisoMedico, agbConsent];

    /* Auto-clear checkbox error when user checks it */
    checkboxesToValidate.forEach(cb => {
      if (cb) cb.addEventListener('change', () => {
        if (cb.checked) cb.closest('.form-checkbox').classList.remove('checkbox-error');
      });
    });

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const stripeUrl = form.querySelector('input[name="_next"]').value;

      /* Validate ALL required fields and mark every error */
      let firstError = null;
      let hasErrors  = false;

      form.querySelectorAll('input[required]:not([type="checkbox"]):not([type="radio"]), select[required], textarea[required]').forEach(field => {
        if (!field.value.trim()) {
          field.classList.add('field-error');
          hasErrors = true;
          if (!firstError) firstError = field;
        }
      });

      checkboxesToValidate.forEach(cb => {
        if (cb && !cb.checked) {
          const wrap = cb.closest('.form-checkbox');
          wrap.classList.add('checkbox-error');
          hasErrors = true;
          if (!firstError) firstError = wrap;
        }
      });

      if (hasErrors) {
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Wird gesendet…';

      try {
        const formData = new FormData(form);
        const payload = {};
        formData.forEach((v, k) => { payload[k] = v; });

        const selectedPlan = form.querySelector('input[name="plan"]:checked')?.value;
        const webhookUrl = selectedPlan === 'nur_plan'
          ? 'https://hook.eu1.make.com/3wnfjy64go8desrcct79oxrdk1xbbeji'
          : 'https://hook.eu1.make.com/5i4ktv2j7jdmwwyp6ycbfpbagyng1flp';

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        window.location.href = stripeUrl;
      } catch {
        btn.disabled = false;
        btn.textContent = (form.querySelector('input[name="plan"]:checked')?.value === 'nur_plan') ? 'Kostenpflichtig bestellen — 139 €' : 'Platz anfragen';
        alert('Verbindungsfehler. Bitte versuche es erneut.');
      }
    });
  }

  /* ─── REVIEW FORM ─────────────────────────────────────────────────────────── */
  const REVIEW_WEBHOOK = 'https://hook.eu1.make.com/9komlatl5uykeyo3xh6np8xnmemuun01';
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(reviewForm).entries());
      // Enviar la reseña a Make.com (llega por email a hallo@transform-lab.de)
      fetch(REVIEW_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(() => { /* mostrar el agradecimiento igualmente */ });
      reviewForm.style.display = 'none';
      const thanks = document.getElementById('reviewThanks');
      if (thanks) thanks.style.display = 'block';
    });
  }

  /* ─── PLAN SELECTOR: pricing CTAs preseleccionan radio + precio dinámico ─── */

  // ⚠️ STRIPE: pega aquí el link de pago de Stripe para el plan de 139 €
  const STRIPE_URL_NURPLAN = 'https://buy.stripe.com/bJedR9e1l73E7lc3Q2fnO02?locale=de';
  const DANKE_URL = 'https://www.transform-lab.de/danke.html';

  const planRadios    = document.querySelectorAll('input[name="plan"]');
  const fpsLabel      = document.getElementById('fpsLabel');
  const fpsTotal      = document.getElementById('fpsTotal');
  const fpsNote       = document.getElementById('fpsNote');
  const formIntro     = document.getElementById('formIntro');
  const formSubmitBtn = document.getElementById('formSubmitBtn');
  const nurplanFields = document.getElementById('nurplan-fields');
  const fMensajeWrap  = document.getElementById('f-mensaje-wrap');
  const nextField     = form ? form.querySelector('input[name="_next"]') : null;

  const nurplanRequiredNames = ['alter', 'groesse', 'gewicht_aktuell', 'gewicht_ziel', 'aktivitaet'];
  const nurplanRequiredRadios = ['geschlecht', 'ernaehrung', 'trainingsort'];

  const formHeading    = document.getElementById('form-heading');
  const formMicrocopy  = document.getElementById('formMicrocopy');

  function setNurplanMode(isNurplan) {
    if (nurplanFields) nurplanFields.hidden = !isNurplan;
    if (fMensajeWrap)  fMensajeWrap.style.display = isNurplan ? 'none' : '';

    if (nurplanFields) {
      nurplanRequiredNames.forEach(name => {
        const el = nurplanFields.querySelector(`[name="${name}"]`);
        if (el) { isNurplan ? el.setAttribute('required', '') : el.removeAttribute('required'); }
      });
      nurplanRequiredRadios.forEach(name => {
        const first = nurplanFields.querySelector(`input[name="${name}"]`);
        if (first) { isNurplan ? first.setAttribute('required', '') : first.removeAttribute('required'); }
      });
      const trainingstage = nurplanFields.querySelector('[name="trainingstage"]');
      if (trainingstage) { isNurplan ? trainingstage.setAttribute('required', '') : trainingstage.removeAttribute('required'); }
    }

    if (nextField) nextField.value = isNurplan ? STRIPE_URL_NURPLAN : DANKE_URL;

    if (formSubmitBtn) {
      formSubmitBtn.textContent = isNurplan ? 'Kostenpflichtig bestellen — 139 €' : 'Platz anfragen';
    }

    if (formHeading) {
      formHeading.textContent = isNurplan ? 'Deine Angaben für den Nur Plan' : 'Challenge unverbindlich anfragen';
    }

    if (formIntro) {
      formIntro.textContent = isNurplan
        ? 'Nach dem Absenden wirst du zur sicheren Zahlung weitergeleitet. Nach erfolgreicher Zahlung erstellen wir deinen individuellen Ernährungs- und Trainingsplan — Lieferung innerhalb von 5 Werktagen nach Zahlungseingang.'
        : 'Wir prüfen deine Anfrage und melden uns innerhalb von 24 Stunden mit den nächsten Schritten. Es wird noch keine Zahlung ausgelöst.';
    }

    if (formMicrocopy) formMicrocopy.hidden = !isNurplan;

    if (fpsNote) {
      fpsNote.textContent = isNurplan
        ? 'Nach dem Absenden wirst du direkt zur sicheren Zahlung (Stripe) weitergeleitet.'
        : 'Diese Anfrage verpflichtet dich noch nicht zur Zahlung. Wir prüfen deine Anfrage und bestätigen deinen Platz vor dem Zahlungsschritt.';
    }
  }

  function updatePriceSummary(value) {
    if (!fpsLabel || !fpsTotal) return;
    if (value === 'nur_plan') {
      fpsLabel.textContent = 'Nur Plan — Ernährungs- + Trainingsplan';
      fpsTotal.textContent = '139 €';
    } else if (value === 'mit_kaution') {
      fpsLabel.textContent = 'Heute zu zahlen — 60 € Programm + 199 € rückerstattbare Kaution';
      fpsTotal.textContent = '259 €';
    } else {
      fpsLabel.textContent = 'Wähle oben einen Plan aus';
      fpsTotal.textContent = '';
    }
  }

  const subjectField = document.querySelector('input[name="_subject"]');
  function updateSubject(value) {
    if (!subjectField) return;
    if (value === 'nur_plan')         subjectField.value = 'Neue Anfrage: Nur Plan (139 €)';
    else if (value === 'mit_kaution') subjectField.value = 'Neue Anfrage: Mit Kaution (259 €)';
  }

  /* Challenge mit Kaution: nur "Fett verlieren" wählbar — andere Ziele nur im Nur Plan */
  const objetivoRadios = document.querySelectorAll('input[name="objetivo"]');
  const objetivoNote   = document.getElementById('objetivoKautionNote');
  function updateObjetivoOptions(planValue) {
    if (!objetivoRadios.length) return;
    const kautionOnly = planValue === 'mit_kaution';
    objetivoRadios.forEach(r => {
      if (r.value === 'fett_verlieren') return;
      r.disabled = kautionOnly;
      if (kautionOnly && r.checked) r.checked = false;
      const card = r.closest('.radio-card');
      if (card) card.classList.toggle('radio-card--disabled', kautionOnly);
    });
    if (objetivoNote) objetivoNote.hidden = !kautionOnly;
  }

  planRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updatePriceSummary(radio.value);
      updateSubject(radio.value);
      setNurplanMode(radio.value === 'nur_plan');
      updateObjetivoOptions(radio.value);
    });
  });

  // CTAs de la sección pricing preseleccionan el plan y llevan al form
  document.querySelectorAll('.pc-cta[data-plan]').forEach(btn => {
    btn.addEventListener('click', function() {
      const planVal = this.dataset.plan;
      const radio = document.querySelector(`input[name="plan"][value="${planVal}"]`);
      if (radio) {
        radio.checked = true;
        updatePriceSummary(planVal);
        updateSubject(planVal);
        setNurplanMode(planVal === 'nur_plan');
        updateObjetivoOptions(planVal);
      }
    });
  });

  /* ─── CAMPO SCHWANGER: visible solo si Geschlecht = weiblich ─── */
  const schwangerWrap   = document.getElementById('schwanger-wrap');
  const schwangerFirst  = document.getElementById('schwanger-nein');

  document.querySelectorAll('input[name="geschlecht"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isWeiblich = radio.value === 'weiblich';
      if (schwangerWrap) {
        schwangerWrap.hidden = !isWeiblich;
        if (schwangerFirst) {
          isWeiblich
            ? schwangerFirst.setAttribute('required', '')
            : schwangerFirst.removeAttribute('required');
        }
        if (!isWeiblich) {
          document.querySelectorAll('input[name="schwanger"]').forEach(r => r.checked = false);
        }
      }
    });
  });

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
