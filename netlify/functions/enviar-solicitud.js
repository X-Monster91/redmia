// Netlify Function: enviar-solicitud.js

const { createClient } = require('@supabase/supabase-js');

let supabase = null;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && supabaseKey && !supabaseKey.startsWith('sb_')) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.error('[enviar-solicitud] Missing or invalid env vars. SUPABASE_URL:', !!supabaseUrl, 'key format:', supabaseKey ? supabaseKey.substring(0, 3) : 'missing');
  }
} catch (e) {
  console.error('[enviar-solicitud] Failed to init Supabase:', e.message);
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!supabase) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Servicio no configurado. Verifica las variables de entorno.' }) };
  }

  try {
    const data = JSON.parse(event.body);

    const required = ['nombre', 'apellido', 'email', 'institucion', 'cargo', 'grado', 'especialidad', 'categoria', 'eje', 'motivos'];
    for (const field of required) {
      if (!data[field]) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Campo requerido: ${field}` }) };
      }
    }

    const { data: result, error } = await supabase
      .from('solicitudes')
      .insert([{
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.telefono || null,
        institucion: data.institucion,
        cargo: data.cargo,
        grado: data.grado,
        especialidad: data.especialidad,
        categoria: data.categoria,
        eje: data.eje,
        motivos: data.motivos,
        estado: 'pendiente'
      }]);

    if (error) {
      console.error('[enviar-solicitud] Supabase error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al enviar solicitud: ' + error.message }) };
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Solicitud enviada correctamente. Serás contactado por la Mesa Directiva.',
        id: result?.[0]?.id
      })
    };
  } catch (err) {
    console.error('[enviar-solicitud] Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
