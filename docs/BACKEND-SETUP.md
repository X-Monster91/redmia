# Guía de Configuración Backend - REDMIA

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Netlify)                       │
│  HTML/CSS/JS estático + Funciones Serverless                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE (Backend)                          │
│  - PostgreSQL Database                                      │
│  - Authentication (Mesa Directiva)                          │
│  - File Storage (CVs, comprobantes)                         │
│  - Realtime Subscriptions                                   │
└─────────────────────────────────────────────────────────────┘
```

## Paso 1: Crear cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto:
   - Nombre: `redmia`
   - Password: (guárdalo en un lugar seguro)
   - Region: `US West` o la más cercana
3. Anota estos valores:
   - `Project URL`: `https://xxxxx.supabase.co`
   - `anon public key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `service_role key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Paso 2: Configurar la Base de Datos

1. En Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `docs/supabase-schema.sql`
3. Haz clic en **Run** para crear todas las tablas

## Paso 3: Crear Usuarios Admin (Mesa Directiva)

En el SQL Editor de Supabase, ejecuta:

```sql
-- Primero crear los usuarios en Auth
-- Ve a Authentication > Users > Add User

-- Ejemplo para cada miembro de la Mesa Directiva:
-- Email: diana.ramirez@universidad.mx
-- Password: (elige una contraseña segura)
-- Auto Confirm User: ✅ Marcado
-- Email Confirm: true

-- Luego insertar en admin_users
2. Obtener el UUID
Después de crear cada usuario, verás una tabla con los usuarios
Copia el UUID (columna id, ej: a1b2c3d4-e5f6-7890-abcd-ef1234567890)


3. Insertar en admin_users
Ve a SQL Editor (barra lateral)
Ejecuta este SQL reemplazando los UUIDs por los reales:


INSERT INTO admin_users (user_id, email, nombre, apellido, rol) VALUES
('UUID_DEL_USUARIO_1', 'diana.ramirez@universidad.mx', 'Diana Laura', 'Ramírez Sánchez', 'presidenta'),
('UUID_DEL_USUARIO_2', 'francisco.martinez@universidad.mx', 'Francisco', 'Martínez Cruz', 'secretario'),
('UUID_DEL_USUARIO_3', 'carlos.gonzalez@universidad.mx', 'Carlos', 'González López', 'tesorero'),
('UUID_DEL_USUARIO_4', 'ana.hernandez@universidad.mx', 'Ana', 'Hernández Torres', 'coordinadora'),
('UUID_DEL_USUARIO_5', 'roberto.sanchez@universidad.mx', 'Roberto', 'Sánchez Díaz', 'vocal');


--Tip: Puedes obtener los UUIDs con esta query después de crear los usuarios:
SELECT id, email FROM auth.users WHERE email IN (
  'diana.ramirez@universidad.mx',
  'francisco.martinez@universidad.mx',
  'carlos.gonzalez@universidad.mx',
  'ana.hernandez@universidad.mx',
  'roberto.sanchez@universidad.mx'
);


### Eliminar de `admin_users`

```sql
-- Por email
DELETE FROM admin_users WHERE email = 'diana.ramirez@universidad.mx';

-- Por UUID
DELETE FROM admin_users WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Eliminar también el usuario de Auth (opcional, requiere service_role key)
-- En SQL Editor no puedes borrar de auth.users directamente, ve a Authentication > Users > Delete
```

### Eliminar de `miembros`

```sql
-- Por email
DELETE FROM miembros WHERE email = 'juan.perez@universidad.mx';

-- Por UUID
DELETE FROM miembros WHERE id = 'uuid-del-miembro';

-- Por nombre (cuidado si hay duplicados)
DELETE FROM miembros WHERE nombre = 'Juan' AND apellido = 'Pérez';

-- Eliminar todos los inactivos
DELETE FROM miembros WHERE activo = false;
```

### Eliminar en cascada (si quieres borrar usuario + admin + auth)

```sql
-- 1. Primero borra de admin_users
DELETE FROM admin_users WHERE email = 'diana.ramirez@universidad.mx';

-- 2. Luego ve a Authentication > Users > busca el email > Delete user
```

### Desde el Dashboard (UI)

1. **admin_users**: Table Editor > `admin_users` > fila > ⋮ > Delete row
2. **miembros**: Table Editor > `miembros` > fila > ⋮ > Delete row
3. **Auth**: Authentication > Users > fila > ⋮ > Delete user

⚠️ **Nota**: Si borras de `auth.users` pero queda registro en `admin_users`, tendrás un registro huérfano (el `user_id` ya no existirá en `auth.users`).

## Paso 4: Configurar Netlify

### Variables de Entorno

1. En Netlify, ve a **Site settings > Environment variables**
2. Agrega:

| Variable | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIs...` (la service_role key) |

### Desplegar

1. Conecta tu repositorio de GitHub a Netlify
2. Configura:
   - Build command: (dejar vacío)
   - Publish directory: `.`
   - Functions directory: `netlify/functions`

## Paso 5: Configurar el Frontend

1. Abre `assets/js/auth.js`
2. Reemplaza these valores:

```javascript
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-ANON-KEY';
```

## Paso 6: Probar

1. Ve a `formulario.html` y envía una solicitud de prueba
2. Ve a `login.html` y haz login con las credenciales de la Mesa Directiva
3. En `admin.html` deberías ver la solicitud pendiente
4. Aprueba la solicitud y verifica que aparece en `miembros-activos.html`

## Funciones API Creadas

| Función | Endpoint | Método | Descripción |
|---------|----------|--------|-------------|
| `enviar-solicitud` | `/.netlify/functions/enviar-solicitud` | POST | Enviar solicitud de membresía |
| `get-solicitudes` | `/.netlify/functions/get-solicitudes` | GET | Obtener solicitudes (admin) |
| `procesar-solicitud` | `/.netlify/functions/procesar-solicitud` | POST | Aprobar/rechazar solicitud |
| `get-miembros` | `/.netlify/functions/get-miembros` | GET | Obtener miembros activos |
| `login` | `/.netlify/functions/login` | POST | Autenticación |

## Seguridad

1. **RLS habilitado**: Los datos solo son accesibles según las políticas definidas
2. **Service Key**: Solo se usa en funciones serverless (nunca en frontend)
3. **CORS**: Configurado para permitir solo tu dominio
4. **Auth**: Mesa Directiva autenticada via Supabase Auth

## Almacenamiento de Archivos

Para CVs y comprobantes de pago:

1. En Supabase, ve a **Storage**
2. Crea un bucket llamado `documentos`
3. Configura las políticas:

```sql
-- Anyone can upload
CREATE POLICY "Cualquiera puede subir documentos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documentos');

-- Only authenticated can view
CREATE POLICY "Admin puede ver documentos" ON storage.objects
  FOR SELECT USING (bucket_id = 'documentos' AND auth.role() = 'authenticated');
```

## Solución de Problemas

| Problema | Solución |
|----------|----------|
| "Function not found" | Verifica que `netlify.toml` está en la raíz |
| "CORS error" | Agrega tu dominio en Supabase > Settings > API |
| "Permission denied" | Verifica que RLS policies están configuradas |
| "User not found" | Crea el usuario en Auth primero, luego en admin_users |

## Siguientes Pasos

1. [ ] Configurar dominio personalizado en Netlify
2. [ ] Agregar SSL (automático en Netlify)
3. [ ] Configurar copias de seguridad de Supabase
4. [ ] Agregar monitoreo de errores
5. [ ] Implementar notificaciones por email
