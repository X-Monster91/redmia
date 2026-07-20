// formulario.js - Membership form handler (Supabase)

const API_BASE = '/.netlify/functions';

document.addEventListener('DOMContentLoaded', function() {
  const membershipForm = document.getElementById('membershipForm');
  
  if (membershipForm) {
    membershipForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        institucion: document.getElementById('institucion').value,
        cargo: document.getElementById('cargo').value,
        grado: document.getElementById('grado').value,
        especialidad: document.getElementById('especialidad').value,
        categoria: document.getElementById('categoria').value,
        eje: document.getElementById('eje').value,
        motivos: document.getElementById('motivos').value,
        privacidad: document.getElementById('privacidad').checked
      };

      // Validate privacy checkbox
      if (!formData.privacidad) {
        showNotification('Debes aceptar el aviso de privacidad', 'error');
        return;
      }

      // Disable submit button
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      try {
        const response = await fetch(`${API_BASE}/enviar-solicitud`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          showNotification(data.message, 'success');
          membershipForm.reset();
        } else {
          showNotification(data.error || 'Error al enviar solicitud', 'error');
        }
      } catch (err) {
        showNotification('Error de conexión. Intenta de nuevo.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // PayPal integration (when real client ID is provided)
  if (typeof paypal !== 'undefined') {
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay'
      },
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            description: 'Membresía REDMIA 2024-2025',
            amount: {
              currency_code: 'MXN',
              value: '950.00'
            }
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          showNotification('Pago realizado correctamente. Tu solicitud será procesada.', 'success');
        });
      },
      onError: function(err) {
        showNotification('Error al procesar el pago. Intenta de nuevo.', 'error');
      }
    }).render('#paypal-button-container');
  }
});

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
