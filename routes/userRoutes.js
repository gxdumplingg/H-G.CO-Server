const { Router } = require('express');
const {
    register,
    login,
    getProfile,
    uploadAvatar,
    getUsers
} = require('../controllers/userController');
const { isAuthenticated, hasPermission, isAdmin } = require('../middlewares/auth');
const { uploadAvatar: uploadAvatarMiddleware } = require('../config/cloudinary');
const router = Router();

/// Đăng ký
// http://localhost:5000/api/v1/users/register
router.post('/register', register);

// Đăng nhập
// http://localhost:5000/api/v1/users/login
router.post('/login', login);

// Lấy profile
// http://localhost:5000/api/v1/users/profile
router.get('/profile', isAuthenticated, getProfile);

// Get current user
router.get('/me', isAuthenticated, async (req, res) => {
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

// Upload avatar
// http://localhost:5000/api/v1/users/avatar
router.post('/avatar',
    isAuthenticated,
    uploadAvatarMiddleware,
);

// Lấy danh sách users (admin)
// http://localhost:5000/api/v1/users/
router.get('/', isAuthenticated, hasPermission('manage_users'), getUsers);

// Get single user
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Check if the user is accessing their own profile or is an admin
        if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền truy cập thông tin người dùng này'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin người dùng'
        });
    }
});


// Update user
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        // Check if the user is updating their own profile or is an admin
        if (req.params.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật thông tin người dùng này'
            });
        }

        const { firstName, lastName, email, phone, address, city } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, email, phone, address, city },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật thông tin người dùng thành công',
            data: user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật thông tin người dùng'
        });
    }
});

// Delete user (admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa người dùng'
        });
    }
});

module.exports = router; 