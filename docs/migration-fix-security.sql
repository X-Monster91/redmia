-- =====================================================
-- MIGRACION: Fix Security Advisor warnings - REDMIA
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Fix Function Search Path Mutable (aprobar_solicitud)
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

-- 2. Fix Function Search Path Mutable (rechazar_solicitud)
CREATE OR REPLACE FUNCTION public.rechazar_solicitud(solicitud_id UUID, notas TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.solicitudes
  SET estado = 'rechazado', notas_admin = notas, updated_at = NOW()
  WHERE id = solicitud_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public;

-- 3. Fix Public Can Execute SECURITY DEFINER Function
-- Revoke public execute and grant only to authenticated/service_role
REVOKE EXECUTE ON FUNCTION public.aprobar_solicitud(UUID) FROM public;
REVOKE EXECUTE ON FUNCTION public.rechazar_solicitud(UUID, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.aprobar_solicitud(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rechazar_solicitud(UUID, TEXT) TO authenticated;

-- 4. Add RLS policy for notificaciones (RLS Enabled No Policy)
CREATE POLICY "Admins pueden ver notificaciones" ON public.notificaciones
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sistema puede crear notificaciones" ON public.notificaciones
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins pueden marcar como leidas" ON public.notificaciones
  FOR UPDATE USING (auth.uid() IS NOT NULL);
