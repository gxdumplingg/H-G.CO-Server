const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();

const defaultRoles = [
    {
        name: 'admin',
        description: 'Quản trị viên',
        permissions: [
            'manage_products',    // Quản lý sản phẩm (thêm, sửa, xóa)
            'manage_orders',      // Quản lý đơn hàng (xem, cập nhật trạng thái)
            'manage_categories',  // Quản lý danh mục sản phẩm
            'view_reports'        // Xem báo cáo doanh thu
        ]
    },
    {
        name: 'customer',
        description: 'Khách hàng',
        permissions: [
            'view_products',      // Xem sản phẩm
            'place_orders',       // Đặt hàng
            'view_own_orders',    // Xem đơn hàng của mình
            'update_profile'      // Cập nhật thông tin cá nhân
        ]
    }
];

const initRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Xóa tất cả role cũ
        await Role.deleteMany({});
        console.log('Deleted all existing roles');

        // Tạo role mới
        const roles = await Role.insertMany(defaultRoles);
        console.log('Created default roles:', roles);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

initRoles();