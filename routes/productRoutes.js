const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

router.get('/', async (req, res) => {
    try {
        const products = await Product.find(); // Truy vấn tất cả sản phẩm từ MongoDB
        res.json(products);
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;