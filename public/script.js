// Variables globales
let allProjects = [];
let currentSection = 'all';
let allClients = [];

// Elementos del DOM
const projectsGrid = document.getElementById('projects-grid');
const pageTitle = document.getElementById('page-title');
const loading = document.getElementById('loading');
const noProjects = document.getElementById('no-projects');
const searchName = document.getElementById('search-name');
const searchTech = document.getElementById('search-tech');
const clearFilters = document.getElementById('clear-filters');

// Elementos del modal
const addProjectBtn = document.getElementById('add-project-btn');
const projectModal = document.getElementById('project-modal');
const closeModal = document.querySelector('.close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const projectForm = document.getElementById('project-form');
const formLoading = document.getElementById('form-loading');
const formMessage = document.getElementById('form-message');
const modalTitle = document.getElementById('modal-title');
const submitBtn = document.getElementById('submit-btn');

// Elementos del modal de eliminación
const deleteModal = document.getElementById('delete-modal');
const closeDeleteModal = document.querySelector('.close-delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const deleteLoading = document.getElementById('delete-loading');
const deleteMessage = document.getElementById('delete-message');
const deleteProjectName = document.querySelector('.delete-project-name');

// Variables de estado
let currentEditingProject = null;
let currentDeletingProjectId = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadProjects();
    loadClients();
    setupFilters();
    setupModal();
});

// Configurar navegación
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase activa de todos los enlaces
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase activa al enlace clickeado
            link.classList.add('active');
            
            // Obtener la sección
            currentSection = link.dataset.section;
            
            // Actualizar título y filtrar proyectos
            updatePageTitle(currentSection);
            filterProjects();
        });
    });
}

// Configurar filtros de búsqueda
function setupFilters() {
    searchName.addEventListener('input', filterProjects);
    searchTech.addEventListener('input', filterProjects);
    
    clearFilters.addEventListener('click', () => {
        searchName.value = '';
        searchTech.value = '';
        filterProjects();
    });
}

// Cargar proyectos desde la API
async function loadProjects() {
    try {
        showLoading(true);
        
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Error al cargar proyectos');
        }
        
        allProjects = await response.json();
        filterProjects();
        
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar los proyectos. Por favor, intenta de nuevo.');
    } finally {
        showLoading(false);
    }
}

// Filtrar y mostrar proyectos
function filterProjects() {
    let filteredProjects = [...allProjects];
    
    // Filtrar por sección
    if (currentSection !== 'all') {
        filteredProjects = filteredProjects.filter(project => 
            project.section.toLowerCase() === currentSection.toLowerCase()
        );
    }
    
    // Filtrar por nombre
    const nameFilter = searchName.value.toLowerCase().trim();
    if (nameFilter) {
        filteredProjects = filteredProjects.filter(project =>
            project.name.toLowerCase().includes(nameFilter)
        );
    }
    
    // Filtrar por tecnología
    const techFilter = searchTech.value.toLowerCase().trim();
    if (techFilter) {
        filteredProjects = filteredProjects.filter(project =>
            project.technologies.some(tech => 
                tech.toLowerCase().includes(techFilter)
            )
        );
    }
    
    displayProjects(filteredProjects);
}

// Mostrar proyectos en la grid
function displayProjects(projects) {
    projectsGrid.innerHTML = '';
    
    if (projects.length === 0) {
        noProjects.style.display = 'block';
        return;
    }
    
    noProjects.style.display = 'none';
    
    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
}

