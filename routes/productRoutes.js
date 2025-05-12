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
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Tạo query options
        const queryOptions = {
            skip,
            limit,
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

        // Thực hiện query với pagination
        const [products, total] = await Promise.all([
            Product.find()
                .skip(queryOptions.skip)
                .limit(queryOptions.limit)
                .populate(queryOptions.populate),
            Product.countDocuments()
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
