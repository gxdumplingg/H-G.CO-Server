const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', auth(), userController.getProfile);
router.put('/avatar', auth(), (req, res, next) => {
    console.log('Avatar upload route hit');
    next();
}, upload.single('avatar'), userController.uploadAvatar);

// Admin routes
router.get('/admin/users', auth(['admin']), userController.getUsers);

module.exports = router;