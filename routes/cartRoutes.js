const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart
} = require('../controllers/cartController');


// http://localhost:5000/api/cart/add
router.post('/add', isAuthenticated, addToCart);
// http://localhost:5000/api/cart/
router.get('/', isAuthenticated, getCart);
// http://localhost:5000/api/cart/update
router.put('/update', isAuthenticated, updateCartItem);
// http://localhost:5000/api/cart/remove
router.delete('/remove', isAuthenticated, removeFromCart);

module.exports = router;