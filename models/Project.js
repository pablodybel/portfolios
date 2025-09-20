const { getDatabase } = require('../database');
const { ObjectId } = require('mongodb');

class Project {
    constructor() {
        this.collection = 'Projects';
    }

    // Obtener todos los proyectos con filtros opcionales
    async findAll(filters = {}) {
        try {
            const db = getDatabase();
            const { section, technology } = filters;
            
            let query = {};
            
            if (section) {
                query.section = { $regex: section, $options: 'i' };
            }
            
            if (technology) {
                query.technologies = { $regex: technology, $options: 'i' };
            }
            
            return await db.collection(this.collection).find(query).toArray();
        } catch (error) {
            throw new Error(`Error obteniendo proyectos: ${error.message}`);
        }
    }

    // Obtener un proyecto por ID
    async findById(id) {
        try {
            const db = getDatabase();
            
            if (!ObjectId.isValid(id)) {
                throw new Error('ID de proyecto inválido');
            }
            
            return await db.collection(this.collection).findOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw new Error(`Error obteniendo proyecto: ${error.message}`);
        }
    }

    // Crear un nuevo proyecto
    async create(projectData) {
        try {
            const db = getDatabase();
            
            // Validar campos requeridos
            const requiredFields = ['name', 'description', 'link', 'img', 'technologies', 'section'];
            for (const field of requiredFields) {
                if (!projectData[field]) {
                    throw new Error(`El campo ${field} es requerido`);
                }
            }
            
            const project = {
                ...projectData,
                clientId: projectData.clientId ? new ObjectId(projectData.clientId) : null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const result = await db.collection(this.collection).insertOne(project);
            return { _id: result.insertedId, ...project };
        } catch (error) {
            throw new Error(`Error creando proyecto: ${error.message}`);
        }
    }

    // Actualizar un proyecto
    async update(id, updateData) {
        try {
            const db = getDatabase();
            
            if (!ObjectId.isValid(id)) {
                throw new Error('ID de proyecto inválido');
            }
            
            const updatedProject = {
                ...updateData,
                clientId: updateData.clientId ? new ObjectId(updateData.clientId) : null,
                updatedAt: new Date()
            };
            
            const result = await db.collection(this.collection).updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedProject }
            );
            
            if (result.matchedCount === 0) {
                throw new Error('Proyecto no encontrado');
            }
            
            return result;
        } catch (error) {
            throw new Error(`Error actualizando proyecto: ${error.message}`);
        }
    }

    // Eliminar un proyecto
    async delete(id) {
        try {
            const db = getDatabase();
            
            if (!ObjectId.isValid(id)) {
                throw new Error('ID de proyecto inválido');
            }
            
            const result = await db.collection(this.collection).deleteOne({ _id: new ObjectId(id) });
            
            if (result.deletedCount === 0) {
                throw new Error('Proyecto no encontrado');
            }
            
            return result;
        } catch (error) {
            throw new Error(`Error eliminando proyecto: ${error.message}`);
        }
    }

    // Obtener proyectos por cliente
    async findByClientId(clientId) {
        try {
            const db = getDatabase();
            
            if (!ObjectId.isValid(clientId)) {
                throw new Error('ID de cliente inválido');
            }
            
            return await db.collection(this.collection).find({ 
                clientId: new ObjectId(clientId) 
            }).toArray();
        } catch (error) {
            throw new Error(`Error obteniendo proyectos del cliente: ${error.message}`);
        }
    }

    // Validar datos del proyecto
    validateProjectData(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }
        
        if (!data.description || data.description.trim().length < 10) {
            errors.push('La descripción debe tener al menos 10 caracteres');
        }
        
        if (!data.link || !this.isValidUrl(data.link)) {
            errors.push('El link debe ser una URL válida');
        }
        
        if (!data.img || !this.isValidUrl(data.img)) {
            errors.push('La imagen debe ser una URL válida');
        }
        
        if (!data.technologies || !Array.isArray(data.technologies) || data.technologies.length === 0) {
            errors.push('Debe incluir al menos una tecnología');
        }
        
        if (!data.section || data.section.trim().length === 0) {
            errors.push('La sección es requerida');
        }
        
        return errors;
    }

    // Validar URL
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

module.exports = Project;
