const cloudinary = require('../config/cloudinary');

const uploadImages = async (req, res) => {
    try {
        console.log('Files in request:', {
            files: req.files,
            file: req.file,
            body: req.body
        });

        if (!req.files && !req.file) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn ít nhất một file để upload"
            });
        }

        const uploadedImages = [];
        const files = req.files || [req.file];

        for (let file of files) {
            try {
                console.log('Processing file:', file);

                // Kiểm tra response từ Cloudinary
                if (!file.path) {
                    console.error('File upload failed - missing path:', file);
                    throw new Error('File upload không thành công - thiếu đường dẫn');
                }

                // Tạo URL đầy đủ nếu cần
                const imageUrl = file.path.startsWith('http') ? file.path : `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${file.path}`;

                uploadedImages.push({
                    url: imageUrl,
                    public_id: file.filename || file.path.split('/').pop().split('.')[0]
                });
            } catch (fileError) {
                console.error('Error processing file:', fileError);
                continue;
            }
        }

        if (uploadedImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không có file nào được upload thành công"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Upload ảnh thành công",
            data: uploadedImages
        });

    } catch (error) {
        console.error('Upload error details:', {
            message: error.message,
            stack: error.stack,
            error: error
        });

        return res.status(500).json({
            success: false,
            message: "Lỗi server khi upload ảnh",
            error: error.message,
            details: error.stack
        });
    }
};

module.exports = {
    uploadImages
};