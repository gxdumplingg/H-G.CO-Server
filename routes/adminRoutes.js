const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');

// Get dashboard stats
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const recentOrders = await Order.find()
            .populate('user', 'username email_address')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thống kê dashboard'
        });
    }
});

// Thêm endpoint dashboard/stats để tương thích
router.get('/dashboard/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Tính số lượng sản phẩm theo danh mục
        const categories = await Category.find();
        const categoryStats = await Promise.all(
            categories.map(async (category) => {
                const count = await Product.countDocuments({ category_id: category._id });
                return {
                    _id: category._id,
                    name: category.name,
                    count
                };
            })
        );

        // Lấy đơn hàng gần đây
        const recentOrders = await Order.find()
            .populate('user', 'username email_address')
            .sort({ createdAt: -1 })
            .limit(5);

        // Thống kê đơn hàng theo trạng thái
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                categoryStats,
                recentOrders,
                ordersByStatus
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thống kê dashboard'
        });
    }
});

// Get all products
router.get('/products', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách sản phẩm'
        });
    }
});

// Create product
router.post('/products', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const {
            category_id,
            name,
            price,
            description,
            SKU,
            qty_in_stock,
            product_images,
            attributes
        } = req.body;

        const product = new Product({
            category_id,
            name,
            price,
            description,
            SKU,
            qty_in_stock,
            product_images,
            attributes
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
            message: 'Lỗi thêm sản phẩm'
        });
    }
});

// Update product
router.put('/products/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const {
            category_id,
            name,
            price,
            description,
            SKU,
            qty_in_stock,
            product_images,
            attributes
        } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                category_id,
                name,
                price,
                description,
                SKU,
                qty_in_stock,
                product_images,
                attributes
            },
            { new: true }
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
            message: 'Lỗi cập nhật sản phẩm'
        });
    }
});

// Delete product
router.delete('/products/:id', isAuthenticated, isAdmin, async (req, res) => {
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
            message: 'Lỗi xóa sản phẩm'
        });
    }
});

// Get all orders
router.get('/orders', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách đơn hàng'
        });
    }
});

// Update order status
router.put('/orders/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp trạng thái đơn hàng'
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công',
            data: order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật trạng thái đơn hàng'
        });
    }
});

// Users Management
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's order statistics
        const orders = await Order.find({ user: req.params.id });
        const totalOrders = orders.length;
        const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        res.json({
            user,
            statistics: {
                totalOrders,
                totalAmount,
                accountCreated: user.createdAt
            },
            orderHistory: orders
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get categories with product count
router.get('/categories', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const categories = await Category.find();
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const count = await Product.countDocuments({ category_id: category._id });
                return {
                    ...category.toJSON(),
                    productCount: count
                };
            })
        );

        res.json({
            success: true,
            data: categoriesWithCount
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách danh mục'
        });
    }
});

// Get products by category
router.get('/products/category/:categoryId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const products = await Product.find({ category_id: req.params.categoryId })
            .populate('category_id', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách sản phẩm theo danh mục'
        });
    }
});

module.exports = router; 