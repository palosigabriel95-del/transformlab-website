/* ============================================================
 * Transform·Lab — Meta Pixel (Base + Consent-Gating)
 * ------------------------------------------------------------
 * Der Pixel bleibt INAKTIV, bis der Nutzer Marketing-Cookies
 * über das Consent-Banner akzeptiert. Das Banner ruft dazu
 * window.TLPixel.grantConsent() auf (oder feuert das Event
 * "tl-consent-granted"). Erst dann werden Pixel geladen und
 * PageView gefeuert — genau EINMAL pro Seitenaufruf.
 *
 * Zum Ändern der Pixel-ID nur META_PIXEL_ID unten anpassen.
 * Enthält KEINE Conversion-Events (kommen später). window.TLPixel
 * ist für Custom-Events + Conversion API (eventID) vorbereitet.
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

  /* Zustimmung wurde bereits (bei einem früheren Besuch) erteilt? */
  function hasConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY) === 'granted'; }
    catch (e) { return false; }
  }

  /* Pixel bleibt inaktiv bis zur Zustimmung:
     - schon zugestimmt  → sofort laden
     - noch nicht        → auf das Banner-Event warten */
  if (hasConsent()) {
    loadPixel();
  } else {
    window.addEventListener('tl-consent-granted', loadPixel, { once: true });
  }

  /* ── Öffentliche API ────────────────────────────────────────
     Das Consent-Banner ruft TLPixel.grantConsent() auf, sobald der
     Nutzer Marketing-Cookies akzeptiert. Custom-Events später via
     TLPixel.track(...) — eventId optional für Conversion-API-Dedup. */
  window.TLPixel = {
    grantConsent: function () {
      try { window.localStorage.setItem(CONSENT_KEY, 'granted'); } catch (e) {}
      loadPixel();
    },
    revokeConsent: function () {
      try { window.localStorage.setItem(CONSENT_KEY, 'denied'); } catch (e) {}
    },
    ready: function () { return typeof window.fbq === 'function'; },
    track: function (event, params, eventId) {
      if (!window.fbq) return;
      if (eventId) fbq('track', event, params || {}, { eventID: eventId });
      else fbq('track', event, params || {});
    },
    trackCustom: function (event, params, eventId) {
      if (!window.fbq) return;
      if (eventId) fbq('trackCustom', event, params || {}, { eventID: eventId });
      else fbq('trackCustom', event, params || {});
    }
  };

  /* SPA-Hinweis: MPA → PageView feuert pro echtem Seitenaufruf einmal.
     Bei späterem Client-Routing pro Routenwechsel TLPixel.track('PageView'). */
})();
