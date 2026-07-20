import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-ingreso');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    formStatus.innerHTML = '';

    const formData = new FormData(form);
    const data = {
      nombre_completo: formData.get('nombre'),
      correo_electronico: formData.get('correo'),
      telefono: formData.get('telefono') || null,
      institucion_cargo: formData.get('institucion'),
      grado_academico: formData.get('grado_academico'),
      area_especialidad: formData.get('area_especialidad'),
      categoria_solicitada: formData.get('categoria'),
      eje_tematico: formData.get('eje_tematico'),
      carta_motivos: formData.get('mensaje') || '',
      estado: 'pendiente'
    };

    try {
      const { error } = await supabase
        .from('solicitudes_membresia')
        .insert([data]);

      if (error) {
        throw error;
      }

      // Success
      formStatus.innerHTML = '<div class="notice notice--info"><p><strong>¡Solicitud enviada!</strong> Hemos recibido tus datos correctamente. La Mesa Directiva revisará tu solicitud y se pondrá en contacto contigo muy pronto.</p></div>';
      form.reset();
    } catch (error) {
      console.error('Error:', error);
      formStatus.innerHTML = '<div class="notice notice--warning"><p><strong>Error al enviar</strong> Hubo un problema al enviar tu solicitud. Por favor, intenta de nuevo más tarde o contáctanos por correo.</p></div>';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar solicitud';
    }
  });
});
