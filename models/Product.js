const mongoose = require('mongoose');
// Sửa từ import schema thành import model
const Attribute = require('./Attribute');

const ProductSchema = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    SKU: {
        type: String,
        unique: true,
        required: true
    },
    qty_in_stock: {
        type: Number,
        required: true
    },
    tags: [String],
    // Sửa từ AttributeSchema thành Attribute.schema
    attributes: [Attribute.schema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field cho ảnh chính
ProductSchema.virtual('main_image', {
    ref: 'ProductImage',
    localField: '_id',
    foreignField: 'product_id',
    justOne: true,
    match: { type: 'main', is_active: true }
});

// Virtual field cho ảnh variants
ProductSchema.virtual('variant_images', {
    ref: 'ProductImage',
    localField: '_id',
    foreignField: 'product_id',
    match: { type: 'variant', is_active: true }
});

module.exports = mongoose.model('Product', ProductSchema);