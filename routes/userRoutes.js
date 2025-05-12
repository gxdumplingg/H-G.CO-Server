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
// http://localhost:5000/api/v1/users/register
router.post('/register', register);

// Đăng nhập
// http://localhost:5000/api/v1/users/login
router.post('/login', login);

// Lấy profile
// http://localhost:5000/api/v1/users/profile
router.get('/profile', isAuthenticated, getProfile);

// Upload avatar
// http://localhost:5000/api/v1/users/avatar
router.post('/avatar',
    isAuthenticated,
    uploadAvatarMiddleware,
);

// Lấy danh sách users (admin)
// http://localhost:5000/api/v1/users/
router.get('/', isAuthenticated, hasPermission('manage_users'), getUsers);

module.exports = router;