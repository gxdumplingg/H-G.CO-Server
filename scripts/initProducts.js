const mongoose = require('mongoose');
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const Color = require('../models/Color');
const Size = require('../models/Size');
require('dotenv').config();

const sampleImages = {
    'Áo thun basic trắng': {
        main: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021920/ao-thun-trang.webp',
        variants: [
            {
                color: 'Trắng',
                size: 'S',
                thumbnails: [
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021864/products/ao-thun-basic-trang-3.webp',
                        thumbnail_index: 1
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021864/products/ao-thun-basic-trang-2.webp',
                        thumbnail_index: 2
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021866/products/ao-thun-basic-trang-4.webp',
                        thumbnail_index: 3
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021835/ao-thun-trang-4_toe3gr.webp',
                        thumbnail_index: 4
                    },
                    {
                        url: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/products/ao-thun-basic-trang-s-5.jpg',
                        thumbnail_index: 5
                    }
                ]
            },
            {
                color: 'Trắng',
                size: 'M',
                thumbnails: [
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021864/products/ao-thun-basic-trang-3.webp',
                        thumbnail_index: 1
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021864/products/ao-thun-basic-trang-2.webp',
                        thumbnail_index: 2
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021866/products/ao-thun-basic-trang-4.webp',
                        thumbnail_index: 3
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021835/ao-thun-trang-4_toe3gr.webp',
                        thumbnail_index: 4
                    },
                    {
                        url: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/products/ao-thun-basic-trang-s-5.jpg',
                        thumbnail_index: 5
                    }
                ]
            },
            {
                color: 'Trắng',
                size: 'L',
                thumbnails: [
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021864/products/ao-thun-basic-trang-3.webp',
                        thumbnail_index: 1
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021864/products/ao-thun-basic-trang-2.webp',
                        thumbnail_index: 2
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021866/products/ao-thun-basic-trang-4.webp',
                        thumbnail_index: 3
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747021835/ao-thun-trang-4_toe3gr.webp',
                        thumbnail_index: 4
                    },
                    {
                        url: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/products/ao-thun-basic-trang-s-5.jpg',
                        thumbnail_index: 5
                    }
                ]
            }
        ]
    },
    'Áo thun graphic đen': {
        main: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022262/ao-thun-den-main.webp',
        variants: [
            {
                color: 'Đen',
                size: 'S',
                thumbnails: [
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022197/ao-thun-den-5.webp',
                        thumbnail_index: 1
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022196/ao-thun-den-4.webp',
                        thumbnail_index: 2
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022194/ao-thun-den-3.jpg',
                        thumbnail_index: 3
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022192/ao-thun-den-2.webp',
                        thumbnail_index: 4
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022191/ao-thun-den.jpg',
                        thumbnail_index: 5
                    }
                ]
            },
            {
                color: 'Đen',
                size: 'M',
                thumbnails: [
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022197/ao-thun-den-5.webp',
                        thumbnail_index: 1
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022196/ao-thun-den-4.webp',
                        thumbnail_index: 2
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022194/ao-thun-den-3.jpg',
                        thumbnail_index: 3
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022192/ao-thun-den-2.webp',
                        thumbnail_index: 4
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022191/ao-thun-den.jpg',
                        thumbnail_index: 5
                    }
                ]
            },
            {
                color: 'Đen',
                size: 'L',
                thumbnails: [
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022197/ao-thun-den-5.webp',
                        thumbnail_index: 1
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022196/ao-thun-den-4.webp',
                        thumbnail_index: 2
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022194/ao-thun-den-3.jpg',
                        thumbnail_index: 3
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022192/ao-thun-den-2.webp',
                        thumbnail_index: 4
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022191/ao-thun-den.jpg',
                        thumbnail_index: 5
                    }
                ]
            }

        ]
    },
    'Quần jeans lửng': {
        main: 'https://res.cloudinary.com/hng-shop/image/upload/v1747022923/quan-lung-main-2.webp',
        variants: [
            {
                color: 'Xanh dương',
                size: 'M',
                thumbnails: [
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023036/quan-lung-xanh-6.webp',
                        thumbnail_index: 1
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023033/quan-lung-xanh-5.webp',
                        thumbnail_index: 2
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023030/quan-lung-xanh-4.webp',
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023024/quan-lung-xanh-2.webp',
                        thumbnail_index: 4
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023022/quan-lung-xanh.webp',
                        thumbnail_index: 5
                    }
                ]
            },
            {
                color: 'Xanh dương',
                size: 'L',
                thumbnails: [
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023036/quan-lung-xanh-6.webp',
                        thumbnail_index: 1
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023033/quan-lung-xanh-5.webp',
                        thumbnail_index: 2
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023030/quan-lung-xanh-4.webp',
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023024/quan-lung-xanh-2.webp',
                        thumbnail_index: 4
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023022/quan-lung-xanh.webp',
                        thumbnail_index: 5
                    }
                ]
            },
            {
                color: 'Xanh dương',
                size: 'XL',
                thumbnails: [
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023036/quan-lung-xanh-6.webp',
                        thumbnail_index: 1
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023033/quan-lung-xanh-5.webp',
                        thumbnail_index: 2
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023030/quan-lung-xanh-4.webp',
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023024/quan-lung-xanh-2.webp',
                        thumbnail_index: 4
                    },
                    {
                        url: 'https://res.cloudinary.com/hng-shop/image/upload/v1747023022/quan-lung-xanh.webp',
                        thumbnail_index: 5
                    }
                ]
            }
        ]
    }

};

const initProductImages = async () => {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "HnGshop"
        });
        console.log('Kết nối DB thành công');

        // Xóa tất cả ảnh cũ
        await ProductImage.deleteMany({});
        console.log('Đã xóa ảnh cũ');

        // Lấy tất cả sản phẩm
        const products = await Product.find().populate({
            path: 'attributes',
            populate: [
                { path: 'color_id' },
                { path: 'size_id' }
            ]
        });
        console.log('Đã lấy danh sách sản phẩm');

        // Thêm ảnh cho từng sản phẩm
        for (const product of products) {
            const productImages = sampleImages[product.name];
            if (!productImages) {
                console.log(`Không tìm thấy ảnh cho sản phẩm: ${product.name}`);
                continue;
            }

            // Thêm ảnh chính
            const mainImage = new ProductImage({
                product_id: product._id,
                url: productImages.main,
                type: 'main',
                is_active: true
            });
            await mainImage.save();
            console.log(`Đã thêm ảnh chính cho: ${product.name}`);

            // Thêm ảnh variants
            for (const variant of productImages.variants) {
                // Tìm attribute tương ứng
                const attribute = product.attributes.find(attr =>
                    attr.color_id.name === variant.color &&
                    attr.size_id.name === variant.size
                );

                if (attribute) {
                    // Thêm từng thumbnail cho variant
                    for (const thumbnail of variant.thumbnails) {
                        const variantImage = new ProductImage({
                            product_id: product._id,
                            variant_id: attribute._id,
                            url: thumbnail.url,
                            type: 'variant',
                            thumbnail_index: thumbnail.thumbnail_index,
                            is_active: true
                        });
                        await variantImage.save();
                        console.log(`Đã thêm ảnh variant cho: ${product.name} - ${variant.color} - ${variant.size} - Thumbnail ${thumbnail.thumbnail_index}`);
                    }
                }
            }
        }

        console.log('Đã thêm tất cả ảnh thành công');
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        // Đóng kết nối
        await mongoose.connection.close();
        console.log('Đã đóng kết nối DB');
    }
};

initProductImages();