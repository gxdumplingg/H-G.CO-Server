const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxLength: [8, 'Price cannot exceed 8 characters'],
        default: 0.0
    },
    sale_price: {
        type: Number,
        maxLength: [8, 'Sale price cannot exceed 8 characters'],
        default: 0.0
    },
    images: [
        {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        }
    ],
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    seller: {
        type: String,
        default: 'Admin'
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        maxLength: [5, 'Stock cannot exceed 5 characters'],
        default: 0
    },
    SKU: {
        type: String,
        unique: true,
        trim: true
    },
    qty_in_stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    attributes: [
        {
            name: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        }
    ],
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for main image URL (first image or placeholder)
productSchema.virtual('main_image').get(function() {
    if (this.images && this.images.length > 0) {
        return this.images[0].url;
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
});

// Virtual for discounted price calculation
productSchema.virtual('discount_percent').get(function() {
    if (this.sale_price && this.price > this.sale_price) {
        return Math.round(((this.price - this.sale_price) / this.price) * 100);
    }
    return 0;
});

module.exports = mongoose.model('Product', productSchema); 