const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAuth } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email_address, phone_number, password } = req.body;
        
        // Check if email already exists
        const existingUser = await User.findOne({ email_address });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại'
            });
        }
        
        // Create new user
        const user = new User({
            username,
            email_address,
            phone_number,
            password
        });
        
        // Save user
        await user.save();
        
        // Generate token
        const token = user.generateToken();
        
        res.status(201).json({
            success: true,
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email_address,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email_address, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email_address });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Email không tồn tại'
            });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu không đúng'
            });
        }
        
        // Generate token
        const token = user.generateToken();
        
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email_address,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get current user
router.get('/me', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin người dùng'
        });
    }
});

// Create admin user (for development purposes)
router.post('/create-admin', async (req, res) => {
    try {
        const { username, email_address, phone_number, password } = req.body;
        
        // Check if email already exists
        const existingUser = await User.findOne({ email_address });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại'
            });
        }
        
        // Create admin user
        const user = new User({
            username,
            email_address,
            phone_number,
            password,
            role: 'admin'
        });
        
        // Save user
        await user.save();
        
        // Generate token
        const token = user.generateToken();
        
        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản admin thành công',
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email_address,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Create admin error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router; 