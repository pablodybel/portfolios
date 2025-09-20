const { getDatabase } = require('../database');
const { ObjectId } = require('mongodb');

class Client {
    constructor() {
        this.collection = 'Clients';
    }

    // Obtener todos los clientes
    async findAll() {
        try {
            const db = getDatabase();
            return await db.collection(this.collection).find({}).toArray();
        } catch (error) {
            throw new Error(`Error obteniendo clientes: ${error.message}`);
        }
    }

    // Obtener un cliente por ID
    async findById(id) {
        try {
            const db = getDatabase();
            
            if (!ObjectId.isValid(id)) {
                throw new Error('ID de cliente inválido');
            }
            
            return await db.collection(this.collection).findOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw new Error(`Error obteniendo cliente: ${error.message}`);
        }
    }

    // Crear un nuevo cliente
    async create(clientData) {
        try {
            const db = getDatabase();
            
            // Validar campos requeridos
            const requiredFields = ['name', 'photo', 'description'];
            for (const field of requiredFields) {
                if (!clientData[field]) {
                    throw new Error(`El campo ${field} es requerido`);
                }
            }

            // Validar datos
            const validationErrors = this.validateClientData(clientData);
            if (validationErrors.length > 0) {
                throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
            }
            
            const client = {
                ...clientData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const result = await db.collection(this.collection).insertOne(client);
            return { _id: result.insertedId, ...client };
        } catch (error) {
            throw new Error(`Error creando cliente: ${error.message}`);
        }
    }

    // Actualizar un cliente
    async update(id, updateData) {
        try {
            const db = getDatabase();
            
            if (!ObjectId.isValid(id)) {
                throw new Error('ID de cliente inválido');
            }

            // Validar datos si se proporcionan
            if (Object.keys(updateData).length > 0) {
                const validationErrors = this.validateClientData(updateData, false);
                if (validationErrors.length > 0) {
                    throw new Error(`Errores de validación: ${validationErrors.join(', ')}`);
                }
            }
            
            const updatedClient = {
                ...updateData,
                updatedAt: new Date()
            };
            
            const result = await db.collection(this.collection).updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedClient }
            );
            
            if (result.matchedCount === 0) {
                throw new Error('Cliente no encontrado');
            }
            
            return result;
        } catch (error) {
            throw new Error(`Error actualizando cliente: ${error.message}`);
        }
    }

    // Eliminar un cliente
    async delete(id) {
        try {
            const db = getDatabase();
            
            if (!ObjectId.isValid(id)) {
                throw new Error('ID de cliente inválido');
            }
            
            // Verificar si el cliente tiene proyectos asociados
            const hasProjects = await this.hasAssociatedProjects(id);
            if (hasProjects) {
                throw new Error('No se puede eliminar el cliente porque tiene proyectos asociados');
            }
            
            const result = await db.collection(this.collection).deleteOne({ _id: new ObjectId(id) });
            
            if (result.deletedCount === 0) {
                throw new Error('Cliente no encontrado');
            }
            
            return result;
        } catch (error) {
            throw new Error(`Error eliminando cliente: ${error.message}`);
        }
    }

    // Verificar si el cliente existe
    async exists(id) {
        try {
            const db = getDatabase();
            
            if (!ObjectId.isValid(id)) {
                return false;
            }
            
            const client = await db.collection(this.collection).findOne({ _id: new ObjectId(id) });
            return client !== null;
        } catch (error) {
            throw new Error(`Error verificando existencia del cliente: ${error.message}`);
        }
    }

    // Verificar si el cliente tiene proyectos asociados
    async hasAssociatedProjects(clientId) {
        try {
            const db = getDatabase();
            
            if (!ObjectId.isValid(clientId)) {
                return false;
            }
            
            const projectCount = await db.collection('Projects').countDocuments({ 
                clientId: new ObjectId(clientId) 
            });
            
            return projectCount > 0;
        } catch (error) {
            throw new Error(`Error verificando proyectos asociados: ${error.message}`);
        }
    }

    // Buscar clientes por nombre
    async findByName(name) {
        try {
            const db = getDatabase();
            return await db.collection(this.collection).find({
                name: { $regex: name, $options: 'i' }
            }).toArray();
        } catch (error) {
            throw new Error(`Error buscando clientes: ${error.message}`);
        }
    }

    // Validar datos del cliente
    validateClientData(data, requireAll = true) {
        const errors = [];
        
        if (requireAll || data.name !== undefined) {
            if (!data.name || data.name.trim().length < 2) {
                errors.push('El nombre debe tener al menos 2 caracteres');
            }
        }
        
        if (requireAll || data.photo !== undefined) {
            if (!data.photo || !this.isValidUrl(data.photo)) {
                errors.push('La foto debe ser una URL válida');
            }
        }
        
        if (requireAll || data.description !== undefined) {
            if (!data.description || data.description.trim().length < 10) {
                errors.push('La descripción debe tener al menos 10 caracteres');
            }
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

module.exports = Client;