// Crear tarjeta de proyecto
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.projectId = project._id;
    
    const technologiesTags = project.technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="project-actions">
            <button class="action-btn edit-btn" onclick="editProject('${project._id}')" title="Editar proyecto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="action-btn delete-btn" onclick="deleteProject('${project._id}')" title="Eliminar proyecto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        </div>
        <img src="${project.img}" alt="${project.name}" class="project-image" 
             onerror="this.src='https://via.placeholder.com/400x225?text=Imagen+no+disponible'">
        <div class="project-info">
            <h3 class="project-title">${project.name}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-technologies">
                ${technologiesTags}
            </div>
            <div class="project-section">${project.section}</div>
            <div class="project-links">
                <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link">
                    Ver Repositorio
                </a>
            </div>
        </div>
    `;
    
    return card;
}

// Actualizar título de la página
function updatePageTitle(section) {
    let title;
    
    switch(section) {
        case 'all':
            title = 'Todos los Proyectos';
            break;
        case 'Mobile':
            title = 'Proyectos Mobile';
            break;
        case 'LandingPage':
            title = 'Landing Pages';
            break;
        case 'Web App':
            title = 'Aplicaciones Web';
            break;
        case 'e-Commerce':
            title = 'Proyectos E-Commerce';
            break;
        case 'Games':
            title = 'Juegos';
            break;
        default:
            title = `Proyectos de ${section}`;
    }
    
    pageTitle.textContent = title;
}

// Mostrar/ocultar indicador de carga
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    projectsGrid.style.display = show ? 'none' : 'grid';
}

// Mostrar error
function showError(message) {
    projectsGrid.innerHTML = `
        <div class="error-message" style="grid-column: 1 / -1; text-align: center; color: #e74c3c; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="loadProjects()" class="btn btn-secondary" style="margin-top: 1rem;">Reintentar</button>
        </div>
    `;
}

// Funciones utilitarias para el manejo de URLs (para futuras mejoras)
function updateURL(section) {
    const url = section === 'all' ? '/' : `/section/${section}`;
    history.pushState({ section }, '', url);
}

// Manejar navegación del historial del navegador
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.section) {
        currentSection = event.state.section;
        updatePageTitle(currentSection);
        filterProjects();
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === currentSection) {
                link.classList.add('active');
            }
        });
    }
});

// Cargar clientes desde la API
async function loadClients() {
    try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
            throw new Error('Error al cargar clientes');
        }
        
        allClients = await response.json();
        populateClientSelect();
        
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

// Poblar el select de clientes
function populateClientSelect() {
    const clientSelect = document.getElementById('project-client');
    
    // Limpiar opciones existentes (excepto la primera)
    clientSelect.innerHTML = '<option value="">Sin cliente específico</option>';
    
    // Agregar clientes
    allClients.forEach(client => {
        const option = document.createElement('option');
        option.value = client._id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
    });
}

// Configurar modal y eventos del formulario
function setupModal() {
    // Abrir modal para agregar
    addProjectBtn.addEventListener('click', () => openModal());
    
    // Cerrar modal de proyecto
    closeModal.addEventListener('click', closeModalHandler);
    cancelBtn.addEventListener('click', closeModalHandler);
    
    // Cerrar modal al hacer clic fuera
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeModalHandler();
        }
    });
    
    // Manejar envío del formulario
    projectForm.addEventListener('submit', handleFormSubmit);
    
    // Modal de eliminación
    closeDeleteModal.addEventListener('click', closeDeleteModalHandler);
    cancelDeleteBtn.addEventListener('click', closeDeleteModalHandler);
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
    
    // Cerrar modal de eliminación al hacer clic fuera
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeDeleteModalHandler();
        }
    });
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (projectModal.style.display === 'block') {
                closeModalHandler();
            }
            if (deleteModal.style.display === 'block') {
                closeDeleteModalHandler();
            }
        }
    });
}

// Abrir modal para agregar proyecto
function openModal() {
    currentEditingProject = null;
    modalTitle.textContent = 'Agregar Nuevo Proyecto';
    submitBtn.textContent = 'Guardar Proyecto';
    
    projectModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Resetear formulario
    projectForm.reset();
    hideFormMessage();
    
    // Enfocar primer campo
    document.getElementById('project-name').focus();
}

// Abrir modal para editar proyecto
function openEditModal(project) {
    currentEditingProject = project;
    modalTitle.textContent = 'Editar Proyecto';
    submitBtn.textContent = 'Actualizar Proyecto';
    
    projectModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Llenar formulario con datos del proyecto
    fillFormWithProject(project);
    hideFormMessage();
    
    // Enfocar primer campo
    document.getElementById('project-name').focus();
}

// Llenar formulario con datos del proyecto
function fillFormWithProject(project) {
    document.getElementById('project-name').value = project.name;
    document.getElementById('project-description').value = project.description;
    document.getElementById('project-link').value = project.link;
    document.getElementById('project-img').value = project.img;
    document.getElementById('project-section').value = project.section;
    document.getElementById('project-technologies').value = project.technologies.join(', ');
    document.getElementById('project-client').value = project.clientId || '';
}

// Cerrar modal
function closeModalHandler() {
    projectModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaurar scroll del body
    
    // Resetear formulario
    projectForm.reset();
    hideFormMessage();
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        showFormLoading(true);
        hideFormMessage();
        
        // Recopilar datos del formulario
        const formData = new FormData(projectForm);
        const projectData = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            link: formData.get('link').trim(),
            img: formData.get('img').trim(),
            section: formData.get('section'),
            technologies: formData.get('technologies').split(',').map(tech => tech.trim()).filter(tech => tech),
            clientId: formData.get('clientId') || null
        };
        
        // Validar datos
        const validationErrors = validateProjectData(projectData);
        if (validationErrors.length > 0) {
            throw new Error('Errores de validación: ' + validationErrors.join(', '));
        }
        
        // Enviar a la API
        const isEditing = currentEditingProject !== null;
        const url = isEditing ? `/api/projects/${currentEditingProject._id}` : '/api/projects';
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || result.error || `Error al ${isEditing ? 'actualizar' : 'crear'} el proyecto`);
        }
        
        // Éxito
        const successMessage = isEditing ? '¡Proyecto actualizado exitosamente!' : '¡Proyecto creado exitosamente!';
        showFormMessage(successMessage, 'success');
        
        // Recargar proyectos
        await loadProjects();
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
            closeModalHandler();
        }, 1500);
        
    } catch (error) {
        console.error('Error creando proyecto:', error);
        showFormMessage(error.message, 'error');
    } finally {
        showFormLoading(false);
    }
}

// Validar datos del proyecto en el frontend
function validateProjectData(data) {
    const errors = [];
    
    if (!data.name || data.name.length < 3) {
        errors.push('El nombre debe tener al menos 3 caracteres');
    }
    
    if (!data.description || data.description.length < 10) {
        errors.push('La descripción debe tener al menos 10 caracteres');
    }
    
    if (!data.link || !isValidUrl(data.link)) {
        errors.push('El link debe ser una URL válida');
    }
    
    if (!data.img || !isValidUrl(data.img)) {
        errors.push('La imagen debe ser una URL válida');
    }
    
    if (!data.section) {
        errors.push('Debe seleccionar una sección');
    }
    
    if (!data.technologies || data.technologies.length === 0) {
        errors.push('Debe incluir al menos una tecnología');
    }
    
    return errors;
}

// Validar URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Mostrar/ocultar loading del formulario
function showFormLoading(show) {
    formLoading.style.display = show ? 'block' : 'none';
    projectForm.style.display = show ? 'none' : 'block';
    
    // Deshabilitar botones del modal
    const formButtons = projectForm.querySelectorAll('button');
    formButtons.forEach(btn => {
        btn.disabled = show;
    });
}

// Mostrar mensaje del formulario
function showFormMessage(message, type = 'info') {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
}

// Ocultar mensaje del formulario
function hideFormMessage() {
    formMessage.style.display = 'none';
}

// ========== FUNCIONES PARA EDITAR Y ELIMINAR ==========

// Función global para editar proyecto (llamada desde el HTML)
async function editProject(projectId) {
    try {
        // Obtener datos del proyecto
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
            throw new Error('Error al obtener datos del proyecto');
        }
        
        const project = await response.json();
        openEditModal(project);
        
    } catch (error) {
        console.error('Error editando proyecto:', error);
        alert('Error al cargar los datos del proyecto');
    }
}

// Función global para eliminar proyecto (llamada desde el HTML)
function deleteProject(projectId) {
    // Encontrar el proyecto en la lista actual
    const project = allProjects.find(p => p._id === projectId);
    if (!project) {
        alert('Proyecto no encontrado');
        return;
    }
    
    openDeleteModal(project);
}

// Abrir modal de confirmación de eliminación
function openDeleteModal(project) {
    currentDeletingProjectId = project._id;
    deleteProjectName.textContent = `"${project.name}"`;
    
    deleteModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    hideDeleteMessage();
}

// Cerrar modal de eliminación
function closeDeleteModalHandler() {
    deleteModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    currentDeletingProjectId = null;
    hideDeleteMessage();
}

// Confirmar eliminación del proyecto
async function handleDeleteConfirm() {
    if (!currentDeletingProjectId) return;
    
    try {
        showDeleteLoading(true);
        hideDeleteMessage();
        
        const response = await fetch(`/api/projects/${currentDeletingProjectId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || result.error || 'Error al eliminar el proyecto');
        }
        
        // Éxito
        showDeleteMessage('¡Proyecto eliminado exitosamente!', 'success');
        
        // Recargar proyectos
        await loadProjects();
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
            closeDeleteModalHandler();
        }, 1500);
        
    } catch (error) {
        console.error('Error eliminando proyecto:', error);
        showDeleteMessage(error.message, 'error');
    } finally {
        showDeleteLoading(false);
    }
}

// Mostrar/ocultar loading del modal de eliminación
function showDeleteLoading(show) {
    deleteLoading.style.display = show ? 'block' : 'none';
    
    // Deshabilitar botones
    cancelDeleteBtn.disabled = show;
    confirmDeleteBtn.disabled = show;
}

// Mostrar mensaje del modal de eliminación
function showDeleteMessage(message, type = 'info') {
    deleteMessage.textContent = message;
    deleteMessage.className = `form-message ${type}`;
    deleteMessage.style.display = 'block';
}

// Ocultar mensaje del modal de eliminación
function hideDeleteMessage() {
    deleteMessage.style.display = 'none';
}
