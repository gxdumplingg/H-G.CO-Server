const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
// Đăng ký
exports.register = async (req, res) => {
    try {
        console.log('Register request body:', req.body);

        const { username, email_address, phone_number, password } = req.body;

        // Kiểm tra kết nối database
        if (!mongoose.connection.readyState) {
            throw new Error('Database connection lost');
        }

        // Chỉ kiểm tra email trùng lặp
        const existingUser = await User.findOne({ email_address });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại'
            });
        }

        // Tạo user mới
        const user = new User({
            username,
            email_address,
            phone_number,
            password,
            role: 'user'
        });

        // Lưu user với timeout
        const savedUser = await Promise.race([
            user.save(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Save timeout')), 5000)
            )
        ]);

        console.log('User saved successfully:', savedUser);

        // Tạo token
        const token = jwt.sign(
            { userId: savedUser._id, role: savedUser.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            token,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email_address,
                role: savedUser.role
            }
        });

    } catch (error) {
        console.error('Register error:', error);

        // Xử lý các loại lỗi cụ thể
        if (error.code === 'ECONNRESET') {
            return res.status(503).json({
                success: false,
                message: 'Lỗi kết nối database, vui lòng thử lại'
            });
        }

        if (error.message === 'Save timeout') {
            return res.status(504).json({
                success: false,
                message: 'Hệ thống đang bận, vui lòng thử lại sau'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        console.log('Login request body:', req.body); // Thêm log để debug

        const { email_address, password } = req.body;

        // Tìm user theo email
        const user = await User.findOne({ email_address });
        console.log('Found user:', user); // Thêm log để debug

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email không tồn tại'
            });
        }

        // Kiểm tra password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch); // Thêm log để debug

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu không đúng'
            });
        }

        // Tạo token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email_address,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error); // Thêm log để debug
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Upload avatar
// controllers/userController.js
exports.uploadAvatar = async (req, res) => {
    try {
        console.log('Upload avatar controller hit');
        console.log('File:', req.file);
        console.log('User:', req.user);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ảnh'
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        user.avatar = req.file.path;
        await user.save();

        res.json({
            success: true,
            message: 'Upload avatar thành công',
            avatar: user.avatar
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy danh sách users (admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};