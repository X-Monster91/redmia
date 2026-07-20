# Esquema de Base de Datos - REDMIA (Supabase/PostgreSQL)

## Tabla: solicitudes
```sql
CREATE TABLE solicitudes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Datos personales
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  -- Datos académicos
  institucion TEXT NOT NULL,
  cargo TEXT NOT NULL,
  grado TEXT NOT NULL CHECK (grado IN ('licenciatura', 'maestria', 'doctorado', 'postdoc')),
  especialidad TEXT NOT NULL,
  -- Membresía
  categoria TEXT NOT NULL CHECK (categoria IN ('activo', 'estudiante')),
  eje TEXT NOT NULL CHECK (eje IN ('metodologias', 'docencia', 'etica', 'herramientas')),
  motivos TEXT NOT NULL,
  -- Archivos
  cv_url TEXT,
  comprobante_url TEXT,
  -- Estado
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'verificando')),
  notas_admin TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Tabla: miembros
```sql
CREATE TABLE miembros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE SET NULL,
  -- Datos personales
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  -- Datos académicos
  institucion TEXT NOT NULL,
  cargo TEXT NOT NULL,
  grado TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  -- Membresía
  categoria TEXT NOT NULL CHECK (categoria IN ('fundador', 'honorario', 'activo', 'estudiante', 'adherente')),
  eje TEXT NOT NULL CHECK (eje IN ('metodologias', 'docencia', 'etica', 'herramientas')),
  -- Estado
  activo BOOLEAN DEFAULT true,
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  -- Timestamps
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
  rol TEXT NOT NULL CHECK (rol IN ('presidenta', 'secretario', 'tesorero', 'coordinadora', 'vocal')),
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
-- Anyone can insert (submit a request)
CREATE POLICY "Cualquiera puede enviar solicitudes" ON solicitudes
  FOR INSERT WITH CHECK (true);

-- Only authenticated admin can view all
CREATE POLICY "Admin puede ver todas las solicitudes" ON solicitudes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated admin can update
CREATE POLICY "Admin puede actualizar solicitudes" ON solicitudes
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### Miembros
```sql
-- Anyone can view active members (public directory)
CREATE POLICY "Miembros activos son públicos" ON miembros
  FOR SELECT USING (activo = true);

-- Only authenticated admin can manage members
CREATE POLICY "Admin puede gestionar miembros" ON miembros
  FOR ALL USING (auth.role() = 'authenticated');
```

### Admin Users
```sql
-- Only authenticated admins can view
CREATE POLICY "Admins pueden ver admin_users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only presidents can manage admin users
CREATE POLICY "Presidenta puede gestionar admin_users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND rol = 'presidenta'
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
  -- Get the request
  SELECT * INTO sol FROM solicitudes WHERE id = solicitud_id;
  
  -- Create member
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
  
  -- Update request status
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
