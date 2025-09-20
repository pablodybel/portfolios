const { MongoClient } = require('mongodb');
const fs = require('fs');
const config = require('./config');

async function loadData() {
    const client = new MongoClient(config.MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Conectado a MongoDB Atlas');
        
        const db = client.db(config.DB_NAME);
        
        // Leer datos del archivo JSON
        const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
        
        // Limpiar colecciones existentes
        await db.collection('Projects').deleteMany({});
        await db.collection('Clients').deleteMany({});
        console.log('Colecciones limpiadas');
        
        // Insertar clientes
        if (data.clients && data.clients.length > 0) {
            const clientsResult = await db.collection('Clients').insertMany(data.clients);
            console.log(`${clientsResult.insertedCount} clientes insertados`);
            
            // Obtener IDs de clientes insertados
            const clientIds = Object.values(clientsResult.insertedIds);
            
            // Asignar clientes aleatoriamente a algunos proyectos
            const updatedProjects = data.projects.map((project, index) => {
                // Asignar cliente a algunos proyectos (no todos)
                if (index < clientIds.length) {
                    return {
                        ...project,
                        clientId: clientIds[index]
                    };
                }
                return project;
            });
            
            // Insertar proyectos con relaciones a clientes
            if (updatedProjects.length > 0) {
                const projectsResult = await db.collection('Projects').insertMany(updatedProjects);
                console.log(`${projectsResult.insertedCount} proyectos insertados`);
            }
        } else {
            // Insertar solo proyectos si no hay clientes
            if (data.projects && data.projects.length > 0) {
                const projectsResult = await db.collection('Projects').insertMany(data.projects);
                console.log(`${projectsResult.insertedCount} proyectos insertados`);
            }
        }
        
        console.log('Datos cargados exitosamente');
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    } finally {
        await client.close();
    }
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
    loadData();
}

module.exports = { loadData };
