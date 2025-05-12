const express = require('express');
const mongoose = require('mongoose');
require('dotenv/config');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');


const Product = require('./models/Product');
const productRouter = require('./routes/products');

const Category = require('./models/Category');
const categoryRouter = require('./routes/category');

const User = require('./models/User');
const userRouter = require('./routes/users');

const authRouter = require('./routes/auth');
const orderRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');
const dashboardRouter = require('./routes/dashboard');

//const routerImages = require('./routes/uploadRoutes');
const app = express();
const api = process.env.API_URL || '/api/v1';

app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));
// middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/auth`, authRouter);
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/admin`, adminRouter);
app.use(`${api}/admin/dashboard`, dashboardRouter);
//app.use(`${api}/images`, routerImages);


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "HnGshop"
        });
        console.log('Kết nối DB thành công');
    } catch (error) {
        console.error('Lỗi kết nối DB:', error);
        process.exit(1);
    }
};



const PORT = process.env.PORT;
const startServer = async () => {
    await connectDB(); // Đợi kết nối DB thành công
    app.listen(PORT, () => {
        console.log(`🚀 Server listening on port ${PORT}`);
    });
};

startServer();