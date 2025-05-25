const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Configuration CORS plus permissive pour le développement
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Base de données en mémoire pour les tâches
let tasks = [
    { id: 1, title: "Apprendre Express.js", completed: false },
    { id: 2, title: "Créer une API REST", completed: false }
];

// Variable pour générer des IDs uniques
let nextId = 3;

/**
 * Middleware de gestion d'erreur global
 */
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

/**
 * Middleware pour vérifier l'existence d'une tâche
 */
const checkTaskExists = (req, res, next) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ 
      error: `Tâche avec l'ID ${taskId} non trouvée` 
    });
  }
  
  req.task = task;
  next();
};

// GET /api/tasks - Récupérer toutes les tâches
app.get('/api/tasks', (req, res) => {
  try {
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des tâches' 
    });
  }
});

// POST /api/tasks - Créer une nouvelle tâche
app.post('/api/tasks', (req, res) => {
  try {
    const { title } = req.body;
    
    // Validation du titre
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        error: "Le titre est requis et ne peut pas être vide" 
      });
    }

    if (title.length < 3) {
      return res.status(400).json({ 
        error: "Le titre doit contenir au moins 3 caractères" 
      });
    }

    // Création de la nouvelle tâche
    const newTask = {
      id: nextId++,
      title: title.trim(),
      completed: false
    };

    // Ajout de la tâche à la liste
    tasks.push(newTask);

    // Retourne la nouvelle tâche avec le code 201 (Created)
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la création de la tâche' 
    });
  }
});

// PUT /api/tasks/:id - Mettre à jour une tâche
app.put('/api/tasks/:id', checkTaskExists, (req, res) => {
  try {
    const task = req.task;
    const { title, completed } = req.body;

    // Validation du titre si fourni
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ 
          error: "Le titre ne peut pas être vide" 
        });
      }

      if (title.length < 3) {
        return res.status(400).json({ 
          error: "Le titre doit contenir au moins 3 caractères" 
        });
      }

      // Mise à jour du titre
      task.title = title.trim();
    }

    // Validation et mise à jour du statut si fourni
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ 
          error: "Le statut 'completed' doit être un booléen" 
        });
      }
      task.completed = completed;
    }

    // Retourne la tâche mise à jour
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de la tâche' 
    });
  }
});

// DELETE /api/tasks/:id - Supprimer une tâche
app.delete('/api/tasks/:id', checkTaskExists, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    // Suppression de la tâche
    tasks.splice(taskIndex, 1);

    // Retourne un message de succès
    res.status(200).json({ 
      message: "Tâche supprimée avec succès",
      id: taskId
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de la tâche' 
    });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Port configuration
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log('Routes disponibles:');
  console.log('- GET    /api/tasks');
  console.log('- POST   /api/tasks');
  console.log('- PUT    /api/tasks/:id');
  console.log('- DELETE /api/tasks/:id');
});
