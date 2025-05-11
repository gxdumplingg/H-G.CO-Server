const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Đăng ký
const register = async (req, res) => {
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

        // Tìm role customer
        const customerRole = await Role.findOne({ name: 'customer' });
        if (!customerRole) {
            return res.status(500).json({
                success: false,
                message: 'Không tìm thấy role customer'
            });
        }

        // Tạo user mới
        const user = new User({
            username,
            email_address,
            phone_number,
            password,
            roleId: customerRole._id
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
            { userId: savedUser._id },
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
                email: savedUser.email_address
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Đăng nhập
const login = async (req, res) => {
    try {
        const { email_address, password } = req.body;

        // Tìm user theo email
        const user = await User.findOne({ email_address }).populate('roleId');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Tạo token
        const token = jwt.sign(
            { userId: user._id },
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
                role: user.roleId ? user.roleId.name : null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Lấy profile
const getProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
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
const uploadAvatar = async (req, res) => {
    try {
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
const getUsers = async (req, res) => {
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

module.exports = {
    register,
    login,
    getProfile,
    uploadAvatar,
    getUsers
};