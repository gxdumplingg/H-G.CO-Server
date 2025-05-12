const mongoose = require('mongoose');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Color = require('../models/Color');
const Size = require('../models/Size');
const Attribute = require('../models/Attribute');
require('dotenv').config();

async function resetProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Xóa dữ liệu cũ
        await Product.deleteMany({});
        await ProductImage.deleteMany({});
        console.log('Deleted old data from products and product_images collections');

        // Lấy danh sách colors và sizes
        const colors = await Color.find();
        const sizes = await Size.find();

        if (!colors.length || !sizes.length) {
            throw new Error('Không tìm thấy colors hoặc sizes. Hãy chạy initData.js trước');
        }

        // Tạo sản phẩm với attributes
        const sampleProducts = [
            {
                category_id: '681849bb3f3fcb9400f63ecb', // Category ID cho áo thun nữ
                name: 'Áo thun nữ',
                price: 200000,
                description: 'Áo thun nữ chất liệu cotton',
                SKU: 'ATN001',
                qty_in_stock: 100,
                tags: ['best-seller', 'new-arrival'],
                attributes: [
                    {
                        color_id: colors[0]._id, // Đen
                        size_id: sizes[0]._id, // S
                        qty_in_stock: 20,
                        price: 200000
                    },
                    {
                        color_id: colors[1]._id, // Trắng
                        size_id: sizes[1]._id, // M
                        qty_in_stock: 15,
                        price: 200000
                    }
                ]
            },
            {
                category_id: '68183d229fc06d5a29f886f1', // Sử dụng cùng category ID
                name: 'Quần jean nam',
                price: 400000,
                description: 'Quần jean nam chất liệu denim',
                SKU: 'QJN001',
                qty_in_stock: 50,
                tags: ['best-seller', 'new-arrival'],
                attributes: [
                    {
                        color_id: colors[2]._id, // Xanh dương
                        size_id: sizes[2]._id, // L
                        qty_in_stock: 10,
                        price: 400000
                    },
                    {
                        color_id: colors[3]._id, // Đỏ
                        size_id: sizes[3]._id, // XL
                        qty_in_stock: 8,
                        price: 400000
                    }
                ]
            }
        ];

        // Thêm sản phẩm vào database
        const products = await Product.insertMany(sampleProducts);
        console.log('Added products:', products.map(p => ({ name: p.name, id: p._id })));

        console.log('Reset products completed successfully');
    } catch (error) {
        console.error('Error resetting products:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

resetProducts();