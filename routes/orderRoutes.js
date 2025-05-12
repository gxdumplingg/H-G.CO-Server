const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const {
    createOrder,
    getMyOrders,
    getOrderDetail,
    cancelOrder
} = require('../controllers/orderController');

// Tạo đơn hàng mới
router.post('/', isAuthenticated, createOrder);

// Lấy danh sách đơn hàng của user
router.get('/my-orders', isAuthenticated, getMyOrders);

// Lấy chi tiết đơn hàng
router.get('/:id', isAuthenticated, getOrderDetail);

// Hủy đơn hàng
router.put('/:id/cancel', isAuthenticated, cancelOrder);

module.exports = router;