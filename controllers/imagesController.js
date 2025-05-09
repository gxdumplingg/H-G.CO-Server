const cloudinary = require('../config/cloudinary');

const uploadImages = async (req, res) => {
    try {
        const images = req.files.map(file => file.path);

        const uploadedImages = [];
        for (let image of images) {
            const results = await cloudinary.uploader.upload(image);
            console.log(results);
            uploadedImages.push({
                url: results.secure_url,
                public_id: results.public_id
            });
        }
        return res.status(200).json({
            message: "Upload ảnh thành công",
            data: uploadedImages
        });

    } catch (error) {
        return res.status(400).json({
            name: error.name,
            message: error.message
        })
    }
}

module.exports = {
    uploadImages
}

