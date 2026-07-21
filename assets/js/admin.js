// admin.js - Admin panel functionality (Supabase)

const API_BASE = '/.netlify/functions';

document.addEventListener('DOMContentLoaded', async function() {
  // Check if we're on admin page (Netlify serves /admin without .html)
  const path = window.location.pathname;
  if (!path.includes('admin') || path.includes('login')) return;

  // Load pending requests
  await loadSolicitudes('pendiente');

  // Load stats
  await loadStats();
});

// Load solicitations
async function loadSolicitudes(estado = 'pendiente') {
  try {
    const response = await fetch(`${API_BASE}/get-solicitudes?estado=${estado}`);
    const data = await response.json();
    
    if (data.solicitudes) {
      renderSolicitudes(data.solicitudes);
    }
  } catch (err) {
    console.error('Error loading solicitudes:', err);
  }
}

// Render solicitations
function renderSolicitudes(solicitudes) {
  const container = document.getElementById('pendingRequests');
  if (!container) return;

  if (solicitudes.length === 0) {
    container.innerHTML = '<p class="text-muted">No hay solicitudes pendientes.</p>';
    return;
  }

  container.innerHTML = solicitudes.map(sol => `
    <div class="card mb-4" style="border-left: 4px solid ${getStatusColor(sol.estado)};">
      <div class="card__body">
        <div class="flex justify-between items-center mb-4" style="flex-wrap: wrap; gap: var(--space-4);">
          <div>
            <h4>${sol.nombre} ${sol.apellido}</h4>
            <p class="text-sm text-muted">${sol.email}</p>
          </div>
          <span class="badge badge--${getStatusBadge(sol.estado)}">${sol.estado}</span>
        </div>
        <div class="text-sm">
          <p><strong>Institución:</strong> ${sol.institucion}</p>
          <p><strong>Grado:</strong> ${sol.grado}</p>
          <p><strong>Eje:</strong> ${getEjeName(sol.eje)}</p>
          <p><strong>Categoría:</strong> ${sol.categoria}</p>
        </div>
        ${sol.estado === 'pendiente' ? `
          <div class="flex gap-4 mt-6">
            <button class="btn btn--primary btn--sm" onclick="procesarSolicitud('${sol.id}', 'aprobar')">Aprobar</button>
            <button class="btn btn--secondary btn--sm" onclick="procesarSolicitud('${sol.id}', 'rechazar')">Rechazar</button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Process request
async function procesarSolicitud(id, accion) {
  try {
    const response = await fetch(`${API_BASE}/procesar-solicitud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ solicitud_id: id, accion })
    });

    const data = await response.json();

    if (data.success) {
      showNotification(data.message, 'success');
      await loadSolicitudes('pendiente');
      await loadStats();
    } else {
      showNotification(data.error || 'Error al procesar', 'error');
    }
  } catch (err) {
    showNotification('Error de conexión', 'error');
  }
}

// Load stats
async function loadStats() {
  try {
    const [pendientes, aprobados, total] = await Promise.all([
      fetch(`${API_BASE}/get-solicitudes?estado=pendiente`).then(r => r.json()),
      fetch(`${API_BASE}/get-solicitudes?estado=aprobado`).then(r => r.json()),
      fetch(`${API_BASE}/get-miembros`).then(r => r.json())
    ]);

    // Update stats if elements exist
    const statsContainer = document.getElementById('adminStats');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-card__label">Pendientes</div>
          <div class="stat-card__value">${pendientes.solicitudes?.length || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Aprobados</div>
          <div class="stat-card__value">${aprobados.solicitudes?.length || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Miembros Activos</div>
          <div class="stat-card__value">${total.total || 0}</div>
        </div>
      `;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// Helper functions
function getStatusColor(estado) {
  const colors = {
    pendiente: '#F59E0B',
    aprobado: '#10B981',
    rechazado: '#EF4444'
  };
  return colors[estado] || '#6B7280';
}

function getStatusBadge(estado) {
  const badges = {
    pendiente: 'warning',
    aprobado: 'success',
    rechazado: 'error'
  };
  return badges[estado] || 'primary';
}

function getEjeName(eje) {
  const names = {
    metodologias: 'Metodologías de investigación con IA generativa',
    docencia: 'IA generativa aplicada a la docencia',
    etica: 'Ética, rigor y buenas prácticas',
    herramientas: 'Herramientas y alfabetización digital'
  };
  return names[eje] || eje;
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert--${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
