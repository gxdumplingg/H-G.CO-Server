const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const clearUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Xóa tất cả users
        const result = await User.deleteMany({});
        console.log(`Đã xóa ${result.deletedCount} users`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

clearUsers(); 