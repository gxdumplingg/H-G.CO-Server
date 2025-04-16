const express = require('express');
  const cors = require('cors');
  const mongoose = require('mongoose');
  require('dotenv').config();

  const app = express();
  app.use(cors());
  app.use(express.json());

  const productRoutes = require('./routes/productRoutes');
  app.use('/api/products', productRoutes);

  // Kết nối MongoDB
  const connectDB = async () => {
      try {
          await mongoose.connect(process.env.MONGO_URI);
          console.log('Kết nối DB thành công');
      } catch (error) {
          console.error('Lỗi kết nối DB:', error);
          process.exit(1); // Thoát nếu kết nối thất bại
      }
  };

  // Khởi động server sau khi kết nối MongoDB
  const PORT = process.env.PORT || 5000;
  const startServer = async () => {
      await connectDB(); // Đợi kết nối DB thành công
      app.listen(PORT, () => {
          console.log(`🚀 Server listening on port ${PORT}`);
      });
  };

  startServer();