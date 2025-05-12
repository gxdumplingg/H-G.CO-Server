const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Get all roles
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const roles = await Role.find();
        res.json({
            success: true,
            data: roles
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách roles'
        });
    }
});

// Get role by ID
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy role'
            });
        }

        res.json({
            success: true,
            data: role
        });
    } catch (error) {
        console.error('Get role error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy thông tin role'
        });
    }
});

// Create new role
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Validate input
        if (!name || !description || !permissions || !Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin role'
            });
        }

        const role = new Role({
            name,
            description,
            permissions
        });

        await role.save();

        res.status(201).json({
            success: true,
            message: 'Tạo role mới thành công',
            data: role
        });
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo role mới',
            error: error.message
        });
    }
});

// Update role
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Validate input
        if ((!name && !description && !permissions)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp thông tin cập nhật'
            });
        }

        // Prepare update object
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (permissions) updateData.permissions = permissions;

        const role = await Role.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy role'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật role thành công',
            data: role
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật role',
            error: error.message
        });
    }
});

// Update role permissions
router.patch('/:id/permissions', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { permissions } = req.body;

        // Validate input
        if (!permissions || !Array.isArray(permissions)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp danh sách quyền'
            });
        }

        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy role'
            });
        }

        role.permissions = permissions;
        await role.save();

        res.json({
            success: true,
            message: 'Cập nhật quyền thành công',
            data: role
        });
    } catch (error) {
        console.error('Update permissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật quyền',
            error: error.message
        });
    }
});

// Delete role
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy role'
            });
        }

        res.json({
            success: true,
            message: 'Xóa role thành công'
        });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa role',
            error: error.message
        });
    }
});

module.exports = router; 