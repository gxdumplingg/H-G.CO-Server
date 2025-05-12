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
// http://localhost:5000/api/v1/orders/
router.post('/', isAuthenticated, createOrder);

// Lấy danh sách đơn hàng của user
// http://localhost:5000/api/v1/orders/my-orders
router.get('/my-orders', isAuthenticated, getMyOrders);

// Lấy chi tiết đơn hàng
// http://localhost:5000/api/v1/orders/:id
router.get('/:id', isAuthenticated, getOrderDetail);

// Hủy đơn hàng
// http://localhost:5000/api/v1/orders/:id/cancel
router.put('/:id/cancel', isAuthenticated, cancelOrder);

module.exports = router;