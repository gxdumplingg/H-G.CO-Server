const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { isAuth, isAdmin } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', isAuth, isAdmin, async (req, res) => {
    try {
        // Get total order value
        const totalOrdersValue = await Order.aggregate([
            { $match: { status: { $ne: 'Canceled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Get active orders value (pending)
        const activeOrdersValue = await Order.aggregate([
            { $match: { status: 'Pending' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Get completed orders value
        const completedOrdersValue = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Get counts
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        // Prepare statistics
        const stats = {
            totalOrders: totalOrders,
            totalSales: totalOrdersValue[0]?.total || 0,
            activeOrders: activeOrdersValue[0]?.total || 0,
            completedOrders: completedOrdersValue[0]?.total || 0,
            totalUsers: totalUsers,
            totalProducts: totalProducts
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get recent orders
router.get('/recent-orders', isAuth, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort('-createdAt')
            .limit(5)
            .populate('user', 'name')
            .populate('items.product', 'name');

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router; 