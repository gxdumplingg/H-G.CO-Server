// middlewares/auth.js
const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Không tìm thấy token'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            req.user = decoded;

            // Kiểm tra quyền nếu có yêu cầu
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Không có quyền truy cập'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }
    };
};

module.exports = auth;