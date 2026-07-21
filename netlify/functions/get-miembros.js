// Netlify Function: get-miembros.js

const { createClient } = require('@supabase/supabase-js');

let supabase = null;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && supabaseKey && !supabaseKey.startsWith('sb_')) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.error('[get-miembros] Missing or invalid env vars');
  }
} catch (e) {
  console.error('[get-miembros] Failed to init Supabase:', e.message);
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!supabase) {
    return { statusCode: 503, headers, body: JSON.stringify({ error: 'Servicio no configurado', miembros: [], total: 0 }) };
  }

  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const categoria = params.get('categoria');
    const eje = params.get('eje');
    const search = params.get('search');

    let query = supabase
      .from('miembros')
      .select('*')
      .eq('activo', true)
      .order('apellido', { ascending: true });

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    if (eje) {
      query = query.eq('eje', eje);
    }

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,institucion.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[get-miembros] Supabase error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al obtener miembros: ' + error.message }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ miembros: data, total: data.length })
    };
  } catch (err) {
    console.error('[get-miembros] Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
