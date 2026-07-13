/* ============================================================
 * Transform·Lab — Meta Pixel (Base + Consent-Gating)
 * ------------------------------------------------------------
 * Der Pixel bleibt INAKTIV, bis der Nutzer Marketing-Cookies
 * über das Consent-Banner (js/consent.js) akzeptiert. Das Banner
 * ruft window.TLPixel.grantConsent() auf. Erst dann werden Pixel
 * geladen und PageView gefeuert — genau EINMAL pro Seitenaufruf.
 *
 * Pixel-ID ändern: nur META_PIXEL_ID unten.
 *
 * CUSTOM-EVENTS (P4): unten in TLPixel als Methoden vorbereitet
 * (lead, purchase, viewContent, completeRegistration, addToCart).
 * Sie sind DEFINIERT aber NICHT aktiv — nirgends aufgerufen. Zum
 * Aktivieren später an der passenden Stelle z. B.:
 *   TLPixel.lead({ value: 259, currency: 'EUR' }, TLPixel.newEventId());
 * Conversion API (CAPI): TLPixel.newEventId() erzeugt eine eventId
 * für die Server-seitige Deduplizierung (dieselbe id an CAPI senden).
 * ============================================================ */
(function () {
  'use strict';

  /* ── EINZIGE KONFIGURATION ──────────────────────────────── */
  var META_PIXEL_ID = '2277440786332273';
  var CONSENT_KEY = 'tl_marketing_consent'; // wird vom Consent-Banner gesetzt

  if (!META_PIXEL_ID || META_PIXEL_ID === 'DEINE_PIXEL_ID_HIER') {
    if (window.console && console.info) {
      console.info('[Meta Pixel] Noch keine Pixel-ID konfiguriert (js/meta-pixel.js).');
    }
    return;
  }

  var initialized = false; // Guard: verhindert Doppel-Init / doppelte Events

  /* Lädt den Pixel und feuert genau EINMAL PageView. */
  function loadPixel() {
    if (initialized) return;
    initialized = true;

    /* ── Offizieller Meta Pixel Base Code ───────────────────── */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    /* ── Init + PageView (einmalig, nach Zustimmung) ────────── */
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
  }

  function hasConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY) === 'granted'; }
    catch (e) { return false; }
  }

  /* Pixel bleibt inaktiv bis zur Zustimmung. */
  if (hasConsent()) {
    loadPixel();
  } else {
    window.addEventListener('tl-consent-granted', loadPixel, { once: true });
  }

  /* ── Öffentliche API ──────────────────────────────────────── */
  window.TLPixel = {
    /* Consent (vom Banner aufgerufen) */
    grantConsent: function () {
      try { window.localStorage.setItem(CONSENT_KEY, 'granted'); } catch (e) {}
      loadPixel();
    },
    revokeConsent: function () {
      try { window.localStorage.setItem(CONSENT_KEY, 'denied'); } catch (e) {}
      // fbevents wird erst beim nächsten Seitenaufruf ohne Consent nicht geladen.
    },
    consentStatus: function () {
      try { return window.localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
    },
    ready: function () { return typeof window.fbq === 'function'; },

    /* Generische Tracker (Basis für alles Weitere) */
    track: function (event, params, eventId) {
      if (!window.fbq) return;
      if (eventId) fbq('track', event, params || {}, { eventID: eventId });
      else fbq('track', event, params || {});
    },
    trackCustom: function (event, params, eventId) {
      if (!window.fbq) return;
      if (eventId) fbq('trackCustom', event, params || {}, { eventID: eventId });
      else fbq('trackCustom', event, params || {});
    },

    /* ── P4: Standard-Events VORBEREITET, aber NICHT aktiv ──────
       Nirgends aufgerufen. Später an der richtigen Stelle nutzen. */
    lead: function (params, eventId) { this.track('Lead', params, eventId); },
    purchase: function (params, eventId) { this.track('Purchase', params, eventId); }, // {value, currency}
    viewContent: function (params, eventId) { this.track('ViewContent', params, eventId); },
    completeRegistration: function (params, eventId) { this.track('CompleteRegistration', params, eventId); },
    addToCart: function (params, eventId) { this.track('AddToCart', params, eventId); },

    /* CAPI-Deduplizierung: dieselbe eventId an Pixel UND Conversion API senden. */
    newEventId: function () {
      return 'tl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    }
  };

  /* SPA-Hinweis: MPA → PageView feuert pro echtem Seitenaufruf einmal. */
})();
