const { MongoClient } = require('mongodb');
const config = require('./config');

let db;

async function connectToDatabase() {
    try {
        const client = new MongoClient(config.MONGODB_URI);
        await client.connect();
        console.log('Conectado a MongoDB Atlas');
        db = client.db(config.DB_NAME);
        return db;
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        process.exit(1);
    }
}

function getDatabase() {
    if (!db) {
        throw new Error('Base de datos no inicializada. Llama primero a connectToDatabase()');
    }
    return db;
}

module.exports = {
    connectToDatabase,
    getDatabase
};
