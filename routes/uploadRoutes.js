const { Router } = require('express');
const { uploadImages } = require('../controllers/imagesController');
const { isAuthenticated, hasPermission } = require('../middlewares/auth');
const {
    uploadProductMain,
    uploadProductVariant,
    uploadCategory,
    uploadBanner,
    uploadAvatar,
    uploadTemp
} = require('../config/cloudinary');

const router = Router();

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err.name === 'MulterError') {
        console.error('Multer error:', err);
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
            field: err.field,
            code: err.code
        });
    }
    next(err);
};

// Upload ảnh sản phẩm chính
router.post("/products/main",
    isAuthenticated,
    hasPermission('manage_products'),
    uploadProductMain.single('image'),
    uploadImages
);

// Upload ảnh biến thể sản phẩm
router.post("/products/variants",
    isAuthenticated,
    hasPermission('manage_products'),
    (req, res, next) => {
        console.log('Request headers:', req.headers);
        console.log('Request body:', req.body);
        next();
    },
    uploadProductVariant.array('images', 5),
    handleMulterError,
    uploadImages
);

// Upload ảnh danh mục
router.post("/categories",
    isAuthenticated,
    hasPermission('manage_categories'),
    uploadCategory.single('image'),
    uploadImages
);

// Upload ảnh banner
router.post("/banners",
    isAuthenticated,
    hasPermission('manage_products'),
    uploadBanner.single('image'),
    uploadImages
);

// Upload ảnh đại diện
router.post("/avatars",
    isAuthenticated,
    uploadAvatar.single('image'),
    uploadImages
);

// Upload ảnh tạm thời
router.post("/temp",
    isAuthenticated,
    uploadTemp.array('images', 5),
    uploadImages
);

module.exports = router;