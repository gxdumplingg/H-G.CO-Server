const mongoose = require('mongoose');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Color = require('../models/Color');
const Size = require('../models/Size');
require('dotenv').config();

async function initProductImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Lấy tất cả sản phẩm
        const products = await Product.find();
        if (!products.length) {
            throw new Error('Không tìm thấy sản phẩm nào. Hãy chạy initBasicData.js trước');
        }

        // Lấy danh sách colors và sizes
        const colors = await Color.find();
        const sizes = await Size.find();

        // Xóa ảnh cũ nếu có
        await ProductImage.deleteMany({});
        console.log('Đã xóa ảnh cũ');

        // Thêm ảnh mới
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
            for (const attribute of product.attributes) {
                const color = colors.find(c => c._id.toString() === attribute.color_id.toString());
                const size = sizes.find(s => s._id.toString() === attribute.size_id.toString());

                if (color && size) {
                    productImages.push({
                        product_id: product._id,
                        variant_id: attribute._id,
                        url: `https://res.cloudinary.com/your-cloud-name/image/upload/v1/hn-g-shop/products/variants/${product.name.toLowerCase().replace(/\s+/g, '-')}-${color.name.toLowerCase()}-${size.name.toLowerCase()}.jpg`,
                        type: 'variant',
                        is_active: true
                    });
                }
            }
        }

        await ProductImage.insertMany(productImages);
        console.log('Đã thêm product images');

        console.log('\nKhởi tạo ảnh sản phẩm hoàn tất!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

initProductImages();