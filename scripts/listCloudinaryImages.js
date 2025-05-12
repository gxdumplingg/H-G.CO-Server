const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listImages() {
    try {
        // Lấy danh sách ảnh từ thư mục products
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'hn-g-shop/products/', // Thư mục chứa ảnh
            max_results: 500
        });

        console.log('Images in Cloudinary:');
        result.resources.forEach(resource => {
            console.log({
                url: resource.secure_url,
                public_id: resource.public_id,
                folder: resource.folder,
                type: resource.type
            });
        });
    } catch (error) {
        console.error('Error listing images:', error);
    }
}

listImages();