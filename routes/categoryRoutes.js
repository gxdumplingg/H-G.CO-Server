const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categoryList = await Category.find();
        res.status(200).send(categoryList);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).send(category);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create new category
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        let category = new Category({
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        });

        category = await category.save();
        res.status(201).send(category);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update category
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                icon: req.body.icon,
                color: req.body.color
            },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).send(category);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete category
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (category) {
            return res.status(200).json({ success: true, message: 'Category deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router; 