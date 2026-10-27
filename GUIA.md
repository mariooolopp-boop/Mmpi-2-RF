# MMPI-2-RF · App PWA — Guía para dejarla funcional

La app tiene dos partes:

1. **La app (esta carpeta)** → se sube a GitHub y se publica con **GitHub Pages** (gratis).
2. **Firebase (gratis)** → guarda los enlaces únicos y las respuestas. GitHub Pages solo sirve archivos estáticos, por eso se necesita
   una base de datos para que la persona evaluada responda desde su teléfono y tú veas el resultado en el tuyo.

> Mientras no configures Firebase, la app abre en **modo local de pruebas** (los enlaces solo funcionan en el mismo navegador).

---

## Paso 1 · Crear el proyecto en Firebase (≈10 min)

1. Entra a <https://console.firebase.google.com> con tu cuenta de Google → **Agregar proyecto** (ponle un nombre; puedes desactivar Google Analytics).
2. **Compilación → Authentication → Comenzar → Método de acceso → Correo electrónico/contraseña → Habilitar → Guardar.**
3. En **Authentication → Users → Agregar usuario**:
   - Correo: `manu@mmpi-app.com`  (es un correo interno; no necesita existir)
   - Contraseña: `carem2412`
   En la app entrarás escribiendo solo el usuario **manu** y esa contraseña.
4. **Compilación → Firestore Database → Crear base de datos** → modo **producción** → elige una ubicación.
5. En Firestore → pestaña **Reglas** → borra lo que hay, pega el contenido del archivo `firestore.rules` de esta carpeta → **Publicar**.
   (Estas reglas hacen que el evaluado solo pueda enviar sus respuestas una vez y nunca leerlas, y que solo tú veas los resultados.)
6. **Configuración del proyecto (⚙️) → Tus apps → icono web `</>`** → registra la app → copia el bloque `firebaseConfig`.
7. Abre `js/config.js` y reemplaza `export const FIREBASE_CONFIG = null;` por tu bloque:

```js
export const FIREBASE_CONFIG = {
  apiKey: "…", authDomain: "…", projectId: "…",
  storageBucket: "…", messagingSenderId: "…", appId: "…"
};
```
(La `apiKey` de Firebase web no es secreta; la seguridad la dan las reglas del paso 5.)

## Paso 2 · Subir a GitHub y publicar

1. Crea un repositorio en <https://github.com/new> (puede ser público; si quieres privado, GitHub Pages en repos privados requiere plan de pago).
2. Sube **todo el contenido de esta carpeta** a la raíz del repositorio (botón *Add file → Upload files*, arrastrando los archivos y carpetas `css`, `js`, `icons`, etc.).
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / carpeta `/ (root)` → Save.**
4. En 1–2 minutos tu app queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.
5. En Firebase → **Authentication → Settings → Authorized domains** → agrega `TU-USUARIO.github.io`.

## Paso 3 · Uso

- Abre la URL de tu app → usuario **manu** / contraseña **carem2412**.
- **Crear enlace único** → Copiar → envíalo a la persona. Puede responder desde su celular.
- Al terminar ve únicamente: *“Sus respuestas han sido enviadas para su interpretación”* y el enlace queda cerrado (si lo vuelve a abrir verá que ya fue utilizado).
- En tu panel el registro pasa a **Respondido** → **Ver resultado** → **Descargar PDF**.
- Instalar como app: en el celular, menú del navegador → *Agregar a pantalla de inicio / Instalar app*.

## Qué contiene el PDF

Datos del evaluado · Perfil (PD, T y gráficas de barras por grupo de escalas, zona naranja T ≥ 65) · Tablas de puntuación natural y transformada (T) ·
Las 338 respuestas en V/F.

## Cómo se califica

Los archivos `js/model.js` (reactivos, claves de cada escala y tablas de conversión a T) se generaron **directamente de tu Excel** y `js/scoring.js`
replica sus fórmulas (incluidas INVAR-r e INVER-r). Se comparó contra el Excel recalculado con 6 casos distintos y las 51 escalas coincidieron al 100 %.

## Notas

- Cambiar usuario o contraseña: en Firebase → Authentication → Users (la contraseña NO está escrita en el código cuando usas Firebase).
- Si cambias archivos después de publicar y no ves el cambio, cierra y vuelve a abrir la app (el service worker actualiza la copia en la siguiente visita).
- Los datos de las personas evaluadas son sensibles: no compartas el enlace del panel, usa una contraseña robusta y elimina los registros que ya no necesites.
