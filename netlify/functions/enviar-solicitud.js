// Netlify Function: enviar-solicitud.js
// Handles membership request submissions

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);

    // Validate required fields
    const required = ['nombre', 'apellido', 'email', 'institucion', 'cargo', 'grado', 'especialidad', 'categoria', 'eje', 'motivos'];
    for (const field of required) {
      if (!data[field]) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: `Campo requerido: ${field}` }) };
      }
    }

    // Insert into database
    const { result, error } = await supabase
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
      console.error('Supabase error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al enviar solicitud' }) };
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
    console.error('Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
