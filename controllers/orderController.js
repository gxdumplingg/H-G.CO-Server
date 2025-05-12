const Order = require('../models/Order');
const Product = require('../models/Product');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
    try {
        const {
            items,
            shipping_address,
            note
        } = req.body;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có sản phẩm trong đơn hàng'
            });
        }

        // Validate shipping address
        if (!shipping_address || !shipping_address.full_name || !shipping_address.phone ||
            !shipping_address.address || !shipping_address.city ||
            !shipping_address.district || !shipping_address.ward) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin địa chỉ giao hàng không đầy đủ'
            });
        }

        // Tính tổng tiền và validate sản phẩm
        let total_amount = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product_id)
                .populate({
                    path: 'attributes',
                    match: { _id: item.variant_id }
                });

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Không tìm thấy sản phẩm với ID: ${item.product_id}`
                });
            }

            const variant = product.attributes[0];
            if (!variant) {
                return res.status(400).json({
                    success: false,
                    message: `Không tìm thấy biến thể với ID: ${item.variant_id}`
                });
            }

            if (variant.qty_in_stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Số lượng sản phẩm ${product.name} không đủ`
                });
            }

            // Thêm giá vào item
            validatedItems.push({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: variant.price
            });

            total_amount += variant.price * item.quantity;
        }

        // Tạo mã đơn hàng duy nhất
        let order_number;
        let isUnique = false;

        while (!isUnique) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            order_number = `ORD${timestamp}${random}`;

            // Kiểm tra xem order_number đã tồn tại chưa
            const existingOrder = await Order.findOne({ order_number });
            if (!existingOrder) {
                isUnique = true;
            }
        }

        // Tạo đơn hàng mới
        const order = new Order({
            user_id: req.user._id,
            order_number,
            items: validatedItems,
            total_amount,
            shipping_address,
            note
        });

        // Lưu đơn hàng
        const savedOrder = await order.save();

        // Cập nhật số lượng sản phẩm
        for (const item of validatedItems) {
            await Product.updateOne(
                {
                    _id: item.product_id,
                    'attributes._id': item.variant_id
                },
                {
                    $inc: {
                        'attributes.$.qty_in_stock': -item.quantity
                    }
                }
            );
        }

        res.status(201).json({
            success: true,
            data: savedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Lấy danh sách đơn hàng của user
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user._id })
            .populate({
                path: 'items.product_id',
                select: 'name main_image'
            })
            .populate({
                path: 'items.variant_id',
                populate: [
                    { path: 'color_id', select: 'name color_code' },
                    { path: 'size_id', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy chi tiết đơn hàng
const getOrderDetail = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user_id: req.user._id
        })
            .populate({
                path: 'items.product_id',
                select: 'name main_image'
            })
            .populate({
                path: 'items.variant_id',
                populate: [
                    { path: 'color_id', select: 'name color_code' },
                    { path: 'size_id', select: 'name' }
                ]
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Hủy đơn hàng
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user_id: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        if (order.order_status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng này'
            });
        }

        // Cập nhật trạng thái đơn hàng
        order.order_status = 'CANCELLED';
        await order.save();

        // Hoàn trả số lượng sản phẩm
        for (const item of order.items) {
            await Product.updateOne(
                {
                    _id: item.product_id,
                    'attributes._id': item.variant_id
                },
                {
                    $inc: {
                        'attributes.$.qty_in_stock': item.quantity
                    }
                }
            );
        }

        res.json({
            success: true,
            message: 'Hủy đơn hàng thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderDetail,
    cancelOrder
};