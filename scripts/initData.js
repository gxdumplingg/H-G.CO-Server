const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
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

const defaultAdmin = {
    username: 'admin',
    email_address: 'admin@example.com',
    phone_number: '0123456789',
    password: 'admin123',
    avatar: ''
};

const initData = async () => {
    try {
        // Sử dụng MONGODB_URI đã hardcode
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Xóa tất cả role cũ
        await Role.deleteMany({});
        console.log('Deleted all existing roles');

        // Tạo role mới
        const roles = await Role.insertMany(defaultRoles);
        console.log('Created default roles:', roles);

        // Tìm role admin
        const adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) {
            throw new Error('Admin role not found');
        }

        // Tạo admin mặc định
        const admin = new User({
            ...defaultAdmin,
            roleId: adminRole._id
        });

        await admin.save();
        console.log('Created default admin user:', admin.email_address);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

initData(); 