const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuth, isAdmin } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', isAuth, isAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi lấy danh sách người dùng'
        });
    }
});

// Get single user
router.get('/:id', isAuth, async (req, res) => {
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
router.put('/:id', isAuth, async (req, res) => {
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
router.delete('/:id', isAuth, isAdmin, async (req, res) => {
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