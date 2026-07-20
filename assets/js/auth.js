// auth.js - Authentication system for REDMIA

const AUTH_STORAGE_KEY = 'redmia_user';
const LOGIN_ENDPOINT = '/.netlify/functions/login';

const Auth = {
  async isLoggedIn() {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  },

  async getUser() {
    const user = localStorage.getItem(AUTH_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  },

  async login(email, password) {
    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'No se pudo iniciar sesión' };
      }

      const user = {
        id: result.user.id,
        email: result.user.email,
        name: `${result.user.nombre} ${result.user.apellido}`.trim(),
        role: result.user.rol,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  async logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = 'login.html';
  },

  async isMesaDirectiva() {
    const user = await this.getUser();
    if (!user) return false;

    return ['presidenta', 'presidente', 'secretario', 'tesorero', 'coordinadora', 'coordinador', 'vocal'].includes(user.role);
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

  // Redirect if not logged in (for admin page)
  if (window.location.pathname.includes('admin.html')) {
    const isLoggedIn = await Auth.isLoggedIn();
    if (!isLoggedIn) {
      window.location.href = 'login.html';
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
