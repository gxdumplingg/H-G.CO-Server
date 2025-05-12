const Category = require('../models/Category');
const express = require('express');
const router = express.Router();

// http://localhost:5000/api/categories/
router.get('/', async (req, res) => {
    const categoryList = await Category.find();
    if (!categoryList) {
        res.status(500).json({ success: false });
    }
    res.status(200).send(categoryList);

});

// http://localhost:5000/api/v1categories/:id
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(500).json({ success: false, message: 'Category not found' });
    }
    res.status(200).send(category);
});

// http://localhost:5000/api/v1/categories/
router.post('/', async (req, res) => {
    try {
        const category = new Category({
            category_name: req.body.category_name,
            description: req.body.description,
            parent_category_id: req.body.parent_category_id || null
        });

        const savedCategory = await category.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(400).json({ message: 'Error creating category', error });
    }
});
// http://localhost:5000/api/v1/categories/:id
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            category_name: req.body.category_name,
            description: req.body.description,
            parent_category_id: req.body.parent_category_id || null
        },
        { new: true } // new: true để trả về bản cập nhật mới nhất
    );
    if (!category) {
        return res.status(500).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category updated successfully' });
})
// http://localhost:5000/api/v1/categories/:id
router.delete('/:categoryId', async (req, res) => {
    Category.findByIdAndDelete(req.params.categoryId).then((category) => {
        if (category) {
            return res.status(200).json({ success: true, message: 'Category deleted successfully' });
        }
        else {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
    }).catch((err) => {
        return res.status(400).json({ success: false, error: err });
    })
});



module.exports = router;