const Project = require('../models/Project');

class ProjectController {
    constructor() {
        this.projectModel = new Project();
    }

    // Obtener todos los proyectos
    async getAllProjects(req, res) {
        try {
            const { section, technology } = req.query;
            const filters = {};
            
            if (section) filters.section = section;
            if (technology) filters.technology = technology;
            
            const projects = await this.projectModel.findAll(filters);
            
            res.status(200).json(projects);
        } catch (error) {
            console.error('Error en getAllProjects:', error.message);
            res.status(500).json({ 
                error: 'Error interno del servidor', 
                message: error.message 
            });
        }
    }

    // Obtener un proyecto por ID
    async getProjectById(req, res) {
        try {
            const { id } = req.params;
            const project = await this.projectModel.findById(id);
            
            if (!project) {
                return res.status(404).json({ 
                    error: 'Proyecto no encontrado' 
                });
            }
            
            res.status(200).json(project);
        } catch (error) {
            console.error('Error en getProjectById:', error.message);
            
            if (error.message.includes('inválido')) {
                return res.status(400).json({ 
                    error: 'ID de proyecto inválido' 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor', 
                message: error.message 
            });
        }
    }

    // Crear un nuevo proyecto
    async createProject(req, res) {
        try {
            const projectData = req.body;
            
            // Validar datos del proyecto
            const validationErrors = this.projectModel.validateProjectData(projectData);
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    error: 'Errores de validación', 
                    details: validationErrors 
                });
            }
            
            const newProject = await this.projectModel.create(projectData);
            
            res.status(201).json({
                message: 'Proyecto creado exitosamente',
                project: newProject
            });
        } catch (error) {
            console.error('Error en createProject:', error.message);
            
            if (error.message.includes('requerido') || error.message.includes('validación')) {
                return res.status(400).json({ 
                    error: 'Datos inválidos', 
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor', 
                message: error.message 
            });
        }
    }

    // Actualizar un proyecto
    async updateProject(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Validar datos si se proporcionan
            if (Object.keys(updateData).length > 0) {
                const validationErrors = this.projectModel.validateProjectData(updateData);
                if (validationErrors.length > 0) {
                    return res.status(400).json({ 
                        error: 'Errores de validación', 
                        details: validationErrors 
                    });
                }
            }
            
            await this.projectModel.update(id, updateData);
            
            res.status(200).json({
                message: 'Proyecto actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error en updateProject:', error.message);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ 
                    error: 'Proyecto no encontrado' 
                });
            }
            
            if (error.message.includes('inválido') || error.message.includes('validación')) {
                return res.status(400).json({ 
                    error: 'Datos inválidos', 
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor', 
                message: error.message 
            });
        }
    }

    // Eliminar un proyecto
    async deleteProject(req, res) {
        try {
            const { id } = req.params;
            
            await this.projectModel.delete(id);
            
            res.status(200).json({
                message: 'Proyecto eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error en deleteProject:', error.message);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ 
                    error: 'Proyecto no encontrado' 
                });
            }
            
            if (error.message.includes('inválido')) {
                return res.status(400).json({ 
                    error: 'ID de proyecto inválido' 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor', 
                message: error.message 
            });
        }
    }

    // Obtener proyectos por cliente
    async getProjectsByClient(req, res) {
        try {
            const { clientId } = req.params;
            
            // Verificar que el cliente existe
            const Client = require('../models/Client');
            const clientModel = new Client();
            const clientExists = await clientModel.exists(clientId);
            
            if (!clientExists) {
                return res.status(404).json({ 
                    error: 'Cliente no encontrado' 
                });
            }
            
            const projects = await this.projectModel.findByClientId(clientId);
            
            res.status(200).json(projects);
        } catch (error) {
            console.error('Error en getProjectsByClient:', error.message);
            
            if (error.message.includes('inválido')) {
                return res.status(400).json({ 
                    error: 'ID de cliente inválido' 
                });
            }
            
            res.status(500).json({ 
                error: 'Error interno del servidor', 
                message: error.message 
            });
        }
    }

    // Obtener estadísticas de proyectos
    async getProjectStats(req, res) {
        try {
            const projects = await this.projectModel.findAll();
            
            const stats = {
                total: projects.length,
                bySection: {},
                byTechnology: {},
                withClients: projects.filter(p => p.clientId).length,
                withoutClients: projects.filter(p => !p.clientId).length
            };
            
            // Estadísticas por sección
            projects.forEach(project => {
                stats.bySection[project.section] = (stats.bySection[project.section] || 0) + 1;
            });
            
            // Estadísticas por tecnología
            projects.forEach(project => {
                project.technologies.forEach(tech => {
                    stats.byTechnology[tech] = (stats.byTechnology[tech] || 0) + 1;
                });
            });
            
            res.status(200).json(stats);
        } catch (error) {
            console.error('Error en getProjectStats:', error.message);
            res.status(500).json({ 
                error: 'Error interno del servidor', 
                message: error.message 
            });
        }
    }
}

module.exports = ProjectController;
