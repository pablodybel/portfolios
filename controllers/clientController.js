const Client = require('../models/Client');

class ClientController {
    constructor() {
        this.clientModel = new Client();
    }

    // Obtener todos los clientes
    async getAllClients(req, res) {
        try {
            const { name } = req.query;
            let clients;
            
            if (name) {
                clients = await this.clientModel.findByName(name);
            } else {
                clients = await this.clientModel.findAll();
            }
            
            res.status(200).json(clients);
        } catch (error) {
            console.error('Error en getAllClients:', error.message);
            res.status(500).json({ 
                error: 'Error interno del servidor', 
                message: error.message 
            });
        }
    }

    // Obtener un cliente por ID
    async getClientById(req, res) {
        try {
            const { id } = req.params;
            const client = await this.clientModel.findById(id);
            
            if (!client) {
                return res.status(404).json({ 
                    error: 'Cliente no encontrado' 
                });
            }
            
            res.status(200).json(client);
        } catch (error) {
            console.error('Error en getClientById:', error.message);
            
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

    // Crear un nuevo cliente
    async createClient(req, res) {
        try {
            const clientData = req.body;
            
            // Validar datos del cliente
            const validationErrors = this.clientModel.validateClientData(clientData);
            if (validationErrors.length > 0) {
                return res.status(400).json({ 
                    error: 'Errores de validación', 
                    details: validationErrors 
                });
            }
            
            const newClient = await this.clientModel.create(clientData);
            
            res.status(201).json({
                message: 'Cliente creado exitosamente',
                client: newClient
            });
        } catch (error) {
            console.error('Error en createClient:', error.message);
            
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

    // Actualizar un cliente
    async updateClient(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Validar datos si se proporcionan
            if (Object.keys(updateData).length > 0) {
                const validationErrors = this.clientModel.validateClientData(updateData, false);
                if (validationErrors.length > 0) {
                    return res.status(400).json({ 
                        error: 'Errores de validación', 
                        details: validationErrors 
                    });
                }
            }
            
            await this.clientModel.update(id, updateData);
            
            res.status(200).json({
                message: 'Cliente actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error en updateClient:', error.message);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ 
                    error: 'Cliente no encontrado' 
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

    // Eliminar un cliente
    async deleteClient(req, res) {
        try {
            const { id } = req.params;
            
            await this.clientModel.delete(id);
            
            res.status(200).json({
                message: 'Cliente eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error en deleteClient:', error.message);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ 
                    error: 'Cliente no encontrado' 
                });
            }
            
            if (error.message.includes('proyectos asociados')) {
                return res.status(400).json({ 
                    error: 'No se puede eliminar el cliente porque tiene proyectos asociados' 
                });
            }
            
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

    // Obtener proyectos de un cliente
    async getClientProjects(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que el cliente existe
            const clientExists = await this.clientModel.exists(id);
            if (!clientExists) {
                return res.status(404).json({ 
                    error: 'Cliente no encontrado' 
                });
            }
            
            // Usar el modelo de Project para obtener los proyectos
            const Project = require('../models/Project');
            const projectModel = new Project();
            const projects = await projectModel.findByClientId(id);
            
            res.status(200).json(projects);
        } catch (error) {
            console.error('Error en getClientProjects:', error.message);
            
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

    // Obtener estadísticas de clientes
    async getClientStats(req, res) {
        try {
            const clients = await this.clientModel.findAll();
            
            const stats = {
                total: clients.length,
                createdThisMonth: 0,
                withProjects: 0,
                withoutProjects: 0
            };
            
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            for (const client of clients) {
                // Clientes creados este mes
                if (client.createdAt) {
                    const clientDate = new Date(client.createdAt);
                    if (clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear) {
                        stats.createdThisMonth++;
                    }
                }
                
                // Clientes con/sin proyectos
                const hasProjects = await this.clientModel.hasAssociatedProjects(client._id.toString());
                if (hasProjects) {
                    stats.withProjects++;
                } else {
                    stats.withoutProjects++;
                }
            }
            
            res.status(200).json(stats);
        } catch (error) {
            console.error('Error en getClientStats:', error.message);
            res.status(500).json({ 
                error: 'Error interno del servidor', 
                message: error.message 
            });
        }
    }
}

module.exports = ClientController;
