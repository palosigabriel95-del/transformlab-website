# CLAUDE.md — Transform·Lab

Guía para cualquier sesión de Claude Code que trabaje en este proyecto.

---

## 1. Objetivo del proyecto

**Transform·Lab** (https://www.transform-lab.de) es un servicio alemán de transformación corporal.
Dos productos:

| Plan | Precio | Qué es |
|---|---|---|
| **Nur Plan** | 139 € | Plan personalizado de nutrición + entrenamiento (PDF). |
| **Challenge mit Kaution** | 259 € | 60 € programa + **199 € de fianza reembolsable**. El cliente recupera la fianza semana a semana si cumple sus check-ins/progreso. |

La web capta clientes; el resto (alta, planes, pagos, check-ins, devoluciones) está **automatizado en Make.com**.

Idioma de cara al usuario: **alemán**. Idioma de trabajo con Gabriel: **español**.

---

## 2. Arquitectura y tecnologías

- **Web:** sitio **estático MPA** (9 páginas HTML). **Sin build, sin npm, sin framework.** Se edita HTML/CSS/JS a mano.
- **Hosting:** **GitHub Pages** (servido vía Fastly). ⚠️ **Cloudflare es SOLO DNS** (no proxy) → no hay CDN ni cabeceras de seguridad de Cloudflare. GitHub Pages **no permite cabeceras HTTP personalizadas** (sin CSP/HSTS; `Cache-Control` fijo en 600 s).
- **Analítica:** **Plausible** (cookieless, no requiere consentimiento).
- **Meta Pixel:** `js/meta-pixel.js`, **bloqueado tras consentimiento** (ver §6).
- **Consentimiento:** `js/consent.js` (banner DSGVO propio).
- **Automatización:** **Make.com** (~19 escenarios). Es el cerebro del negocio.
- **Base de datos:** **Airtable** (base `appCdjFJ21sjx7ngD`, tabla Clientes `tbl9fJKvuZVkd2u7T`).
- **Pagos/devoluciones:** **Stripe** (clave **LIVE** — dinero real).
- **IA (planes):** **OpenAI `gpt-4o`** desde Make.
- **PDFs:** API `html2pdf.app`.
- **Email:** SMTP **Zoho** (`hallo@transform-lab.de`).

---

## 3. Estructura de carpetas

```
/                       ← raíz del repo (GitHub Pages sirve desde aquí)
├── index.html          ← landing principal (formulario, reseñas, precios)
├── anmeldung-kaution.html  ← formulario detallado (Kaution, "Schritt 2")
├── danke.html · danke-plan.html   ← páginas de gracias
├── agb.html · impressum.html · datenschutz.html · widerruf.html  ← legales
├── ueber-uns.html
├── css/styles.css      ← TODO el CSS (un único archivo)
├── js/
│   ├── main.js         ← formularios, selector de plan, reseñas
│   ├── meta-pixel.js   ← Meta Pixel (gated por consentimiento)
│   └── consent.js      ← banner de cookies
├── assets/             ← imágenes (webp + png fallback), og-image, plantilla contrato
├── CNAME · robots.txt · sitemap.xml
└── CLAUDE.md · HANDOFF.md
```

**Las 9 páginas HTML cargan siempre:** `css/styles.css`, `js/meta-pixel.js`, `js/consent.js`.

---

## 4. Comandos

```bash
# Servidor local (usa .claude/launch.json → preview_start "website")
npx serve -l 3001 .

# Publicar: SIEMPRE a los DOS remotos
git add <archivos>
git commit -m "mensaje"
git push origin main
git push org main
```

- `origin` → `palosigabriel95-del/transformlab-website`
- `org` → `Transform-lab/transform-lab.github.io` (**el que sirve el dominio**)

**No hay tests automatizados.** La verificación se hace levantando el preview y comprobando en el navegador (consola sin errores + comportamiento).

---

## 5. Reglas de diseño y programación

- **Tema oscuro.** Colores: verde `#5c8f6e` (acento), dorado `#c9a870`, fondo `#0d1117`.
- **Nada de frameworks ni dependencias.** JS vanilla, CSS a mano.
- **Cache busting obligatorio:** al tocar `css/styles.css` o cualquier `js/*.js`, **subir el `?v=N`** en las 9 páginas. Si no, los usuarios siguen viendo la versión antigua.
- Los textos de cara al usuario van en **alemán**.
- Código modular y sin lógica de negocio incrustada en el pixel.
- Los formularios envían **JSON por `fetch`** a webhooks de Make.com.

---

## 6. Decisiones que NO se deben cambiar

1. **El Meta Pixel NO puede dispararse sin consentimiento.** `js/meta-pixel.js` solo carga tras `TLPixel.grantConsent()` (o flag `tl_marketing_consent = granted` en localStorage). Requisito legal (DSGVO). **Jamás quitar esa puerta.**
2. **PageView se dispara UNA sola vez** por carga (guard `initialized`). No duplicar eventos.
3. **Push SIEMPRE a los dos remotos** (`origin` y `org`).
4. **Nunca meter claves/secretos en el repo** (está verificado limpio, incluido el historial).
5. **Stripe es LIVE.** Ninguna operación de escritura (cobros, devoluciones) sin confirmación explícita de Gabriel, cada vez.
6. **El escenario de devoluciones (Make 6519958) se deja donde Gabriel lo ponga.** No encender/apagar sin su OK.
7. **Revisión humana antes de enviar planes al cliente** (decisión de producto: datos de salud).
8. **No inventar testimonios ni datos de la empresa.**

---

## 7. Errores frecuentes a evitar

**Web**
- Olvidar el `?v=N` → el cambio no llega a los usuarios.
- `<option>` de un `<select>` sin color explícito → **texto blanco sobre blanco** (ya arreglado con `select option { background:#fff; color:#1a1a1a; }` — no revertir).
- Suponer que Cloudflare hace de proxy: **no lo hace** (solo DNS).

**Make.com (API de blueprints)**
- `PATCH /api/v2/scenarios/{id}` exige `blueprint` y `scheduling` como **strings JSON**.
- Si el `record` de un módulo Airtable usa **IDs de campo** (`fldXXX`), `useColumnId` debe ser **`true`** — si no, `BundleValidationError` sin decir qué falla.
- `sort: [{}]` vacío en un Search de Airtable → error 422.
- El módulo **WebhookRespond debe ir en el flujo principal**, NO dentro de una ruta del router, o el webhook devuelve `"Accepted"` en vez del HTML.
- El **nº de operaciones** del log delata dónde se cortó el flujo.
- Los emails con botón HTML necesitan `contentType: "html"` y el contenido en el campo **`html`** (no en `text`), o Gmail muestra las etiquetas en crudo.

**OpenAI (generación de planes)**
- Los modelos **rechazan** peticiones que parecen consejo médico personalizado. Hay un **mensaje de sistema** en los módulos de IA que lo evita (encuadra como contenido fitness + descargo). **No quitarlo.**
- Los modelos de razonamiento (`o4-mini`) devuelven **vacío** al rechazar. Se usa **`gpt-4o`** (máx. 16384 tokens de salida).
