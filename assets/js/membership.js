// REDMIA - Membership Form JavaScript

// Current step
let currentStep = 1;
let selectedMembership = 'premium';

// Form data
const formData = {
  personal: {},
  academic: {},
  membership: {}
};

// Initialize membership form
function initMembershipForm() {
  const form = document.getElementById('membershipForm');
  if (!form) return;

  // Initialize PayPal buttons
  initPayPalButtons();

  // Initialize membership type selection
  initMembershipTypeSelection();

  // Initialize form validation
  initFormValidation();
}

// Navigate to next step
function nextStep(step) {
  // Validate current step
  if (!validateCurrentStep()) return;

  // Save current step data
  saveCurrentStepData();

  // Hide current step
  const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (currentStepEl) {
    currentStepEl.style.display = 'none';
    currentStepEl.classList.remove('active');
  }

  // Show next step
  const nextStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  if (nextStepEl) {
    nextStepEl.style.display = 'block';
    nextStepEl.classList.add('active');
  }

  // Update step indicators
  updateStepIndicators(step);

  // Update current step
  currentStep = step;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigate to previous step
function prevStep(step) {
  // Hide current step
  const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (currentStepEl) {
    currentStepEl.style.display = 'none';
    currentStepEl.classList.remove('active');
  }

  // Show previous step
  const prevStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
  if (prevStepEl) {
    prevStepEl.style.display = 'block';
    prevStepEl.classList.add('active');
  }

  // Update step indicators
  updateStepIndicators(step);

  // Update current step
  currentStep = step;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update step indicators
function updateStepIndicators(step) {
  const steps = document.querySelectorAll('.membership-form__step');
  steps.forEach((stepEl, index) => {
    const stepNumber = index + 1;
    stepEl.classList.remove('active', 'completed');
    
    if (stepNumber < step) {
      stepEl.classList.add('completed');
    } else if (stepNumber === step) {
      stepEl.classList.add('active');
    }
  });
}

// Validate current step
function validateCurrentStep() {
  const stepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (!stepEl) return true;

  const requiredFields = stepEl.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('error');
      showFieldError(field, 'Este campo es requerido');
    } else {
      field.classList.remove('error');
      clearFieldError(field);
    }

    // Email validation
    if (field.type === 'email' && field.value && !REDMIA.validateEmail(field.value)) {
      isValid = false;
      field.classList.add('error');
      showFieldError(field, 'Ingresa un correo electrónico válido');
    }
  });

  return isValid;
}

// Show field error
function showFieldError(field, message) {
  clearFieldError(field);
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.style.color = 'var(--color-error)';
  errorDiv.style.fontSize = 'var(--text-sm)';
  errorDiv.style.marginTop = 'var(--space-1)';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
  const errorDiv = field.parentNode.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Save current step data
function saveCurrentStepData() {
  const stepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (!stepEl) return;

  const inputs = stepEl.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.type === 'radio') {
      if (input.checked) {
        formData.personal[input.name] = input.value;
      }
    } else if (input.type === 'file') {
      // Handle file separately
    } else {
      formData.personal[input.id] = input.value;
    }
  });
}

// Initialize membership type selection
function initMembershipTypeSelection() {
  const membershipCards = document.querySelectorAll('input[name="membershipType"]');
  membershipCards.forEach(card => {
    card.addEventListener('change', (e) => {
      selectedMembership = e.target.value;
      updatePaymentButton();
    });
  });
}

// Update payment button
function updatePaymentButton() {
  const price = selectedMembership === 'premium' ? 1999 : 999;
  // PayPal buttons will handle the price
}

// Initialize PayPal buttons
function initPayPalButtons() {
  if (typeof paypal === 'undefined') {
    console.log('PayPal SDK not loaded yet');
    return;
  }

  const paypalContainer = document.getElementById('paypal-button-container');
  if (!paypalContainer) return;

  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'blue',
      shape: 'rect',
      label: 'pay'
    },
    createOrder: function(data, actions) {
      const price = selectedMembership === 'premium' ? 1999 : 999;
      return actions.order.create({
        purchase_units: [{
          description: `Membresía REDMIA - ${selectedMembership === 'premium' ? 'Premium' : 'Básica'}`,
          amount: {
            currency_code: 'MXN',
            value: price
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        // Payment successful
        handlePaymentSuccess(details);
      });
    },
    onError: function(err) {
      console.error('PayPal error:', err);
      REDMIA.showAlert('Error al procesar el pago. Por favor, intenta de nuevo.', 'error');
    }
  }).render('#paypal-button-container');
}

// Handle successful payment
function handlePaymentSuccess(paymentDetails) {
  // Save form data
  saveAllFormData();

  // Send data to Supabase
  submitMembershipApplication(paymentDetails);

  // Show success message
  REDMIA.showAlert('¡Pago realizado con éxito! Tu solicitud de membresía ha sido enviada.', 'success');

  // Redirect to thank you page or show confirmation
  setTimeout(() => {
    window.location.href = 'index.html#membership-success';
  }, 3000);
}

// Save all form data
function saveAllFormData() {
  // Personal info
  formData.personal = {
    firstName: document.getElementById('firstName')?.value,
    lastName: document.getElementById('lastName')?.value,
    email: document.getElementById('email')?.value,
    phone: document.getElementById('phone')?.value,
    country: document.getElementById('country')?.value,
    city: document.getElementById('city')?.value
  };

  // Academic info
  formData.academic = {
    institution: document.getElementById('institution')?.value,
    department: document.getElementById('department')?.value,
    degree: document.getElementById('degree')?.value,
    specialty: document.getElementById('specialty')?.value,
    researchLines: document.getElementById('researchLines')?.value,
    publications: document.getElementById('publications')?.value,
    orcid: document.getElementById('orcid')?.value
  };

  // Membership info
  formData.membership = {
    type: selectedMembership,
    bio: document.getElementById('bio')?.value,
    linkedin: document.getElementById('linkedin')?.value,
    website: document.getElementById('website')?.value
  };
}

// Submit membership application to Supabase
async function submitMembershipApplication(paymentDetails) {
  try {
    // This will be implemented with Supabase
    console.log('Submitting application:', {
      ...formData,
      payment: paymentDetails
    });

    // For now, save to localStorage
    const applications = REDMIA.getFromLocalStorage('membershipApplications') || [];
    applications.push({
      id: Date.now(),
      ...formData,
      payment: {
        id: paymentDetails.id,
        status: paymentDetails.status
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    REDMIA.saveToLocalStorage('membershipApplications', applications);

    return true;
  } catch (error) {
    console.error('Error submitting application:', error);
    REDMIA.showAlert('Error al enviar la solicitud. Por favor, intenta de nuevo.', 'error');
    return false;
  }
}

// Initialize form validation
function initFormValidation() {
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (input.required && !input.value.trim()) {
        input.classList.add('error');
        showFieldError(input, 'Este campo es requerido');
      } else {
        input.classList.remove('error');
        clearFieldError(input);
      }
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('error') && input.value.trim()) {
        input.classList.remove('error');
        clearFieldError(input);
      }
    });
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initMembershipForm();
});

// Export functions for use in HTML
window.nextStep = nextStep;
window.prevStep = prevStep;
