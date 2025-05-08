const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    parent_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    category_name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
