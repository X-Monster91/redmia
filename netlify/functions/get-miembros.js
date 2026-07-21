// Netlify Function: get-miembros.js
// Get active members (public)

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
      console.error('Supabase error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al obtener miembros' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ miembros: data, total: data.length })
    };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
