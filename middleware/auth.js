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

const verifyToken = async (req, res, next) => {
    try {
        console.log('Headers:', req.headers);

        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Populate roleId để lấy thông tin role
        const user = await User.findById(decoded.userId)
            .populate('roleId')
            .select('-password');

        console.log('User found:', user); // Log user để debug

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        // Log role để debug
        console.log('User role:', user.roleId);

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }
};

// Middleware kiểm tra quyền admin
const isAdmin = async (req, res, next) => {
    try {
        await verifyToken(req, res, () => {
            console.log('Checking admin role for user:', req.user); // Log để debug

            if (!req.user.roleId || req.user.roleId.name !== 'admin') {
                console.log('User role is not admin:', req.user.roleId); // Log để debug
                return res.status(403).json({
                    success: false,
                    message: 'Bạn không có quyền thực hiện thao tác này'
                });
            }
            next();
        });
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực quyền admin'
        });
    }
};

// Middleware kiểm tra quyền customer
const isCustomer = hasRole('customer');

module.exports = {
    isAuthenticated,
    hasRole,
    hasPermission,
    isAdmin,
    isCustomer
}; 