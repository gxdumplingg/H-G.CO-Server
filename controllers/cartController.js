const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        const { product_id, variant_id, quantity } = req.body;

        // Validate input
        if (!product_id || !variant_id || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin sản phẩm'
            });
        }

        // Kiểm tra sản phẩm và biến thể
        const product = await Product.findById(product_id)
            .populate({
                path: 'attributes',
                match: { _id: variant_id }
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const variant = product.attributes[0];
        if (!variant) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy biến thể sản phẩm'
            });
        }

        // Kiểm tra giá sản phẩm
        if (typeof product.price === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm chưa có giá'
            });
        }

        // Kiểm tra số lượng tồn kho
        if (variant.qty_in_stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng sản phẩm trong kho không đủ'
            });
        }

        // Tìm hoặc tạo giỏ hàng mới
        let cart = await Cart.findOne({ user_id: req.user._id });

        if (!cart) {
            cart = new Cart({
                user_id: req.user._id,
                items: []
            });
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItemIndex = cart.items.findIndex(
            item => item.product_id.toString() === product_id &&
                item.variant_id.toString() === variant_id
        );

        if (existingItemIndex > -1) {
            // Cập nhật số lượng nếu sản phẩm đã có trong giỏ
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;

            // Kiểm tra lại số lượng tồn kho
            if (variant.qty_in_stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng sản phẩm trong kho không đủ'
                });
            }

            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Thêm sản phẩm mới vào giỏ
            cart.items.push({
                product_id,
                variant_id,
                quantity
            });
        }

        await cart.save();

        // Populate thông tin sản phẩm để trả về
        await cart.populate([
            {
                path: 'items.product_id',
                select: 'name price images'
            },
            {
                path: 'items.variant_id',
                select: 'color size qty_in_stock'
            }
        ]);

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy thông tin giỏ hàng
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user_id: req.user._id })
            .populate([
                {
                    path: 'items.product_id',
                    select: 'name price images'
                },
                {
                    path: 'items.variant_id',
                    select: 'color size qty_in_stock'
                }
            ]);

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    items: [],
                    total_amount: 0
                }
            });
        }

        // Tính tổng tiền từ giá sản phẩm
        const total_amount = cart.items.reduce((total, item) => {
            if (!item.product_id || typeof item.product_id.price === 'undefined') {
                return total;
            }
            return total + (item.product_id.price * item.quantity);
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                ...cart.toObject(),
                total_amount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (req, res) => {
    try {
        const { product_id, variant_id, quantity } = req.body;

        if (!product_id || !variant_id || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin sản phẩm'
            });
        }

        const cart = await Cart.findOne({ user_id: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giỏ hàng'
            });
        }

        // Kiểm tra sản phẩm trong giỏ
        const itemIndex = cart.items.findIndex(
            item => item.product_id.toString() === product_id &&
                item.variant_id.toString() === variant_id
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm trong giỏ hàng'
            });
        }

        // Kiểm tra số lượng tồn kho
        const product = await Product.findById(product_id)
            .populate({
                path: 'attributes',
                match: { _id: variant_id }
            });

        const variant = product.attributes[0];
        if (variant.qty_in_stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng sản phẩm trong kho không đủ'
            });
        }

        // Cập nhật số lượng
        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        // Populate thông tin sản phẩm
        await cart.populate([
            {
                path: 'items.product_id',
                select: 'name price images'
            },
            {
                path: 'items.variant_id',
                select: 'color size price qty_in_stock'
            }
        ]);

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
    try {
        const { product_id, variant_id } = req.body;

        if (!product_id || !variant_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin sản phẩm'
            });
        }

        const cart = await Cart.findOne({ user_id: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giỏ hàng'
            });
        }

        // Lọc bỏ sản phẩm
        cart.items = cart.items.filter(
            item => !(item.product_id.toString() === product_id &&
                item.variant_id.toString() === variant_id)
        );

        await cart.save();

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart
};