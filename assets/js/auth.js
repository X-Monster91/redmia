// auth.js - Authentication system for REDMIA (Supabase)

const SUPABASE_URL = 'https://nyybxbljwzwfpkrdwvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eWJ4Ymxqd3p3bGZwa3Jkd3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NjI5MTMsImV4cCI6MjEwMDEzODkxM30.clodXoRAgeI6zReeqz7tTY6z5vsYayyQazJwpstV7yw';

let supabase = null;
try {
  if (window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn('[REDMIA] Supabase client init failed:', e);
}

const Auth = {
  isConfigured() {
    return supabase !== null && !SUPABASE_URL.includes('YOUR_PROJECT');
  },

  async isLoggedIn() {
    if (!this.isConfigured()) {
      return localStorage.getItem('redmia_user') !== null;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session !== null;
    } catch (e) {
      return localStorage.getItem('redmia_user') !== null;
    }
  },

  async getUser() {
    if (!this.isConfigured()) {
      const user = localStorage.getItem('redmia_user');
      return user ? JSON.parse(user) : null;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (e) {
      const user = localStorage.getItem('redmia_user');
      return user ? JSON.parse(user) : null;
    }
  },

  async login(email, password) {
    if (!this.isConfigured()) {
      const mesaDirectiva = [
        { email: 'diana.ramirez@universidad.mx', password: 'redmia2024', name: 'Dra. Diana Laura Ramírez Sánchez', role: 'presidente' },
        { email: 'francisco.martinez@universidad.mx', password: 'redmia2024', name: 'Dr. Francisco Martínez Cruz', role: 'secretario' },
        { email: 'carlos.gonzalez@universidad.mx', password: 'redmia2024', name: 'Dr. Carlos González López', role: 'tesorero' },
        { email: 'ana.hernandez@universidad.mx', password: 'redmia2024', name: 'Mtra. Ana Hernández Torres', role: 'coordinadora' },
        { email: 'roberto.sanchez@universidad.mx', password: 'redmia2024', name: 'Lic. Roberto Sánchez Díaz', role: 'vocal' }
      ];

      const user = mesaDirectiva.find(u => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem('redmia_user', JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role,
          loginTime: new Date().toISOString()
        }));
        return { success: true, user: user };
      }
      
      return { success: false, error: 'Credenciales incorrectas. Usa credenciales de Mesa Directiva.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (adminError || !adminUser) {
        return { success: false, error: 'No tienes acceso al panel de administración' };
      }

      return { 
        success: true, 
        user: {
          id: data.user.id,
          email: data.user.email,
          name: `${adminUser.nombre} ${adminUser.apellido}`,
          role: adminUser.rol
        }
      };
    } catch (err) {
      console.error('[REDMIA] Login error:', err);
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    }
  },

  async logout() {
    if (this.isConfigured()) {
      try { await supabase.auth.signOut(); } catch (e) {}
    }
    localStorage.removeItem('redmia_user');
    window.location.href = '/login';
  },

  async isMesaDirectiva() {
    const user = await this.getUser();
    if (!user || !user.role) return false;
    return ['presidente', 'secretario', 'tesorero', 'coordinadora', 'vocal'].includes(user.role);
  }
};

document.addEventListener('DOMContentLoaded', async function() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const loginError = document.getElementById('loginError');

      if (!email || !password) {
        loginError.style.display = 'block';
        loginError.textContent = 'Completa todos los campos.';
        return;
      }

      btn.textContent = 'Ingresando...';
      btn.disabled = true;
      loginError.style.display = 'none';

      const result = await Auth.login(email, password);

      if (result.success) {
        window.location.href = '/admin';
      } else {
        btn.textContent = 'Iniciar Sesión';
        btn.disabled = false;
        loginError.style.display = 'block';
        loginError.textContent = result.error || 'Credenciales incorrectas.';
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      await Auth.logout();
    });
  }

  const path = window.location.pathname;
  if (path.includes('admin') && !path.includes('login')) {
    const isLoggedIn = await Auth.isLoggedIn();
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    const user = await Auth.getUser();
    if (user) {
      const welcomeMsg = document.getElementById('welcomeMsg');
      if (welcomeMsg) {
        const displayName = user.name || user.email;
        welcomeMsg.textContent = `Bienvenido, ${displayName}`;
      }
    }
  }

  const headerActions = document.querySelector('.header__actions');
  if (headerActions) {
    const isLoggedIn = await Auth.isLoggedIn();
    if (isLoggedIn) {
      const user = await Auth.getUser();
      if (user) {
        const displayName = user.name || user.email;
        headerActions.innerHTML = `
          <span class="btn btn--primary btn--sm" style="cursor: default;">${displayName.split(' ').slice(0, 2).join(' ')}</span>
          <a href="#" id="logoutBtn" class="btn btn--secondary btn--sm">Cerrar Sesión</a>
        `;
        document.getElementById('logoutBtn').addEventListener('click', async function(e) {
          e.preventDefault();
          await Auth.logout();
        });
      }
    }
  }
});
