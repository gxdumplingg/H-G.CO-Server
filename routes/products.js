const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isAuth, isAdmin } = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi lấy danh sách sản phẩm',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy sản phẩm' 
            });
        }
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi lấy thông tin sản phẩm',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Create product (admin only)
router.post('/', isAuth, isAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        // Validate input
        if (!name || !description || !price || !category || !image) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin sản phẩm' 
            });
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            image,
            stock: stock || 0
        });

        await product.save();
        res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm thành công',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi thêm sản phẩm',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update product (admin only)
router.put('/:id', isAuth, isAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        // Validate input
        if (!name || !description || !price || !category || !image) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin sản phẩm' 
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                price,
                category,
                image,
                stock: stock || 0
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy sản phẩm' 
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi cập nhật sản phẩm',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete product (admin only)
router.delete('/:id', isAuth, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy sản phẩm' 
            });
        }
        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi xóa sản phẩm',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 