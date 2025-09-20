const express = require('express');
const projectRoutes = require('./projectRoutes');
const clientRoutes = require('./clientRoutes');

const router = express.Router();

// Registrar todas las rutas de la API
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);

// Ruta de bienvenida para la API
router.get('/', (req, res) => {
    res.json({
        message: 'API Portfolio - Parcial 1',
        version: '2.0.0',
        endpoints: {
            projects: {
                'GET /api/projects': 'Obtener todos los proyectos (filtros: section, technology)',
                'GET /api/projects/:id': 'Obtener proyecto por ID',
                'GET /api/projects/stats': 'Estadísticas de proyectos',
                'POST /api/projects': 'Crear nuevo proyecto',
                'PUT /api/projects/:id': 'Actualizar proyecto',
                'DELETE /api/projects/:id': 'Eliminar proyecto'
            },
            clients: {
                'GET /api/clients': 'Obtener todos los clientes (filtro: name)',
                'GET /api/clients/:id': 'Obtener cliente por ID',
                'GET /api/clients/stats': 'Estadísticas de clientes',
                'GET /api/clients/:id/projects': 'Obtener proyectos de un cliente',
                'POST /api/clients': 'Crear nuevo cliente',
                'PUT /api/clients/:id': 'Actualizar cliente',
                'DELETE /api/clients/:id': 'Eliminar cliente'
            }
        },
        architecture: 'MVC (Model-View-Controller)',
        database: 'MongoDB Atlas'
    });
});

module.exports = router;
