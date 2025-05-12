const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isAuth, isAdmin } = require('../middleware/auth');

// Get all orders (admin only)
router.get('/', isAuth, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort('-createdAt');
        
        res.status(200).send(orders);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get orders by user
router.get('/user', isAuth, async (req, res) => {
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
router.get('/:id', isAuth, async (req, res) => {
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
router.post('/', isAuth, async (req, res) => {
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
router.put('/:id/status', isAuth, isAdmin, async (req, res) => {
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
router.put('/:id/pay', isAuth, async (req, res) => {
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