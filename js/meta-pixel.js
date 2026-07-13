/* ============================================================
 * Transform·Lab — Meta Pixel (Base-Implementierung)
 * ------------------------------------------------------------
 * NUR DIESE EINE ZEILE ÄNDERN, um den Pixel zu aktivieren:
 *   → META_PIXEL_ID unten mit deiner echten Pixel-ID ersetzen.
 *
 * Lädt den Meta Pixel global auf jeder Seite und feuert
 * automatisch ein PageView. Enthält KEINE Geschäftslogik und
 * KEINE Conversion-Events (die kommen später separat).
 *
 * Für zukünftige Custom-Events steht window.TLPixel bereit
 * (siehe unten) — vorbereitet für die Conversion API (eventID
 * für Deduplizierung wird unterstützt).
 * ============================================================ */
(function () {
  'use strict';

  /* ── EINZIGE KONFIGURATION ──────────────────────────────── */
  var META_PIXEL_ID = 'DEINE_PIXEL_ID_HIER'; // z. B. '123456789012345'

  /* Wenn keine echte ID gesetzt ist, wird nichts geladen
     (so schlägt die Seite auf Live nicht mit einem Dummy-Pixel an). */
  if (!META_PIXEL_ID || META_PIXEL_ID === 'DEINE_PIXEL_ID_HIER') {
    if (window.console && console.info) {
      console.info('[Meta Pixel] Noch keine Pixel-ID konfiguriert (js/meta-pixel.js).');
    }
    return;
  }

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

  /* ── Init + PageView (feuert bei jedem Seitenaufruf) ────── */
  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');

  /* ── SPA-Unterstützung ──────────────────────────────────────
     Diese Website ist eine MPA (klassische Seiten), daher feuert
     PageView bei jedem echten Seitenwechsel automatisch. Sollte
     später eine SPA/Client-Routing dazukommen, hier bei jedem
     Routenwechsel TLPixel.track('PageView') aufrufen. */

  /* ── Öffentlicher Helper für spätere Custom-Events ──────────
     Verwendung später z. B.:
       TLPixel.track('Lead', { value: 259, currency: 'EUR' }, eventId);
     eventId ist optional und dient der Conversion-API-Deduplizierung. */
  window.TLPixel = {
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
})();
