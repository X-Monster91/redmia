// REDMIA - Members JavaScript

// Sample members data
const membersData = [
  {
    id: 1,
    name: 'Dr. María García López',
    role: 'Directora de Investigación',
    institution: 'UNAM',
    specialty: 'Procesamiento de Lenguaje Natural',
    bio: 'Especialista en procesamiento de lenguaje natural y aprendizaje profundo con más de 15 años de experiencia en investigación académica.',
    image: 'assets/img/68df78f83c9caf28c792f7f6.png',
    category: 'directiva',
    membershipDate: '2023-01-15',
    email: 'maria.garcia@unam.mx'
  },
  {
    id: 2,
    name: 'Dr. Carlos Rodríguez Martínez',
    role: 'Director Académico',
    institution: 'IPN',
    specialty: 'Visión por Computadora',
    bio: 'Experto en sistemas de visión por computadora y su aplicación en diagnóstico médico y análisis de imágenes.',
    image: null,
    category: 'directiva',
    membershipDate: '2023-03-20',
    email: 'carlos.rodriguez@ipn.mx'
  },
  {
    id: 3,
    name: 'Dra. Ana Martínez Sánchez',
    role: 'Coordinadora de Ética',
    institution: 'UAM',
    specialty: 'Ética de la IA',
    bio: 'Enfocada en ética de la IA y desarrollo de sistemas responsables y transparentes.',
    image: null,
    category: 'directiva',
    membershipDate: '2023-06-10',
    email: 'ana.martinez@uam.mx'
  },
  {
    id: 4,
    name: 'Dr. Roberto Díaz Hernández',
    role: 'Investigador Senior',
    institution: 'Tec de Monterrey',
    specialty: 'Robótica',
    bio: 'Especialista en robótica autónoma y sistemas de control inteligente para aplicaciones industriales.',
    image: null,
    category: 'investigador',
    membershipDate: '2023-09-05',
    email: 'roberto.diaz@tec.mx'
  },
  {
    id: 5,
    name: 'Dra. Laura Fernández Ruiz',
    role: 'Investigadora',
    institution: 'UANL',
    specialty: 'Minería de Datos',
    bio: 'Experta en minería de datos y análisis predictivo para aplicaciones en salud pública.',
    image: null,
    category: 'investigador',
    membershipDate: '2023-11-15',
    email: 'laura.fernandez@uanl.mx'
  },
  {
    id: 6,
    name: 'Dr. Miguel Ángel Torres',
    role: 'Investigador',
    institution: 'UNAM',
    specialty: 'Redes Neuronales',
    bio: 'Enfocado en redes neuronales y su aplicación en procesamiento de señales biomédicas.',
    image: null,
    category: 'investigador',
    membershipDate: '2023-12-01',
    email: 'miguel.torres@unam.mx'
  },
  {
    id: 7,
    name: 'Ing. Patricia Vargas',
    role: 'Colaboradora Técnica',
    institution: 'IBM México',
    specialty: 'Computación en la Nube',
    bio: 'Ingeniera de software especializada en implementación de soluciones de IA en la nube.',
    image: null,
    category: 'colaborador',
    membershipDate: '2024-02-10',
    email: 'patricia.vargas@ibm.com'
  },
  {
    id: 8,
    name: 'Lic. Sofía Mendoza',
    role: 'Coordinadora de Eventos',
    institution: 'REDMIA',
    specialty: 'Gestión de Eventos',
    bio: 'Responsable de la organización de congresos, conferencias y talleres de la red.',
    image: null,
    category: 'colaborador',
    membershipDate: '2024-03-01',
    email: 'sofia.mendoza@redmia.org'
  }
];

// Color mappings for avatars
const colorGradients = {
  'C': 'linear-gradient(135deg, #C8924A, #D4A574)',
  'A': 'linear-gradient(135deg, #0F2A44, #2A4768)',
  'R': 'linear-gradient(135deg, #10B981, #34D399)',
  'L': 'linear-gradient(135deg, #F59E0B, #FBBF24)',
  'M': 'linear-gradient(135deg, #EF4444, #F87171)',
  'P': 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
  'S': 'linear-gradient(135deg, #EC4899, #F472B6)',
  'D': 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  'default': 'linear-gradient(135deg, #6B7280, #9CA3AF)'
};

// Get color gradient based on first letter
function getAvatarColor(name) {
  const firstLetter = name.charAt(0).toUpperCase();
  return colorGradients[firstLetter] || colorGradients['default'];
}

// Generate member card HTML
function generateMemberCard(member) {
  const avatarContent = member.image 
    ? `<img src="${member.image}" alt="${member.name}" class="member-card__avatar">`
    : `<div class="member-card__avatar" style="background: ${getAvatarColor(member.name)}; display: flex; align-items: center; justify-content: center;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
       </div>`;

  return `
    <div class="member-card" data-category="${member.category}">
      ${avatarContent}
      <h3 class="member-card__name">${member.name}</h3>
      <p class="member-card__role">${member.role}</p>
      <p class="member-card__bio">${member.bio}</p>
      <p class="member-card__membership">Miembro desde: ${REDMIA.formatDate(member.membershipDate)}</p>
    </div>
  `;
}

// Initialize members grid
function initMembersGrid() {
  const membersGrid = document.getElementById('membersGrid');
  if (!membersGrid) return;

  // Render all members
  membersGrid.innerHTML = membersData.map(generateMemberCard).join('');

  // Initialize filters
  initFilters();

  // Initialize search
  initSearch();
}

// Initialize filter buttons
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.classList.remove('btn--primary');
        b.classList.add('btn--secondary');
      });
      btn.classList.add('active');
      btn.classList.add('btn--primary');
      btn.classList.remove('btn--secondary');

      // Filter members
      const filter = btn.dataset.filter;
      filterMembers(filter);
    });
  });
}

// Filter members by category
function filterMembers(category) {
  const memberCards = document.querySelectorAll('.member-card');
  memberCards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Initialize search functionality
function initSearch() {
  const searchInput = document.getElementById('memberSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', REDMIA.debounce((e) => {
    const searchTerm = e.target.value.toLowerCase();
    searchMembers(searchTerm);
  }, 300));
}

// Search members by name, role, or institution
function searchMembers(term) {
  const memberCards = document.querySelectorAll('.member-card');
  memberCards.forEach(card => {
    const name = card.querySelector('.member-card__name').textContent.toLowerCase();
    const role = card.querySelector('.member-card__role').textContent.toLowerCase();
    const bio = card.querySelector('.member-card__bio').textContent.toLowerCase();
    
    if (name.includes(term) || role.includes(term) || bio.includes(term)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Load more members (simulated)
function loadMoreMembers() {
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (!loadMoreBtn) return;

  loadMoreBtn.addEventListener('click', () => {
    const originalText = REDMIA.showLoading(loadMoreBtn);
    
    // Simulate API call
    setTimeout(() => {
      REDMIA.hideLoading(loadMoreBtn, originalText);
      REDMIA.showAlert('Todos los miembros han sido cargados.', 'info');
    }, 1500);
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initMembersGrid();
  loadMoreMembers();
});

// Export for use in other scripts
window.MembersModule = {
  membersData,
  filterMembers,
  searchMembers
};
