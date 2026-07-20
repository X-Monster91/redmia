-- Esquema de base de datos para REDMIA en Supabase

-- 1. Tabla de Solicitudes de Membresía
CREATE TABLE solicitudes_membresia (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nombre_completo TEXT NOT NULL,
  correo_electronico TEXT NOT NULL,
  telefono TEXT,
  institucion_cargo TEXT NOT NULL,
  grado_academico TEXT NOT NULL,
  area_especialidad TEXT NOT NULL,
  categoria_solicitada TEXT NOT NULL,
  eje_tematico TEXT NOT NULL,
  carta_motivos TEXT NOT NULL,
  comprobante_url TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  pago_paypal_id TEXT
);

-- 2. Tabla de Miembros Activos
CREATE TABLE miembros_activos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nombre_completo TEXT NOT NULL,
  correo_electronico TEXT NOT NULL,
  institucion_cargo TEXT NOT NULL,
  grado_academico TEXT,
  area_especialidad TEXT,
  categoria_membresia TEXT NOT NULL,
  eje_tematico TEXT NOT NULL,
  solicitud_id UUID REFERENCES solicitudes_membresia(id)
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE solicitudes_membresia ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_activos ENABLE ROW LEVEL SECURITY;

-- Políticas para Solicitudes (Permitir inserción anónima para el formulario)
CREATE POLICY "Permitir inserciones anónimas en solicitudes" 
  ON solicitudes_membresia FOR INSERT 
  WITH CHECK (true);

-- Política para actualizar estado de solicitudes (solo usuarios autenticados)
CREATE POLICY "Usuarios autenticados pueden actualizar solicitudes" 
  ON solicitudes_membresia FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Políticas para lectura (solo usuarios autenticados, es decir, Mesa Directiva)
CREATE POLICY "Solo usuarios autenticados pueden ver solicitudes" 
  ON solicitudes_membresia FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Cualquiera puede ver a los miembros activos (catálogo público)" 
  ON miembros_activos FOR SELECT 
  USING (true);

CREATE POLICY "Solo usuarios autenticados pueden insertar miembros" 
  ON miembros_activos FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden modificar miembros" 
  ON miembros_activos FOR ALL 
  USING (auth.role() = 'authenticated');
