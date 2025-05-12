const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Color = require('../models/Color');
const Size = require('../models/Size');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Get all products
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};

        // Filter by category
        if (req.query.category_id) {
            filter.category_id = req.query.category_id;
        }

        // Filter by price range
        if (req.query.min_price || req.query.max_price) {
            filter.price = {};
            if (req.query.min_price) filter.price.$gte = parseFloat(req.query.min_price);
            if (req.query.max_price) filter.price.$lte = parseFloat(req.query.max_price);
        }

        // Filter by tags
        if (req.query.tags) {
            const tags = req.query.tags.split(',');
            filter.tags = { $in: tags };
        }

        // Search by name
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        // Get products with pagination
        const products = await Product.find(filter)
            .populate('category_id', 'name')
            .populate('attributes.color_id', 'name')
            .populate('attributes.size_id', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
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
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category_id,
            SKU,
            qty_in_stock,
            tags,
            attributes
        } = req.body;

        // Validate input
        if (!name || !price || !category_id || !SKU || qty_in_stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Validate attributes
        if (attributes && attributes.length > 0) {
            for (const attr of attributes) {
                if (!attr.color_id || !attr.size_id || attr.qty_in_stock === undefined || attr.price === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: 'Mỗi attribute phải có đầy đủ color_id, size_id, qty_in_stock và price'
                    });
                }
            }
        }

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ SKU });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'SKU đã tồn tại'
            });
        }

        const product = new Product({
            name,
            description,
            price,
            category_id,
            SKU,
            qty_in_stock,
            tags: tags || [],
            attributes: attributes || []
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
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        // Validate input
        if (!name || !description || !price || !category || !image) {
            return res.status(400).json({
                success: false,
                message: error.message
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
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
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

// http://localhost:5000/api/v1/products/get/count
router.get('/get/count', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.status(200).json({ productCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

module.exports = router;
