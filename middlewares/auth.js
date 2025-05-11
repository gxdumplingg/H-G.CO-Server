const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware kiểm tra xác thực
const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Không tìm thấy token xác thực'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded payload:', decoded);

        const user = await User.findById(decoded.userId).populate('roleId');

        if (!user) {
            return res.status(401).json({
                message: 'Người dùng không tồn tại'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            message: 'Token không hợp lệ'
        });
    }
};


// Middleware kiểm tra quyền dựa trên tên role
const hasRole = (roleName) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'Vui lòng đăng nhập'
                });
            }

            if (req.user.roleId.name === roleName) {
                next();
            } else {
                return res.status(403).json({
                    message: 'Bạn không có quyền truy cập'
                });
            }
        } catch (error) {
            return res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    };
};

// Middleware kiểm tra quyền dựa trên permission
const hasPermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: 'Vui lòng đăng nhập'
                });
            }

            if (req.user.roleId.permissions.includes(permission)) {
                next();
            } else {
                return res.status(403).json({
                    message: 'Bạn không có quyền thực hiện hành động này'
                });
            }
        } catch (error) {
            return res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    };
};

// Middleware kiểm tra quyền admin
const isAdmin = hasRole('admin');

// Middleware kiểm tra quyền customer
const isCustomer = hasRole('customer');

module.exports = {
    isAuthenticated,
    hasRole,
    hasPermission,
    isAdmin,
    isCustomer
}; 