const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Role = require('../models/Role');

// Đăng ký tài khoản
exports.register = async (req, res) => {
    try {
        const { username, email_address, phone_number, password } = req.body;

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email_address });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email đã được sử dụng'
            });
        }

        // Tìm role customer
        const customerRole = await Role.findOne({ name: 'customer' });
        if (!customerRole) {
            return res.status(500).json({
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

        await user.save();

        // Tạo token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                id: user._id,
                username: user.username,
                email_address: user.email_address,
                role: user.roleId.name
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email_address, password } = req.body;

        // Tìm user theo email
        const user = await User.findOne({ email_address }).populate('roleId');
        if (!user) {
            return res.status(401).json({
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Tạo token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                username: user.username,
                email_address: user.email_address,
                role: user.roleId.name
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi server',
            error: error.message
        });
    }
}; 