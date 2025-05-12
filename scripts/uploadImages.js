const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Hàm tạo tên file dễ đọc
function generateFileName(productName, color, size, index = null) {
    const baseName = productName.toLowerCase().replace(/\s+/g, '-');
    if (index === null) {
        return `${baseName}`;
    }
    return `${baseName}-${color.toLowerCase()}-${size.toLowerCase()}-${index}`;
}

// Hàm upload ảnh
async function uploadImage(filePath, folder, fileName) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `hn-g-shop/products/${folder}`,
            public_id: fileName,
            overwrite: true
        });
        console.log(`Uploaded: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
        return null;
    }
}

// Hàm chính để upload tất cả ảnh
async function uploadAllImages() {
    try {
        // Đường dẫn đến thư mục chứa ảnh
        const imagesDir = path.join(__dirname, '../public/images/products');

        // Danh sách sản phẩm và variants
        const products = [
            {
                name: 'ao-thun-nu',
                variants: [
                    { color: 'trang', size: 's' }
                ]
            },
            {
                name: 'quan-jean-nam',
                variants: [
                    { color: 'xanh-duong', size: 'l' },
                    { color: 'xanh-duong', size: 'xl' }
                ]
            }
        ];

        // Upload ảnh chính cho từng sản phẩm
        for (const product of products) {
            const mainImagePath = path.join(imagesDir, `${product.name}/main.jpg`);
            if (fs.existsSync(mainImagePath)) {
                await uploadImage(
                    mainImagePath,
                    'main',
                    generateFileName(product.name)
                );
            }

            // Upload ảnh variants
            for (const variant of product.variants) {
                for (let i = 1; i <= 5; i++) {
                    const variantImagePath = path.join(imagesDir, `${product.name}/variants/${variant.color}-${variant.size}-${i}.jpg`);
                    if (fs.existsSync(variantImagePath)) {
                        await uploadImage(
                            variantImagePath,
                            'variants',
                            generateFileName(product.name, variant.color, variant.size, i)
                        );
                    }
                }
            }
        }

        console.log('Upload completed!');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Chạy script
uploadAllImages();