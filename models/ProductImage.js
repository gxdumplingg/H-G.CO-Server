const mongoose = require('mongoose');

const ProductImageSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute'
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['main', 'variant'],
        required: true
    },
    thumbnail_index: {
        type: Number
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductImage', ProductImageSchema);