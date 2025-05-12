const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        variant_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Attribute'
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }]
}, {
    timestamps: true
});

// Đảm bảo mỗi user chỉ có một giỏ hàng
CartSchema.index({ user_id: 1 }, { unique: true });

module.exports = mongoose.model('Cart', CartSchema);