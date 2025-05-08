const mongoose = require('mongoose');

const AttributeSchema = new mongoose.Schema({
    color_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Color'
    },
    size_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Size'
    },
    qty_in_stock: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, {
    _id: false,
    timestamps: false
});
