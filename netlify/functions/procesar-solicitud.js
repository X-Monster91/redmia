// Netlify Function: procesar-solicitud.js
// Approve or reject membership requests (admin only)

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { solicitud_id, accion, notas } = JSON.parse(event.body);

    if (!solicitud_id || !accion) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'solicitud_id y accion son requeridos' }) };
    }

    if (!['aprobar', 'rechazar'].includes(accion)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'accion debe ser "aprobar" o "rechazar"' }) };
    }

    let result;

    if (accion === 'aprobar') {
      // Use the RPC function to approve
      const { error } = await supabase.rpc('aprobar_solicitud', { solicitud_id });
      if (error) throw error;
      
      result = { success: true, message: 'Solicitud aprobada. Miembro agregado al directorio.' };
    } else {
      // Reject with notes
      const { error } = await supabase.rpc('rechazar_solicitud', { solicitud_id, notas });
      if (error) throw error;
      
      result = { success: true, message: 'Solicitud rechazada.' };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al procesar solicitud' }) };
  }
};
