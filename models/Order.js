const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    order_number: {
        type: String,
        required: true,
        unique: true
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
        },
        price: {
            type: Number,
            required: true
        }
    }],
    total_amount: {
        type: Number,
        required: true
    },
    shipping_address: {
        full_name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        ward: {
            type: String,
            required: true
        }
    },
    payment_method: {
        type: String,
        enum: ['COD'],
        default: 'COD'
    },
    payment_status: {
        type: String,
        enum: ['PENDING', 'PAID'],
        default: 'PENDING'
    },
    order_status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    note: String
}, {
    timestamps: true
});

OrderSchema.index({ order_number: 1 }, { unique: true });

module.exports = mongoose.model('Order', OrderSchema);