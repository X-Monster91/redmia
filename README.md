# REDMIA - Red de Investigadores en Inteligencia Artificial

Sitio web oficial de REDMIA, una red de investigación dedicada a fomentar la colaboración entre investigadores en el campo de la inteligencia artificial.

## Características

- **Página principal**: Información sobre la red y sus objetivos
- **Miembros**: Directorio de miembros activos con filtros y búsqueda
- **Membresía**: Formulario de solicitud con pago integrado
- **Panel administrativo**: Gestión de solicitudes y miembros
- **Autenticación**: Login seguro con Supabase
- **Pagos**: Integración con PayPal

## Tecnologías

- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- JavaScript (ES6+)
- Supabase (Backend as a Service)
- PayPal SDK

## Estructura del Proyecto

```
redmia/
├── index.html              # Página principal
├── miembros.html           # Directorio de miembros
├── membresia.html          # Formulario de membresía
├── login.html              # Inicio de sesión
├── admin.html              # Panel administrativo
├── contacto.html           # Página de contacto
├── assets/
│   ├── css/                # Estilos
│   ├── js/                 # JavaScript
│   └── img/                # Imágenes y videos
├── design-system/          # Sistema de diseño
└── docs/                   # Documentación
```

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/redmia.git
```

2. Abre `index.html` en tu navegador

## Configuración

Para configurar el proyecto, consulta la documentación en `docs/CONFIGURACION.md`.

### Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ejecuta los scripts SQL de la documentación
4. Actualiza las credenciales en `assets/js/auth.js`

### PayPal

1. Crea una cuenta en [developer.paypal.com](https://developer.paypal.com)
2. Obtén tu Client ID
3. Actualiza el script en `membresia.html`

### Netlify

1. Conecta tu repositorio a Netlify
2. Configura el directorio de publicación como `.` (raíz)
3. Configura tu dominio personalizado

## Desarrollo

El sitio está construido con HTML, CSS y JavaScript puro, sin frameworks externos. Esto facilita:

- Mantenimiento sencillo
- Hosting estático (Netlify)
- Carga rápida
- SEO optimizado

## Funcionalidades del Panel Administrativo

- Dashboard con estadísticas
- Aprobación/rechazo de solicitudes de membresía
- Gestión de miembros activos
- Configuración del sitio
- Gestión de la mesa directiva

## Pagos con PayPal

Los miembros pueden pagar su membresía directamente desde el formulario usando PayPal. El sistema soporta:

- Membresía Básica: $999 MXN/año
- Membresía Premium: $1,999 MXN/año

## Soporte

Para soporte, contacta a:
- Email: contacto@redmia.org
- Teléfono: +52 (800) 123-4567

## Licencia

© 2024 REDMIA. Todos los derechos reservados.
