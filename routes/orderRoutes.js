const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const {
    createOrderFromCart,
    getMyOrders,
    getOrderDetails,
    cancelOrder
} = require('../controllers/orderController');

// Get all orders (admin only)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};

        // Filter by status
        if (req.query.status) {
            filter.status = req.query.status;
        }

        // Filter by payment status
        if (req.query.isPaid !== undefined) {
            filter.isPaid = req.query.isPaid === 'true';
        }

        // Filter by delivery status
        if (req.query.isDelivered !== undefined) {
            filter.isDelivered = req.query.isDelivered === 'true';
        }

        // Filter by date range
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        // Filter by total amount range
        if (req.query.minAmount || req.query.maxAmount) {
            filter.totalAmount = {};
            if (req.query.minAmount) filter.totalAmount.$gte = parseFloat(req.query.minAmount);
            if (req.query.maxAmount) filter.totalAmount.$lte = parseFloat(req.query.maxAmount);
        }

        // Get total count for pagination
        const total = await Order.countDocuments(filter);

        // Get orders with pagination
        const orders = await Order.find(filter)
            .populate('user', 'username email_address')
            .populate('items.product', 'name price')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách đơn hàng',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get my orders
router.get('/my-orders', isAuthenticated, getMyOrders);

// Create order from cart
router.post('/checkout', isAuthenticated, createOrderFromCart);

// Cancel order
router.post('/:id/cancel', isAuthenticated, cancelOrder);

// Get order details
router.get('/detail/:id', isAuthenticated, getOrderDetails);

// Get orders by user
router.get('/user', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product', 'name price images')
            .sort('-createdAt');

        res.status(200).send(orders);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get order by ID
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name price images');

        // Check if order exists
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if the user is the owner or an admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
        }

        res.status(200).send(order);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create order
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalAmount
        } = req.body;

        // Validate request
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // Create order
        const order = new Order({
            user: req.user.id,
            items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalAmount
        });

        // Save order
        const createdOrder = await order.save();

        res.status(201).json({
            success: true,
            order: createdOrder
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update order status (admin only)
router.put('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = status;

        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            order: updatedOrder
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update order to paid
router.put('/:id/pay', isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if the user is the owner or an admin
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            order: updatedOrder
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router; 