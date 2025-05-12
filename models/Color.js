const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    color_code: {
        type: String,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Color', ColorSchema);