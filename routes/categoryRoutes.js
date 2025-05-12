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
            category_name: req.body.category_name,
            description: req.body.description,
            parent_category_id: req.body.parent_category_id || null
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
                category_name: req.body.category_name,
                description: req.body.description,
                parent_category_id: req.body.parent_category_id
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