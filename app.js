const express = require('express');
const mongoose = require('mongoose');
require('dotenv/config');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

// Import models
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');

// Import routes
const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const userRouter = require('./routes/userRoutes');
const orderRouter = require('./routes/orderRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const authRouter = require('./routes/userRoutes'); // Assume auth routes are in userRoutes
const rolesRouter = require('./routes/rolesRoutes');

const app = express();
const api = process.env.API_URL || '/api/v1';

// Middleware
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('tiny'));

// Static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/auth`, authRouter); // Auth routes are in userRoutes
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/admin/dashboard`, dashboardRouter);
app.use(`${api}/roles`, rolesRouter);

// Error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

module.exports = app; 