const { Router } = require('express');
const {
    register,
    login,
    getProfile,
    uploadAvatar,
    getUsers
} = require('../controllers/userController');
const { isAuthenticated, hasPermission } = require('../middlewares/auth');
const { uploadAvatar: uploadAvatarMiddleware } = require('../config/cloudinary');
const router = Router();

// Đăng ký
router.post('/register', register);

// Đăng nhập
router.post('/login', login);

// Lấy profile
router.get('/profile', isAuthenticated, getProfile);

// Upload avatar
router.post('/avatar',
    isAuthenticated,
    uploadAvatarMiddleware, // Sử dụng middleware đã được định nghĩa
    uploadAvatar
);

// Lấy danh sách users (admin)
router.get('/', isAuthenticated, hasPermission('manage_users'), getUsers);

module.exports = router;