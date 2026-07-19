/* ============================================================
 * Transform·Lab — TikTok Pixel (Base + Consent-Gating)
 * ------------------------------------------------------------
 * Gleiche Logik wie js/meta-pixel.js: der Pixel bleibt INAKTIV,
 * bis der Nutzer Marketing-Cookies über das Consent-Banner
 * (js/consent.js) akzeptiert. Das Banner ruft
 * window.TTPixel.grantConsent() auf. Erst dann wird der Pixel
 * geladen und PageView gefeuert — genau EINMAL pro Seitenaufruf.
 *
 * Bei Ablehnung: nichts wird geladen, keine Events.
 * Bei Widerruf: ttq.revokeConsent() stoppt das Tracking.
 *
 * Pixel-ID ändern: nur TIKTOK_PIXEL_ID unten.
 * ============================================================ */
(function () {
  'use strict';

  /* ── EINZIGE KONFIGURATION ──────────────────────────────── */
  var TIKTOK_PIXEL_ID = 'D9EBFJBC77U852QMA4RG';
  var CONSENT_KEY = 'tl_marketing_consent'; // gemeinsam mit Meta Pixel / Consent-Banner

  /* ── Offizieller TikTok-Stub (definiert window.ttq, lädt aber NICHT) ── */
  !function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = w[t] = w[t] || [];
    ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
    ttq.setAndDefer = function (t, e) {
      t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e, n) {
      var r = "https://analytics.tiktok.com/i18n/pixel/events.js", o = n && n.partner;
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r;
      ttq._t = ttq._t || {}; ttq._t[e] = +new Date;
      ttq._o = ttq._o || {}; ttq._o[e] = n || {};
      n = d.createElement("script"); n.type = "text/javascript"; n.async = true;
      n.src = r + "?sdkid=" + e + "&lib=" + t;
      e = d.getElementsByTagName("script")[0]; e.parentNode.insertBefore(n, e);
    };
  }(window, document, "ttq");

  var initialized = false; // Guard: verhindert Doppel-Init / doppelte Events

  /* Lädt den Pixel und feuert genau EINMAL PageView. */
  function loadPixel() {
    if (initialized) return;
    initialized = true;
    window.ttq.load(TIKTOK_PIXEL_ID);
    window.ttq.page();
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

  /* ── Öffentliche API (analog zu TLPixel / Meta) ───────────── */
  window.TTPixel = {
    grantConsent: function () {
      try { window.localStorage.setItem(CONSENT_KEY, 'granted'); } catch (e) {}
      loadPixel();
      if (window.ttq && typeof window.ttq.grantConsent === 'function') {
        try { window.ttq.grantConsent(); } catch (e) {}
      }
    },
    revokeConsent: function () {
      try { window.localStorage.setItem(CONSENT_KEY, 'denied'); } catch (e) {}
      if (window.ttq && typeof window.ttq.revokeConsent === 'function') {
        try { window.ttq.revokeConsent(); } catch (e) {}
      }
    },
    consentStatus: function () {
      try { return window.localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
    },
    ready: function () {
      return !!(window.ttq && window.ttq._i && window.ttq._i[TIKTOK_PIXEL_ID]);
    }
  };
})();
