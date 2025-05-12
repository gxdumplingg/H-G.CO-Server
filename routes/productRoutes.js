const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductImage = require('../models/ProductImage');
const mongoose = require('mongoose');
const productController = require('../controllers/productController');


// Get all products
router.get('/', async (req, res) => {
    try {
        // Lấy các tham số từ query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        // Xử lý sort
        const sortField = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        // Validate sort field
        const allowedSortFields = ['name', 'price', 'createdAt', 'qty_in_stock'];
        if (!allowedSortFields.includes(sortField)) {
            return res.status(400).json({
                success: false,
                message: `Invalid sort field. Allowed fields: ${allowedSortFields.join(', ')}`
            });
        }

        // Tạo sort object
        const sortOptions = {
            [sortField]: sortOrder
        };

        // Xử lý filter
        const filter = {};

        // Filter theo category
        if (req.query.category) {
            filter.category_id = req.query.category;
        }

        // Filter theo màu
        if (req.query.color) {
            filter['attributes.color_id'] = req.query.color;
        }

        // Filter theo giá
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) {
                filter.price.$gte = parseInt(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filter.price.$lte = parseInt(req.query.maxPrice);
            }
        }

        // Tạo query options
        const queryOptions = {
            skip,
            limit,
            sort: sortOptions,
            populate: [
                { path: 'category_id', select: 'name' },
                { path: 'main_image' },
                { path: 'variant_images' },
                {
                    path: 'attributes',
                    populate: [
                        { path: 'color_id', select: 'name color_code' },
                        { path: 'size_id', select: 'name' }
                    ]
                }
            ]
        };

        // Thực hiện query với pagination, sort và filter
        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(queryOptions.sort)
                .skip(queryOptions.skip)
                .limit(queryOptions.limit)
                .populate(queryOptions.populate),
            Product.countDocuments(filter)
        ]);

        // Tính toán thông tin pagination
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage,
                hasPrevPage
            },
            sort: {
                field: sortField,
                order: sortOrder === 1 ? 'asc' : 'desc'
            },
            filter: {
                category: req.query.category || null,
                color: req.query.color || null,
                priceRange: {
                    min: req.query.minPrice || null,
                    max: req.query.maxPrice || null
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
router.get('/tags', productController.getProductsByTags);

// Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category_id', 'name')
            .populate('main_image')
            .populate('variant_images')
            .populate({
                path: 'attributes',
                populate: [
                    { path: 'color_id', select: 'name color_code' },
                    { path: 'size_id', select: 'name' }
                ]
            });

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
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const category_id = await Category.findById(req.body.category_id);
        if (!category_id) {
            return res.status(400).send('Invalid category');
        }
        const product = new Product({
            category_id: req.body.category_id,
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            SKU: req.body.SKU,
            qty_in_stock: req.body.qty_in_stock,
            product_images: req.body.product_images,
            attributes: req.body.attributes // dạng array
        });

        const savedProduct = await product.save();
        res.status(201).send(savedProduct);

    } catch (err) {
        console.error('Lỗi tạo product:', err);
        res.status(500).send({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send('Invalid product ID');
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            category_id: req.body.category_id,
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            SKU: req.body.SKU,
            qty_in_stock: req.body.qty_in_stock,
            product_images: req.body.product_images,
            attributes: req.body.attributes // dạng array
        },
        { new: true } // new: true để trả về bản cập nhật mới nhất
    );
    if (!product) {
        return res.status(500).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product updated successfully' });
});


router.delete('/:id', async (req, res) => {
    Product.findByIdAndDelete(req.params.id).then((product) => {
        if (product) {
            return res.status(200).json({ success: true, message: 'Product deleted successfully' });
        }
        else {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
    }).catch((err) => {
        return res.status(400).json({ success: false, error: err });
    })
});

router.get('/get/count', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.status(200).json({ productCount });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

module.exports = router;
