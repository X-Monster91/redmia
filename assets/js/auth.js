// auth.js - Authentication system for REDMIA (Supabase)

const SUPABASE_URL = 'https://nyybxbljwzwfpkrdwvi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lTnL0KPeOVpXlasTIUyRrg_KSTADEx3';

// Initialize Supabase client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const Auth = {
  // Check if Supabase is configured
  isConfigured() {
    return supabase !== null && !SUPABASE_URL.includes('YOUR_PROJECT');
  },

  // Check if user is logged in
  async isLoggedIn() {
    if (!this.isConfigured()) {
      return localStorage.getItem('redmia_user') !== null;
    }
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  },

  // Get current user
  async getUser() {
    if (!this.isConfigured()) {
      const user = localStorage.getItem('redmia_user');
      return user ? JSON.parse(user) : null;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Login
  async login(email, password) {
    if (!this.isConfigured()) {
      // Demo mode - Mesa Directiva only
      const mesaDirectiva = [
        { email: 'diana.ramirez@universidad.mx', password: 'redmia2024', name: 'Dra. Diana Laura Ramírez Sánchez', role: 'presidente' },
        { email: 'francisco.martinez@universidad.mx', password: 'redmia2024', name: 'Dr. Francisco Martínez Cruz', role: 'secretario' },
        { email: 'carlos.gonzalez@universidad.mx', password: 'redmia2024', name: 'Dr. Carlos González López', role: 'tesorero' },
        { email: 'ana.hernandez@universidad.mx', password: 'redmia2024', name: 'Mtra. Ana Hernández Torres', role: 'coordinador' },
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
      
      return { success: false, error: 'Credenciales incorrectas' };
    }

    // Supabase mode
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user is admin
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
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    }
  },

  // Logout
  async logout() {
    if (this.isConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('redmia_user');
    window.location.href = 'login.html';
  },

  // Check if user is Mesa Directiva
  async isMesaDirectiva() {
    const user = await this.getUser();
    if (!user) return false;
    
    if (user.role) {
      return ['presidenta', 'secretario', 'tesorero', 'coordinadora', 'vocal'].includes(user.role);
    }
    
    return false;
  }
};

// Login form handler
document.addEventListener('DOMContentLoaded', async function() {
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const result = await Auth.login(email, password);
      
      if (result.success) {
        window.location.href = 'admin.html';
      } else {
        loginError.style.display = 'block';
        loginError.textContent = result.error;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      await Auth.logout();
    });
  }

  // Redirect if not logged in (for admin page) - works with Netlify clean URLs
  const path = window.location.pathname;
  if (path.includes('admin') && !path.includes('login')) {
    const isLoggedIn = await Auth.isLoggedIn();
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    // Update welcome message with user name
    const user = await Auth.getUser();
    if (user) {
      const welcomeMsg = document.getElementById('welcomeMsg');
      if (welcomeMsg) {
        const displayName = user.name || user.email;
        welcomeMsg.textContent = `Bienvenido, ${displayName}`;
      }
    }
  }

  // Update header based on auth state
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
