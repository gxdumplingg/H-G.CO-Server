const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
    {
        category_name: 'Áo',
        description: 'Các loại áo thời trang',
        subcategories: [
            {
                category_name: 'Áo thun',
                description: 'Áo thun basic và graphic'
            },
            {
                category_name: 'Áo sơ mi',
                description: 'Áo sơ mi công sở và casual'
            },
            {
                category_name: 'Áo hoodie',
                description: 'Áo hoodie và sweatshirt'
            }
        ]
    },
    {
        category_name: 'Quần',
        description: 'Các loại quần thời trang',
        subcategories: [
            {
                category_name: 'Quần jean',
                description: 'Quần jean nam và nữ'
            },
            {
                category_name: 'Quần khaki',
                description: 'Quần khaki công sở'
            },
            {
                category_name: 'Quần short',
                description: 'Quần short thể thao và casual'
            }
        ]
    },
    {
        category_name: 'Phụ kiện',
        description: 'Các loại phụ kiện thời trang',
        subcategories: [
            {
                category_name: 'Túi xách',
                description: 'Túi xách và balo'
            },
            {
                category_name: 'Giày dép',
                description: 'Giày dép nam và nữ'
            },
            {
                category_name: 'Mũ nón',
                description: 'Mũ lưỡi trai và mũ len'
            }
        ]
    }
];

const initCategories = async () => {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "HnGshop"
        });
        console.log('Kết nối DB thành công');

        // Xóa tất cả categories cũ
        await Category.deleteMany({});
        console.log('Đã xóa categories cũ');

        // Thêm categories mới
        for (const category of categories) {
            // Tạo category cha
            const parentCategory = await Category.create({
                category_name: category.category_name,
                description: category.description
            });
            console.log(`Đã tạo category: ${parentCategory.category_name}`);

            // Tạo subcategories
            for (const subcategory of category.subcategories) {
                await Category.create({
                    parent_category_id: parentCategory._id,
                    category_name: subcategory.category_name,
                    description: subcategory.description
                });
                console.log(`Đã tạo subcategory: ${subcategory.category_name}`);
            }
        }

        console.log('Đã thêm tất cả categories thành công');
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        // Đóng kết nối
        await mongoose.connection.close();
        console.log('Đã đóng kết nối DB');
    }
};

// Chạy script
initCategories();