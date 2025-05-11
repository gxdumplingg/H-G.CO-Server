const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
    address_id: String,
    unit_number: String,
    street_number: String,
    address: String,
    city: String,
    is_default: { type: Boolean, default: false }
}, { _id: false });

const PaymentMethodSchema = new mongoose.Schema({
    payment_method_id: String,
    payment_type_id: String,
    is_default: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email_address: {
        type: String,
        required: true,
        unique: true
    },
    phone_number: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    addresses: [AddressSchema],
    payment_methods: [PaymentMethodSchema]
}, { timestamps: true });

// Hash password trước khi lưu
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method kiểm tra password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);