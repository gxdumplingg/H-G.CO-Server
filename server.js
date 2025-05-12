const express = require('express');
const mongoose = require('mongoose');
require('dotenv/config');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');


const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const orderRouter = require('./routes/orderRoutes');
const adminRouter = require('./routes/adminRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const cartRouter = require('./routes/cartRoutes');
const userRouter = require('./routes/userRoutes');
const imagesRouter = require('./routes/uploadRoutes');
const roleRouter = require('./routes/rolesRoutes');

//const routerImages = require('./routes/uploadRoutes');
const app = express();
const api = process.env.API_URL;

app.use(cors({
    origin: 'http://localhost:5500',
    credentials: true
}));
// middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/auth`, userRouter);
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/admin`, adminRouter);
app.use(`${api}/admin/dashboard`, dashboardRouter);
app.use(`${api}/cart`, cartRouter);
app.use(`${api}/images`, imagesRouter);
app.use(`${api}/roles`, roleRouter);
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