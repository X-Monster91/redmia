// Netlify Function: get-solicitudes.js

const { createClient } = require('@supabase/supabase-js');

let supabase = null;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && supabaseKey && !supabaseKey.startsWith('sb_')) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.error('[get-solicitudes] Missing or invalid env vars');
  }
} catch (e) {
  console.error('[get-solicitudes] Failed to init Supabase:', e.message);
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!supabase) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Servicio no configurado', solicitudes: [] }) };
  }

  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const estado = params.get('estado') || 'pendiente';

    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('estado', estado)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[get-solicitudes] Supabase error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al obtener solicitudes: ' + error.message }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ solicitudes: data })
    };
  } catch (err) {
    console.error('[get-solicitudes] Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
