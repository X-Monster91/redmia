-- =====================================================
-- ESQUEMA CORREGIDO - REDMIA (Supabase/PostgreSQL)
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- -----------------------------------------------------
-- TABLAS
-- -----------------------------------------------------

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  grado TEXT NOT NULL CHECK (grado IN ('licenciatura', 'maestria', 'doctorado', 'postdoc')),
  especialidad TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('fundador', 'honorario', 'activo', 'estudiante', 'adherente')),
  eje TEXT NOT NULL CHECK (eje IN ('metodologias', 'docencia', 'etica', 'herramientas')),
  activo BOOLEAN DEFAULT true,
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('nueva_solicitud', 'solicitud_aprobada', 'solicitud_rechazada')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------
-- HABILITAR RLS
-- -----------------------------------------------------
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- POLÍTICAS RLS (usando auth.uid() IS NOT NULL)
-- -----------------------------------------------------

-- SOLICITUDES
DROP POLICY IF EXISTS "Cualquiera puede enviar solicitudes" ON public.solicitudes;
CREATE POLICY "Cualquiera puede enviar solicitudes" ON public.solicitudes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin puede ver todas las solicitudes" ON public.solicitudes;
CREATE POLICY "Admin puede ver todas las solicitudes" ON public.solicitudes
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin puede actualizar solicitudes" ON public.solicitudes;
CREATE POLICY "Admin puede actualizar solicitudes" ON public.solicitudes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- MIEMBROS
DROP POLICY IF EXISTS "Miembros activos son publicos" ON public.miembros;
CREATE POLICY "Miembros activos son publicos" ON public.miembros
  FOR SELECT USING (activo = true);

DROP POLICY IF EXISTS "Admin puede gestionar miembros" ON public.miembros;
CREATE POLICY "Admin puede gestionar miembros" ON public.miembros
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ADMIN_USERS
DROP POLICY IF EXISTS "Admins pueden ver admin_users" ON public.admin_users;
CREATE POLICY "Admins pueden ver admin_users" ON public.admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Presidenta puede gestionar admin_users" ON public.admin_users;
CREATE POLICY "Presidente puede gestionar admin_users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND rol = 'presidente'
    )
  );

-- NOTIFICACIONES
DROP POLICY IF EXISTS "Admins pueden ver notificaciones" ON public.notificaciones;
CREATE POLICY "Admins pueden ver notificaciones" ON public.notificaciones
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Sistema puede crear notificaciones" ON public.notificaciones;
CREATE POLICY "Sistema puede crear notificaciones" ON public.notificaciones
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins pueden marcar como leidas" ON public.notificaciones;
CREATE POLICY "Admins pueden marcar como leidas" ON public.notificaciones
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------
-- FUNCIONES RPC (con SET search_path)
-- -----------------------------------------------------

-- Aprobar solicitud
CREATE OR REPLACE FUNCTION public.aprobar_solicitud(solicitud_id UUID)
RETURNS VOID AS $$
DECLARE
  sol RECORD;
BEGIN
  SELECT * INTO sol FROM public.solicitudes WHERE id = solicitud_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada: %', solicitud_id;
  END IF;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Rechazar solicitud
CREATE OR REPLACE FUNCTION public.rechazar_solicitud(solicitud_id UUID, notas TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.solicitudes
  SET estado = 'rechazado', notas_admin = notas, updated_at = NOW()
  WHERE id = solicitud_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada: %', solicitud_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- -----------------------------------------------------
-- TRIGGER PARA updated_at AUTOMÁTICO
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_solicitudes_updated_at ON public.solicitudes;
CREATE TRIGGER trigger_solicitudes_updated_at
  BEFORE UPDATE ON public.solicitudes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_miembros_updated_at ON public.miembros;
CREATE TRIGGER trigger_miembros_updated_at
  BEFORE UPDATE ON public.miembros
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------
-- DATOS INICIALES (ejecutar DESPUÉS de crear usuarios en Auth)
-- -----------------------------------------------------
-- Reemplaza los UUIDs con los reales de auth.users
-- SELECT id, email FROM auth.users WHERE email IN ('prueba02@gmail.com', ...);

-- Ejemplo:
-- INSERT INTO public.admin_users (user_id, email, nombre, apellido, rol) VALUES
-- ('UUID_REAL_DE_AUTH_USERS', 'prueba02@gmail.com', 'Josue', 'Briones', 'presidente'),
-- ('UUID_REAL_DE_AUTH_USERS', 'otro@email.com', 'Nombre', 'Apellido', 'secretario');

-- -----------------------------------------------------
-- VERIFICACIONES POST-EJECUCIÓN
-- -----------------------------------------------------
-- 1. Verificar políticas:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

-- 2. Verificar funciones:
-- SELECT proname, prosecdef, proconfig FROM pg_proc WHERE pronamespace = 'public'::regnamespace;

-- 3. Probar RPC (como service_role):
-- SELECT public.aprobar_solicitud('uuid-de-prueba');