const mongoose = require('mongoose');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Color = require('../models/Color');
const Size = require('../models/Size');
const Attribute = require('../models/Attribute'); // Thêm model Attribute
require('dotenv').config();

async function resetProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
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

        // Tạo attributes trước
        const attributes = [
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
            },
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
        ];

        // Lưu attributes vào database
        const createdAttributes = await Attribute.insertMany(attributes);
        console.log('Created attributes:', createdAttributes);

        // Tạo sản phẩm với attributes đã có ID
        const sampleProducts = [
            {
                category_id: '65f1a2b3c4d5e6f7g8h9i0j1', // Thay thế bằng ID category thực tế
                name: 'Áo thun nam',
                price: 200000,
                description: 'Áo thun nam chất liệu cotton',
                SKU: 'ATN001',
                qty_in_stock: 100,
                tags: ['áo thun', 'nam', 'cotton'],
                attributes: [createdAttributes[0]._id, createdAttributes[1]._id] // Sử dụng ID của attributes đã tạo
            },
            {
                category_id: '65f1a2b3c4d5e6f7g8h9i0j1', // Thay thế bằng ID category thực tế
                name: 'Quần jean nam',
                price: 400000,
                description: 'Quần jean nam chất liệu denim',
                SKU: 'QJN001',
                qty_in_stock: 50,
                tags: ['quần jean', 'nam', 'denim'],
                attributes: [createdAttributes[2]._id, createdAttributes[3]._id] // Sử dụng ID của attributes đã tạo
            }
        ];

        // Thêm sản phẩm vào database
        const products = await Product.insertMany(sampleProducts);
        console.log('Added products:', products);

        // Thêm ảnh cho sản phẩm
        const productImages = [];
        for (const product of products) {
            // Thêm ảnh chính
            productImages.push({
                product_id: product._id,
                url: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/hn-g-shop/products/main/ao-thun-nam.jpg',
                type: 'main',
                is_active: true
            });

            // Thêm ảnh variants cho từng attribute
            for (const attributeId of product.attributes) {
                const attribute = createdAttributes.find(attr => attr._id.toString() === attributeId.toString());
                if (attribute) {
                    productImages.push({
                        product_id: product._id,
                        variant_id: attribute._id,
                        url: `https://res.cloudinary.com/your-cloud-name/image/upload/v1/hn-g-shop/products/variants/ao-thun-nam-${attribute.color_id}-${attribute.size_id}.jpg`,
                        type: 'variant',
                        is_active: true
                    });
                }
            }
        }

        await ProductImage.insertMany(productImages);
        console.log('Added product images');

        console.log('Reset products completed successfully');
    } catch (error) {
        console.error('Error resetting products:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

resetProducts();