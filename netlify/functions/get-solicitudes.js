// Netlify Function: get-solicitudes.js
// Get pending membership requests (admin only)

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

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

  try {
    // Get filter from query params
    const params = new URLSearchParams(event.queryStringParameters || {});
    const estado = params.get('estado') || 'pendiente';

    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('estado', estado)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error al obtener solicitudes' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ solicitudes: data })
    };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
