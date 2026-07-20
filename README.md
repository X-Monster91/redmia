# REDMIA — Sitio web

Red de Investigaciones Multidisciplinarias con Inteligencia Artificial.
Sitio web estático (HTML/CSS/JS vanilla), listo para desplegar en Netlify.

---

## 📂 Estructura del proyecto

```
redmia/
├── index.html              # Inicio
├── quienes-somos.html      # Misión, visión, origen, ruta institucional
├── estatutos.html          # Marco normativo + índice (acordeón)
├── mesa-directiva.html     # Directorio (con placeholders editables)
├── coordinaciones.html     # 5 ejes temáticos
├── membresias.html         # 4 categorías de membresía
├── proyectos.html          # Proyectos de investigación
├── publicaciones.html      # Libro, Periódico Digital, memorias
├── noticias.html           # Noticias (convocatorias, logros, alianzas)
├── eventos.html            # Agenda de eventos
├── avisos.html             # Comunicados oficiales
├── aviso-privacidad.html   # Aviso de privacidad (LFPDPPP)
├── solicitar-ingreso.html  # Formulario de contacto (Netlify Forms)
├── gracias.html            # Confirmación tras enviar el formulario
├── 404.html                # Página de error
├── netlify.toml            # Config Netlify (seguridad + cache + 404)
├── assets/
│   ├── css/                # reset.css · styles.css · pages.css
│   ├── js/main.js          # Menú móvil, acordeón, año dinámico
│   ├── img/                # logo-mark.svg · favicon.svg
│   └── docs/               # (Aquí se colocan los PDFs descargables)
└── README.md               # Este archivo
```

---

## 🚀 Cómo publicar el sitio en Netlify (paso a paso)

### Opción A — Arrastrar y soltar (la más rápida)

