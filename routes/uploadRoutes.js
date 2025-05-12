const express = require('express');
const router = express.Router();
const { cloudinary, uploadMain, uploadVariant } = require('../config/cloudinary');
const { isAdmin } = require('../middlewares/auth');
const fs = require('fs').promises;

// Upload ảnh chính
router.post('/products/main', isAdmin, uploadMain, async (req, res) => {
    try {
        console.log('Upload request received:', {
            file: req.file,
            body: req.body
        });

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file ảnh được upload'
            });
        }

        const { product_id } = req.body;
        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu product_id'
            });
        }

        // Upload lên Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'hn-g-shop/products/main',
            transformation: [
                { width: 500, height: 500, crop: 'limit' }
            ]
        });

        // Xóa file tạm
        await fs.unlink(req.file.path);

        res.status(200).json({
            success: true,
            data: {
                url: result.secure_url,
                product_id: product_id
            }
        });
    } catch (error) {
        console.error('Error uploading main image:', error);
        // Xóa file tạm nếu có lỗi
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting temp file:', unlinkError);
            }
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi khi upload ảnh chính',
            error: error.message || 'Unknown error'
        });
    }
});

// Upload ảnh variants
router.post('/products/variants', isAdmin, uploadVariant, async (req, res) => {
    try {
        console.log('Upload request received:', {
            files: req.files,
            body: req.body
        });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có file ảnh được upload'
            });
        }

        const { product_id, variant_id } = req.body;
        if (!product_id || !variant_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu product_id hoặc variant_id'
            });
        }

        // Upload nhiều ảnh lên Cloudinary
        const uploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
                folder: 'hn-g-shop/products/variants',
                transformation: [
                    { width: 500, height: 500, crop: 'limit' }
                ]
            })
        );

        const results = await Promise.all(uploadPromises);

        // Xóa các file tạm
        await Promise.all(req.files.map(file => fs.unlink(file.path)));

        const images = results.map(result => ({
            url: result.secure_url,
            product_id: product_id,
            variant_id: variant_id
        }));

        res.status(200).json({
            success: true,
            data: images
        });
    } catch (error) {
        console.error('Error uploading variant images:', error);
        // Xóa các file tạm nếu có lỗi
        if (req.files) {
            try {
                await Promise.all(req.files.map(file => fs.unlink(file.path)));
            } catch (unlinkError) {
                console.error('Error deleting temp files:', unlinkError);
            }
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi khi upload ảnh variants',
            error: error.message || 'Unknown error'
        });
    }
});

module.exports = router;