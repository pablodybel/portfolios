const express = require('express');
const ClientController = require('../controllers/clientController');

const router = express.Router();
const clientController = new ClientController();

// Rutas para clientes
router.get('/', (req, res) => clientController.getAllClients(req, res));
router.get('/stats', (req, res) => clientController.getClientStats(req, res));
router.get('/:id', (req, res) => clientController.getClientById(req, res));
router.get('/:id/projects', (req, res) => clientController.getClientProjects(req, res));
router.post('/', (req, res) => clientController.createClient(req, res));
router.put('/:id', (req, res) => clientController.updateClient(req, res));
router.delete('/:id', (req, res) => clientController.deleteClient(req, res));

module.exports = router;
