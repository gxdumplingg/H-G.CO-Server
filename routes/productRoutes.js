const express = require('express');
const router = express.Router();
const { poolConnect, pool, sql } = require('../config/db');

router.get('/', async (req, res) => {
    try {
        await poolConnect; // đợi kết nối trước khi query

        const result = await pool.request()
            .query('SELECT * FROM Products'); // bảng trong DB

        res.json(result.recordset);
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
