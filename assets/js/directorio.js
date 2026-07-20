import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  const directorioGrid = document.getElementById('directorio-grid');

  try {
    const { data, error } = await supabase
      .from('miembros_activos')
      .select('*')
      .order('nombre_completo', { ascending: true });

    loadingState.style.display = 'none';

    if (error) {
      console.error('Error cargando miembros:', error);
      emptyState.innerHTML = '<p>Error al cargar el directorio. Por favor, intenta de nuevo más tarde.</p>';
      emptyState.style.display = 'block';
      return;
    }

    if (!data || data.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    directorioGrid.style.display = 'grid';
    
    data.forEach(miembro => {
      const card = document.createElement('div');
      card.className = 'member-card';
      
      const badge = `<span class="member-card__badge">${miembro.categoria_membresia}</span>`;
      
      card.innerHTML = `
        ${badge}
        <h3 class="member-card__name">${miembro.grado_academico ? miembro.grado_academico + ' ' : ''}${miembro.nombre_completo}</h3>
        <p class="member-card__inst">${miembro.institucion_cargo}</p>
        <p style="font-size:0.875rem; color: var(--c-text-light);"><strong>Eje:</strong> ${miembro.eje_tematico}</p>
      `;
      directorioGrid.appendChild(card);
    });

  } catch (err) {
    loadingState.style.display = 'none';
    console.error('Excepción cargando miembros:', err);
  }
});