1. **Comprime la carpeta** `redmia/` en un archivo `.zip` (o no, Netlify acepta carpetas).
2. Entra a [app.netlify.com](https://app.netlify.com) y crea una cuenta gratuita.
3. En el panel, ve a **Sites** → **Add new site** → **Deploy manually**.
4. **Arrastra la carpeta `redmia/`** (o el ZIP) a la zona indicada.
5. En segundos Netlify te dará una URL provisional tipo `https://redmia-abc123.netlify.app`.

### Opción B — Conectar con GitHub (recomendado para mantenimiento)

1. Sube la carpeta `redmia/` a un repositorio de GitHub.
2. En Netlify: **Add new site** → **Import an existing project** → **GitHub**.
3. Selecciona tu repositorio. Configuración:
   - **Build command:** _(dejar vacío)_
   - **Publish directory:** `.` (o la subcarpeta `redmia/` si está dentro del repo)
4. **Deploy**. Cada vez que hagas un `git push`, Netlify publicará automáticamente.

---

## 🌐 Conectar tu dominio de Hostinger a Netlify

Una vez que el sitio esté en Netlify con su URL provisional:

1. En Netlify entra a **Site settings → Domain management → Add a domain**.
2. Escribe tu dominio (ej. `redmia.org` o `midominio.com`) y haz clic en **Verify**.
3. Netlify te pedirá agregar registros DNS. Te mostrará algo como:
   - **Opción 1 (nameservers):** cambiar los nameservers de Hostinger por los de Netlify (`dns1.p01.nsone.net`, etc.).
   - **Opción 2 (registros, recomendada):** agregar estos registros en el panel DNS de Hostinger:
     ```
     Tipo   Nombre    Valor
     A      @         75.2.60.5   (IP que te dé Netlify)
     CNAME  www       tunombre.netlify.app
     ```
4. **Dónde hacerlo en Hostinger:** entra a [hpanel.hostinger.com](https://hpanel.hostinger.com) →
   tu dominio → **DNS / Nameservers** → **Manage DNS records**.
5. Guarda los cambios. La propagación DNS tarda entre **15 min y 24 h**.
6. Netlify **generará automáticamente el certificado SSL** (HTTPS) cuando detecte el dominio. No necesitas comprar SSL aparte.

> **Tip:** si solo quieres probar primero, puedes dejar el subdominio `redmia.netlify.app` gratis mientras decides el dominio.

---

## ✏️ Cómo editar el contenido

### Editar texto de una página
Abre el archivo `.html` correspondiente con cualquier editor (VS Code, Sublime, Bloc de notas).
Busca el texto entre etiquetas y modifícalo. Guarda y vuelve a subir a Netlify.

### Reemplazar los placeholders `[Por definir]`

Varias páginas tienen contenido marcado como **[Por definir]** (los envió la maestra Elena como pendientes):

| Página | Qué falta |
|---|---|
| `mesa-directiva.html` | Nombres, cargos, fotos y semblanzas de los 9 integrantes |
| `coordinaciones.html` | Nombres de los coordinadores de cada eje |
| `estatutos.html` | PDF final (tras revisión notarial) |
| `proyectos.html` / `eventos.html` / `noticias.html` | Contenido real según avance la red |

En `mesa-directiva.html` hay un comentario HTML que explica cómo reemplazar cada tarjeta-placeholder por una con foto real:

```html
<article class="card person-card">
  <img class="person-card__photo" src="assets/img/miembros/nombre.jpg" alt="Nombre Apellido">
  <h3 class="person-card__name">Nombre completo</h3>
  <p class="person-card__role">Cargo</p>
  <p class="person-card__inst">Institución de adscripción</p>
  <p class="person-card__bio">Semblanza breve (3-4 líneas)...</p>
</article>
```

### Agregar el PDF de Estatutos
1. Coloca el archivo PDF en `assets/docs/estatutos.pdf`.
2. En `estatutos.html`, busca el botón "Descargar PDF (próximamente)" y reemplázalo por:
   ```html
   <a href="assets/docs/estatutos.pdf" class="btn btn--primary btn--block" download>Descargar PDF</a>
   ```

### Cambiar el correo de contacto
Aparece como `contacto@redmia.org` en el footer de todas las páginas y en `solicitar-ingreso.html`, `aviso-privacidad.html` y `gracias.html`. Usa "Buscar y reemplazar" en tu editor sobre todo el proyecto.

### Cambiar el logo
Reemplaza `assets/img/logo-mark.svg` (manteniendo el mismo nombre) y `assets/img/favicon.svg`.

---

## 📨 Configurar el formulario de contacto

El formulario de `solicitar-ingreso.html` usa **Netlify Forms** (gratis, sin backend).

1. Tras el primer despliegue en Netlify, ve a **Site → Forms**.
2. Verás el formulario `solicitud-ingreso` detectado automáticamente.
3. En **Forms → Settings → Form notifications**, agrega el correo donde quieres recibir las solicitudes (ej. el de la maestra Elena).
4. Listo. Cada vez que alguien envíe el formulario, te llegará un correo y quedará registrado en el panel de Netlify.

> **Límite gratuito:** 100 envíos por mes. Suficiente para la fase actual.

---

## 🎨 Sistema de diseño (para referencia)

- **Tipografías:** Fraunces (títulos, serif) + Inter (texto, sans-serif), vía Google Fonts.
- **Colores** (en `assets/css/styles.css`, variables `:root`):
  - Primario: `#0F2A44` (azul medianoche)
  - Acento: `#C8924A` (ámbar/dorado)
  - Fondo: `#FBF8F3` (crema cálido)
- **Logo:** símbolo de nodos conectados (alude a "red" + IA) en `assets/img/logo-mark.svg`.

---

## 🛣️ Hoja de ruta (Fase 2)

Esta es la **Fase 1** (sitio informativo). El PDF original contempla una Fase 2 que incluye:

- [ ] Login para la Mesa Directiva y panel de administración
- [ ] Formulario completo de membresía con base de datos y subida de comprobantes
- [ ] Pago con tarjeta (Mercado Pago o Stripe) — requiere A.C. constituida
- [ ] Catálogo dinámico de miembros activos
- [ ] Validación de solicitudes desde el panel
- [ ] Copias de seguridad automatizadas (Netlify ya versiona vía Git)

Cuando llegue el momento, lo más sencillo es migrar a un CMS como WordPress (Hostinger lo ofrece) o desarrollar un backend a medida.

---

## ⚖️ Notas legales importantes

- **Estatutos** y **Aviso de privacidad** deben revisarse con notario/abogado antes de su publicación definitiva. Están marcados con avisos visibles en el sitio.
- El aviso de privacidad refleja el **marco legal vigente** (LFPDPPP de marzo 2025, supervisada por la Secretaría Anticorrupción y Buen Gobierno — ya no el INAI).
- El cobro de membresías con tarjeta requiere que REDMIA esté constituida como Asociación Civil; por eso el ingreso en esta fase es sin cuota.

---

## ❓ Ayuda rápida

| Quiero... | Haz esto |
|---|---|
| Ver el sitio localmente | Abre `index.html` en tu navegador, o ejecuta `python3 -m http.server` dentro de la carpeta |
| Cambiar un texto | Edita el `.html` correspondiente |
| Cambiar colores | Edita las variables en `assets/css/styles.css` (`:root`) |
| Actualizar el año del footer | Es automático vía JS (no necesitas editar nada) |
| Recibir los formularios | Configura el correo en Netlify → Forms → Settings |

---

_Sitio desarrollado para REDMIA · Red de Investigaciones Multidisciplinarias con Inteligencia Artificial · Torreón, Coahuila, México._
