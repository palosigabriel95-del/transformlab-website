# HANDOFF.md — Estado del proyecto

**Fecha:** 14/07/2026 · **Último commit:** `79274fb` (Fix invisible dropdown option text)
**Repo:** limpio. Todo el código web está commiteado y pusheado a `origin` y `org`.
(Solo hay cambios locales sin commitear en `.claude/` — configuración, no es código.)

---

## 1. Estado actual exacto

La **web está terminada y en producción**. El bloqueo real para lanzar está en **Make.com**: el flujo que entrega los PDFs al cliente tras el pago **todavía no funciona end-to-end** y **falta rediseñarlo** para que incluya revisión humana.

---

## 2. Funcionalidades TERMINADAS y verificadas

**Web (todo en producción):**
- 9 páginas HTML, tema oscuro, responsive.
- Formularios (alta inicial + formulario detallado Kaution) enviando a Make.com.
- Formulario de reseñas → webhook Make → email a `hallo@transform-lab.de`.
- **Meta Pixel** (ID `2277440786332273`) con **puerta de consentimiento**: inactivo hasta aceptar Marketing. PageView una sola vez, sin duplicados. Verificado en navegador.
- **Banner de consentimiento DSGVO** (`js/consent.js`): Aceptar/Rechazar, persistente, reabrible.
- **Eventos futuros preparados pero INACTIVOS** en `TLPixel`: `lead`, `purchase`, `viewContent`, `completeRegistration`, `addToCart` + `newEventId()` (para deduplicación de Conversion API). Ninguno se llama en el código.
- Dominio verificado en Meta (TXT en Cloudflare) ✅.
- Auditoría técnica y de seguridad hecha (sin secretos en el repo ni en el historial).

**Make.com (19 escenarios):**
- Alta Nur Plan y Kaution (Paso 1 + Schritt 2) — verificados E2E.
- Check-ins semanales: reset domingo (Paso 5) + recordatorios lunes (Paso 6/7) — arreglados y verificados; los 3 emails llevan botón verde que **renderiza** correctamente.
- Aprobación de check-in con **1 clic** (escenario 6544668): botones ✅/❌ en el email de notificación, página de confirmación HTML. Verificado.
- Escenario de reseñas (6533763) — verificado E2E.

**Google Drive:**
- Sistema documental creado vía API: **13 carpetas top + 102 subcarpetas + 18 docs + 2 hojas**. El "Marketing Playbook" existente se renombró a **"Transform·Lab Operating System"** conservando su contenido.

---

## 3. Errores YA solucionados en esta conversación

| Error | Solución |
|---|---|
| Kaution Schritt 2 fallaba (`BundleValidationError`) | `useColumnId: true` en el módulo Airtable con IDs de campo. |
| Paso 5/6/7 fallaban | Filtro "Email vorhanden" + `useColumnId`. |
| Emails de check-in mostraban HTML en crudo | `contentType: "html"` + contenido en el campo `html` (no `text`). |
| El contrato PDF se generaba pero NO se adjuntaba al email | Añadido `{{12.data}}` como adjunto. |
| Página de confirmación del botón salía como `"Accepted"` | `WebhookRespond` movido al **flujo principal** (fuera de las rutas del router). |
| Formulario de reseñas no guardaba nada | Conectado a un webhook de Make. |
| **La IA rechazaba generar los planes** ("I'm sorry, but I can't provide a document…") | **Mensaje de sistema** en los módulos IA: encuadra como contenido fitness (no consejo médico) + descargo legal + "no rechaces nunca". |
| `o4-mini` devolvía vacío | Cambiado a **`gpt-4o`** (max_tokens 16384). |
| Recetas podían repetirse entre semanas 1-4 y 5-8 | nut2 ahora **ve la salida de nut1** y tiene orden de no repetir. |
| Texto invisible en el desplegable de plan (blanco sobre blanco) | `select option { background:#fff; color:#1a1a1a; }` + cache v=42. |

---

## 4. Cambios NO comprobados todavía ⚠️

1. **El plan mostraba "12 Wochen"** aunque el registro de prueba tiene **6 semanas**. **Sin verificar** si es (a) el dato del registro o (b) la IA que ignora `{{3.Programmdauer}}`. Se estaba creando un escenario de comprobación cuando se interrumpió.
2. **El escenario real "Kaution – Nach Zahlung" (6519677) NUNCA se ha ejecutado** (0 en su historial). Solo se ha probado en copias temporales.
3. El detalle de los planes generados: la IA no puede meter las 14 recetas/semana completas en una sola llamada. Pendiente decidir si el borrador actual basta o hay que partir en trozos más pequeños.

**Escenarios temporales de prueba PENDIENTES DE BORRAR en Make:**
`6552156`, `6556247` (DIAG), `6556767` (DIAG no-repeat) — y sus hooks.

---

## 5. Problema en el que estamos trabajando

**Entrega de los PDFs tras el pago.** Estado:
- La IA **ya genera** los planes (rechazo arreglado) ✅
- **No se ha verificado** que respete la duración del cliente (lo de "12 Wochen") ⚠️
- **Falta rediseñar el flujo** para que NO se envíe automáticamente al cliente.

---

## 6. Decisión IMPORTANTE tomada en esta conversación

**Los planes NO se enviarán automáticamente al cliente tras el pago.** Flujo acordado con Gabriel:

```
Cliente paga → se generan los PDFs → llegan a GABRIEL para revisar
→ Gabriel revisa → con 1 clic (o reenviando el email) se envían al cliente
```

Motivo: son **datos de salud**; enviar planes generados por IA sin revisión humana es arriesgado (legal y de calidad).

Se propusieron 2 opciones (**pendiente que Gabriel elija**):
- **Simple (recomendada):** los PDFs llegan a `hallo@transform-lab.de`; Gabriel los revisa y **reenvía** el email al cliente. Sin montaje extra.
- **Botón:** botón real "Enviar al cliente". Requiere **guardar los PDFs** (Drive) + un escenario nuevo. Más trabajo.

---

## 7. SIGUIENTE PASO CONCRETO

Gabriel acaba de enviar contenido de marketing para meter en el **Google Drive**:
- **Big Ideas 001, 002, 003**
- **TL-0001 a TL-0006** (hook + guion + storyboard + prompts de imagen/vídeo + copy de Meta Ads)
- (Antes envió una lista de hooks TL-0001..TL-0010, más simple)

**Antes de escribir nada, hay que resolver 2 conflictos:**

1. **La estructura que describe NO coincide con la que existe.** Él pide `02 - Marketing` con subcarpetas (`01 - Big Ideas`, `03 - Hooks`, `04 - Guiones`, `05 - Storyboards`, `06 - Prompts IA`, `07 - Meta Ads`). En el Drive existe **`02 - Estrategia y Marketing` SIN subcarpetas**. → **Verificar el Drive real y preguntarle** si quiere que se creen esas subcarpetas.

2. **Conflicto de numeración TL.** El envío nuevo redefine TL-0003..TL-0006 con hooks **distintos** a los de la lista anterior. → **Preguntarle cuál manda** antes de escribir.

**Después de esto:** volver a los PDFs (verificar "12 Wochen" + montar el flujo de revisión humana).

> ℹ️ Hay un **conector de Google Drive** disponible en la sesión (herramientas MCP), así que probablemente **ya no haga falta el token OAuth** que se usaba antes.
