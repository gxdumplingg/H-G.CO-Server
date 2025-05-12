const mongoose = require('mongoose');

const SizeSchema = new mongoose.Schema({
    name: {
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

module.exports = mongoose.model('Size', SizeSchema);