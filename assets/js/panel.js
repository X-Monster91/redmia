import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const tbody = document.getElementById('solicitudes-tbody');

  // Comprobar si hay sesión activa
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    showDashboard();
  } else {
    loginSection.style.display = 'block';
  }

  // Manejar Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      loginError.textContent = 'Credenciales inválidas. Verifica tu correo y contraseña.';
    } else {
      showDashboard();
    }
  });

  // Manejar Logout
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    dashboardSection.style.display = 'none';
    loginSection.style.display = 'block';
    loginForm.reset();
  });

  async function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    await fetchSolicitudes();
  }

  async function fetchSolicitudes() {
    const { data, error } = await supabase
      .from('solicitudes_membresia')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      tbody.innerHTML = `<tr><td colspan="8" style="color:red;">Error al cargar las solicitudes.</td></tr>`;
      console.error(error);
      return;
    }

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No hay solicitudes registradas aún.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    data.forEach(solicitud => {
      const tr = document.createElement('tr');
      const date = new Date(solicitud.created_at).toLocaleDateString('es-MX');
      
      let statusClass = 'status-pendiente';
      if(solicitud.estado === 'aprobada') statusClass = 'status-aprobada';
      if(solicitud.estado === 'rechazada') statusClass = 'status-rechazada';

      let accionesHtml = '';
      if (solicitud.estado === 'pendiente') {
        accionesHtml = `
          <td>
            <button class="btn btn--outline btn--sm btn-aprobar" data-id="${solicitud.id}" style="margin-right: 0.5rem;">Aprobar</button>
            <button class="btn btn--outline btn--sm btn-rechazar" data-id="${solicitud.id}">Rechazar</button>
          </td>
        `;
      } else {
        accionesHtml = `<td><span class="text-muted">—</span></td>`;
      }

      tr.innerHTML = `
        <td>${date}</td>
        <td><strong>${solicitud.nombre_completo}</strong></td>
        <td><a href="mailto:${solicitud.correo_electronico}">${solicitud.correo_electronico}</a></td>
        <td>${solicitud.institucion_cargo}</td>
        <td>${solicitud.categoria_solicitada}</td>
        <td>${solicitud.eje_tematico}</td>
        <td><span class="status-badge ${statusClass}">${solicitud.estado.toUpperCase()}</span></td>
        ${accionesHtml}
      `;
      tbody.appendChild(tr);
    });

    // Agregar event listeners a los botones
    document.querySelectorAll('.btn-aprobar').forEach(btn => {
      btn.addEventListener('click', (e) => aprobarSolicitud(e.target.dataset.id));
    });
    document.querySelectorAll('.btn-rechazar').forEach(btn => {
      btn.addEventListener('click', (e) => rechazarSolicitud(e.target.dataset.id));
    });
  }

  async function aprobarSolicitud(id) {
    if (!confirm('¿Aprobar esta solicitud? Se agregará el miembro al catálogo público.')) return;

    const btn = document.querySelector(`.btn-aprobar[data-id="${id}"]`);
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    try {
      // 1. Obtener la solicitud completa
      const { data: solicitud, error: fetchError } = await supabase
        .from('solicitudes_membresia')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Actualizar estado a 'aprobada'
      const { error: updateError } = await supabase
        .from('solicitudes_membresia')
        .update({ estado: 'aprobada' })
        .eq('id', id);

      if (updateError) throw updateError;

      // 3. Insertar en miembros_activos
      const { error: insertError } = await supabase
        .from('miembros_activos')
        .insert([{
          nombre_completo: solicitud.nombre_completo,
          correo_electronico: solicitud.correo_electronico,
          institucion_cargo: solicitud.institucion_cargo,
          grado_academico: solicitud.grado_academico,
          area_especialidad: solicitud.area_especialidad,
          categoria_membresia: solicitud.categoria_solicitada,
          eje_tematico: solicitud.eje_tematico,
          solicitud_id: solicitud.id
        }]);

      if (insertError) throw insertError;

      // 4. Actualizar la tabla visualmente
      await fetchSolicitudes();
      alert('Solicitud aprobada correctamente. El miembro ha sido agregado al catálogo.');

    } catch (error) {
      console.error('Error al aprobar:', error);
      alert('Error al aprobar la solicitud: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'Aprobar';
    }
  }

  async function rechazarSolicitud(id) {
    if (!confirm('¿Rechazar esta solicitud?')) return;

    const btn = document.querySelector(`.btn-rechazar[data-id="${id}"]`);
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    try {
      const { error } = await supabase
        .from('solicitudes_membresia')
        .update({ estado: 'rechazada' })
        .eq('id', id);

      if (error) throw error;

      await fetchSolicitudes();
      alert('Solicitud rechazada correctamente.');

    } catch (error) {
      console.error('Error al rechazar:', error);
      alert('Error al rechazar la solicitud: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'Rechazar';
    }
  }
});
