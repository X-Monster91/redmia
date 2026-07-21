// Netlify Function: login.js

const { createClient } = require('@supabase/supabase-js');

let supabase = null;
try {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey && !supabaseKey.startsWith('sb_')) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.error('[login] Missing or invalid env vars. SUPABASE_URL:', !!supabaseUrl, 'key format:', supabaseKey ? supabaseKey.substring(0, 3) : 'missing');
  }
} catch (e) {
  console.error('[login] Failed to init Supabase:', e.message);
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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email y contraseña son requeridos' }) };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('[login] Auth error:', error);
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Credenciales incorrectas' }) };
    }

    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (adminError || !adminUser) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'No tienes acceso al panel de administración' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          nombre: adminUser.nombre,
          apellido: adminUser.apellido,
          rol: adminUser.rol
        },
        session: data.session
      })
    };
  } catch (err) {
    console.error('[login] Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error interno del servidor' }) };
  }
};
