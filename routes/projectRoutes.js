const express = require('express');
const ProjectController = require('../controllers/projectController');

const router = express.Router();
const projectController = new ProjectController();

// Rutas para proyectos
router.get('/', (req, res) => projectController.getAllProjects(req, res));
router.get('/stats', (req, res) => projectController.getProjectStats(req, res));
router.get('/:id', (req, res) => projectController.getProjectById(req, res));
router.post('/', (req, res) => projectController.createProject(req, res));
router.put('/:id', (req, res) => projectController.updateProject(req, res));
router.delete('/:id', (req, res) => projectController.deleteProject(req, res));

module.exports = router;
