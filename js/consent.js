/* ============================================================
 * Transform·Lab — Cookie-Consent (Marketing)
 * ------------------------------------------------------------
 * Technische Consent-Verwaltung nach DSGVO. Notwendige Cookies
 * und Plausible (cookieless) laufen immer; MARKETING (Meta Pixel)
 * nur nach ausdrücklicher Zustimmung.
 *
 * - Zeigt das Banner nur, wenn noch keine Entscheidung vorliegt.
 * - "Akzeptieren"  → TLPixel.grantConsent()  (Pixel lädt)
 * - "Ablehnen"     → TLPixel.revokeConsent()  (Pixel bleibt aus)
 * - Entscheidung wird in localStorage gespeichert.
 * - Jederzeit änderbar: Link "Cookie-Einstellungen" (unten links)
 *   oder window.TLConsent.open().
 * ============================================================ */
(function () {
  'use strict';
  var KEY = 'tl_marketing_consent';
  var GREEN = '#5c8f6e';

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function apply(granted) {
    if (!window.TLPixel) return;
    if (granted) window.TLPixel.grantConsent();
    else window.TLPixel.revokeConsent();
  }

  function el(id) { return document.getElementById(id); }
  function closeBanner() { var b = el('tl-consent'); if (b && b.parentNode) b.parentNode.removeChild(b); }

  function renderBanner() {
    if (el('tl-consent')) return;
    var w = document.createElement('div');
    w.id = 'tl-consent';
    w.setAttribute('role', 'dialog');
    w.setAttribute('aria-label', 'Cookie-Einstellungen');
    w.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#0d1117;color:#e6e6e6;' +
      'border-top:2px solid ' + GREEN + ';padding:18px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;box-shadow:0 -4px 24px rgba(0,0,0,.4)';
    w.innerHTML =
      '<div style="max-width:1000px;margin:0 auto;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between">' +
        '<div style="flex:1;min-width:260px">Wir verwenden notwendige Cookies für den Betrieb der Seite. ' +
        'Mit deiner Zustimmung setzen wir zusätzlich <b>Marketing-Cookies (Meta Pixel)</b>, um unsere Werbung zu verbessern. ' +
        'Mehr dazu in der <a href="datenschutz.html" style="color:' + GREEN + ';text-decoration:underline">Datenschutzerklärung</a>. ' +
        'Du kannst deine Wahl jederzeit ändern.</div>' +
        '<div style="display:flex;gap:10px;flex-shrink:0">' +
          '<button id="tl-c-reject" type="button" style="cursor:pointer;background:transparent;color:#e6e6e6;border:1px solid #555;border-radius:6px;padding:10px 18px;font-size:14px;font-family:inherit">Ablehnen</button>' +
          '<button id="tl-c-accept" type="button" style="cursor:pointer;background:' + GREEN + ';color:#fff;border:none;border-radius:6px;padding:10px 18px;font-size:14px;font-weight:600;font-family:inherit">Akzeptieren</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(w);
    el('tl-c-accept').addEventListener('click', function () { set('granted'); apply(true); closeBanner(); });
    el('tl-c-reject').addEventListener('click', function () { set('denied'); apply(false); closeBanner(); });
  }

  /* Dezenter Dauer-Link, um die Zustimmung jederzeit zu ändern (DSGVO). */
  function renderReopenLink() {
    if (el('tl-consent-reopen')) return;
    var a = document.createElement('button');
    a.id = 'tl-consent-reopen';
    a.type = 'button';
    a.textContent = 'Cookie-Einstellungen';
    a.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99998;background:rgba(13,17,23,.85);color:#9aa;' +
      'border:1px solid #333;border-radius:6px;padding:6px 10px;font:12px Arial,sans-serif;cursor:pointer;opacity:.7';
    a.addEventListener('click', function () { renderBanner(); });
    document.body.appendChild(a);
  }

  window.TLConsent = {
    open: renderBanner,
    accept: function () { set('granted'); apply(true); closeBanner(); },
    reject: function () { set('denied'); apply(false); closeBanner(); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} renderBanner(); },
    status: function () { return get(); }
  };

  function init() {
    renderReopenLink();
    if (!get()) renderBanner(); // nur beim ersten Besuch / ohne Entscheidung
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
