const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./database');
const config = require('./config');

// Importar rutas
const apiRoutes = require('./routes/index');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Conectar a la base de datos
connectToDatabase();

// Rutas de la API - Usando arquitectura MVC
app.use('/api', apiRoutes);

// Rutas del frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/section/:sectionName', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'section.html'));
});

// Iniciar servidor
const PORT = config.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
