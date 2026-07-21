# Esquema de Base de Datos - REDMIA (Supabase/PostgreSQL)

## Tabla: solicitudes
```sql
CREATE TABLE solicitudes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  institucion TEXT NOT NULL,
  cargo TEXT NOT NULL,
  grado TEXT NOT NULL CHECK (grado IN ('licenciatura', 'maestria', 'doctorado', 'postdoc')),
  especialidad TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('activo', 'estudiante')),
  eje TEXT NOT NULL CHECK (eje IN ('metodologias', 'docencia', 'etica', 'herramientas')),
  motivos TEXT NOT NULL,
  cv_url TEXT,
  comprobante_url TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'verificando')),
  notas_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Tabla: miembros
```sql
CREATE TABLE miembros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  institucion TEXT NOT NULL,
  cargo TEXT NOT NULL,
  grado TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('fundador', 'honorario', 'activo', 'estudiante', 'adherente')),
  eje TEXT NOT NULL CHECK (eje IN ('metodologias', 'docencia', 'etica', 'herramientas')),
  activo BOOLEAN DEFAULT true,
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Tabla: admin_users (Mesa Directiva)
```sql
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('presidente', 'secretario', 'tesorero', 'coordinador', 'vocal')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Tabla: notificaciones
```sql
CREATE TABLE notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('nueva_solicitud', 'solicitud_aprobada', 'solicitud_rechazada')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Políticas RLS (Row Level Security)

### Solicitudes
```sql
CREATE POLICY "Cualquiera puede enviar solicitudes" ON solicitudes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin puede ver todas las solicitudes" ON solicitudes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin puede actualizar solicitudes" ON solicitudes
  FOR UPDATE USING (auth.uid() IS NOT NULL);
```

### Miembros
```sql
CREATE POLICY "Miembros activos son públicos" ON miembros
  FOR SELECT USING (activo = true);

CREATE POLICY "Admin puede gestionar miembros" ON miembros
  FOR ALL USING (auth.uid() IS NOT NULL);
```

### Admin Users
```sql
CREATE POLICY "Admins pueden ver admin_users" ON admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Presidente puede gestionar admin_users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND rol = 'presidente'
    )
  );
```

## Funciones RPC

### Aprobar solicitud
```sql
CREATE OR REPLACE FUNCTION aprobar_solicitud(solicitud_id UUID)
RETURNS VOID AS $$
DECLARE
  sol RECORD;
BEGIN
  SELECT * INTO sol FROM solicitudes WHERE id = solicitud_id;

  INSERT INTO miembros (
    solicitud_id, nombre, apellido, email, telefono,
    institucion, cargo, grado, especialidad,
    categoria, eje, fecha_vencimiento
  ) VALUES (
    sol.id, sol.nombre, sol.apellido, sol.email, sol.telefono,
    sol.institucion, sol.cargo, sol.grado, sol.especialidad,
    CASE WHEN sol.categoria = 'activo' THEN 'activo' ELSE 'estudiante' END,
    sol.eje,
    CURRENT_DATE + INTERVAL '1 year'
  );

  UPDATE solicitudes
  SET estado = 'aprobado', updated_at = NOW()
  WHERE id = solicitud_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Rechazar solicitud
```sql
CREATE OR REPLACE FUNCTION rechazar_solicitud(solicitud_id UUID, notas TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE solicitudes
  SET estado = 'rechazado', notas_admin = notas, updated_at = NOW()
  WHERE id = solicitud_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Insertar usuarios admin
```sql
INSERT INTO admin_users (user_id, email, nombre, apellido, rol)
VALUES ('da721f57-58eb-43f3-a133-82ab575d5399', 'prueba01@gmail.com', 'Josue', 'David', 'presidente');

INSERT INTO admin_users (user_id, email, nombre, apellido, rol)
VALUES ('486bd6c1-029e-42ad-bc2b-aa3eeda69f23', 'prueba02@gmail.com', 'Josue', 'Briones', 'presidente');
```
