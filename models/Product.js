const mongoose = require('mongoose');
const AttributeSchema = require('./Attribute');
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
    product_images: [{
        type: String
    }],
    tags: [String],
    attributes: [AttributeSchema]
}, {
    timestamps: true
});

ProductSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
ProductSchema.set('toJSON', {
    virtuals: true
});
module.exports = mongoose.model('Product', ProductSchema);