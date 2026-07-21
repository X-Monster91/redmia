-- =====================================================
-- Esquema de Base de Datos - REDMIA (Supabase/PostgreSQL)
-- =====================================================

-- Tabla: solicitudes
CREATE TABLE IF NOT EXISTS public.solicitudes (
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

-- Tabla: miembros
CREATE TABLE IF NOT EXISTS public.miembros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitud_id UUID REFERENCES public.solicitudes(id) ON DELETE SET NULL,
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

-- Tabla: admin_users (Mesa Directiva)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('presidente', 'secretario', 'tesorero', 'coordinador', 'vocal')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('nueva_solicitud', 'solicitud_aprobada', 'solicitud_rechazada')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Habilitar RLS en todas las tablas
-- =====================================================
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Politicas RLS
-- =====================================================

-- Solicitudes: cualquiera puede insertar (formulario publico)
DROP POLICY IF EXISTS "Cualquiera puede enviar solicitudes" ON public.solicitudes;
CREATE POLICY "Cualquiera puede enviar solicitudes" ON public.solicitudes
  FOR INSERT WITH CHECK (true);

-- Solicitudes: solo autenticados pueden ver
DROP POLICY IF EXISTS "Admin puede ver todas las solicitudes" ON public.solicitudes;
CREATE POLICY "Admin puede ver todas las solicitudes" ON public.solicitudes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solicitudes: solo autenticados pueden actualizar
DROP POLICY IF EXISTS "Admin puede actualizar solicitudes" ON public.solicitudes;
CREATE POLICY "Admin puede actualizar solicitudes" ON public.solicitudes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Miembros: activos son publicos
DROP POLICY IF EXISTS "Miembros activos son publicos" ON public.miembros;
CREATE POLICY "Miembros activos son publicos" ON public.miembros
  FOR SELECT USING (activo = true);

-- Miembros: solo autenticados pueden gestionar
DROP POLICY IF EXISTS "Admin puede gestionar miembros" ON public.miembros;
CREATE POLICY "Admin puede gestionar miembros" ON public.miembros
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Admin Users: solo autenticados pueden ver
DROP POLICY IF EXISTS "Admins pueden ver admin_users" ON public.admin_users;
CREATE POLICY "Admins pueden ver admin_users" ON public.admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Notificaciones: solo autenticados
DROP POLICY IF EXISTS "Admins pueden ver notificaciones" ON public.notificaciones;
CREATE POLICY "Admins pueden ver notificaciones" ON public.notificaciones
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Sistema puede crear notificaciones" ON public.notificaciones;
CREATE POLICY "Sistema puede crear notificaciones" ON public.notificaciones
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins pueden marcar como leidas" ON public.notificaciones;
CREATE POLICY "Admins pueden marcar como leidas" ON public.notificaciones
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Funciones RPC (SECURITY DEFINER + search_path fijo)
-- =====================================================

-- Aprobar solicitud
CREATE OR REPLACE FUNCTION public.aprobar_solicitud(solicitud_id UUID)
RETURNS VOID AS $$
DECLARE
  sol RECORD;
BEGIN
  SELECT * INTO sol FROM public.solicitudes WHERE id = solicitud_id;

  INSERT INTO public.miembros (
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

  UPDATE public.solicitudes
  SET estado = 'aprobado', updated_at = NOW()
  WHERE id = solicitud_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public;

-- Rechazar solicitud
CREATE OR REPLACE FUNCTION public.rechazar_solicitud(solicitud_id UUID, notas TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.solicitudes
  SET estado = 'rechazado', notas_admin = notas, updated_at = NOW()
  WHERE id = solicitud_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public;

-- Restringir EXECUTE en funciones SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.aprobar_solicitud(UUID) FROM public;
REVOKE EXECUTE ON FUNCTION public.rechazar_solicitud(UUID, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.aprobar_solicitud(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rechazar_solicitud(UUID, TEXT) TO authenticated;

-- =====================================================
-- Usuarios admin (Mesa Directiva)
-- Reemplaza los UUIDs con los reales de auth.users
-- =====================================================
-- INSERT INTO public.admin_users (user_id, email, nombre, apellido, rol) VALUES
-- ('UUID_DE_PRUEBA01', 'prueba01@gmail.com', 'Josue', 'David', 'presidente'),
-- ('UUID_DE_PRUEBA02', 'prueba02@gmail.com', 'Josue', 'Briones', 'presidente');
