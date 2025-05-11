const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Kiểm tra các biến môi trường
if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary configuration:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'missing',
        api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing'
    });
    throw new Error('Missing Cloudinary configuration');
}

// Log Cloudinary configuration (without sensitive data)
console.log('Cloudinary configuration:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing'
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình cho upload ảnh sản phẩm chính
const productMainStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hn-g-shop/products/main',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
        resource_type: 'auto',
        format: 'jpg'
    }
});

// Cấu hình cho upload ảnh biến thể sản phẩm
const productVariantStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hn-g-shop/products/variants',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// Cấu hình cho upload ảnh danh mục
const categoryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hn-g-shop/categories',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
    }
});

// Cấu hình cho upload ảnh banner
const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hn-g-shop/banners',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 1200, height: 400, crop: 'fill' }]
    }
});

// Cấu hình cho upload ảnh đại diện
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hn-g-shop/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 200, height: 200, crop: 'fill' }]
    }
});

// Cấu hình cho upload ảnh tạm thời
const tempStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hn-g-shop/temp',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
});

// Tạo các middleware upload tương ứng
const uploadProductMain = multer({
    storage: productMainStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Chỉ cho phép 1 ảnh chính
    }
});

const uploadProductVariant = multer({
    storage: productVariantStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5 // Tối đa 5 ảnh biến thể
    }
});

const uploadCategory = multer({
    storage: categoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 1
    }
});

const uploadBanner = multer({
    storage: bannerStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1
    }
});

const uploadTemp = multer({
    storage: tempStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    }
});

module.exports = {
    cloudinary,
    uploadProductMain,
    uploadProductVariant,
    uploadCategory,
    uploadBanner,
    uploadAvatar,
    uploadTemp
};