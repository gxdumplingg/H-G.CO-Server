const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart
} = require('../controllers/cartController');

router.post('/add', isAuthenticated, addToCart);
router.get('/', isAuthenticated, getCart);
router.put('/update', isAuthenticated, updateCartItem);
router.delete('/remove', isAuthenticated, removeFromCart);

module.exports = router;