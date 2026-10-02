const express = require('express');
const router = express.Router();

const { createCategory, getCategory, updateCategory, getCategoryById, deleteCategory } = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all
router.get('/', authMiddleware, getCategory);

// Create
router.post('/', authMiddleware, createCategory);

// Get by ID
router.get('/:id', authMiddleware, getCategoryById);

// Update
router.put('/:id', authMiddleware, updateCategory);

// Delete
router.delete('/:id', authMiddleware, deleteCategory);


module.exports = router;
