const Product = require('../models/Product');

exports.getProductsByTags = async (req, res) => {
    try {
        const tags = req.query.tags ? req.query.tags.split(',') : [];
        // OR: $in, AND: $all
        const products = await Product.find({ tags: { $in: tags } }); // hoặc $all nếu muốn AND
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
};
