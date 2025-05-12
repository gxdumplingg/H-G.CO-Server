const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Get all orders with pagination and optional status filtering
 * @route GET /api/v1/admin/orders
 * @access Private/Admin
 */
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter based on query parameters
    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name avatar')
      .populate('items.product', 'name');

    // Get total count for pagination
    const totalCount = await Order.countDocuments(filter);

    // Format orders for frontend display
    const formattedOrders = orders.map(order => ({
      id: order._id,
      product: order.items[0]?.product?.name || 'Multiple Products',
      date: order.createdAt,
      customer: order.user?.name || 'Guest',
      status: order.status,
      amount: order.totalAmount,
      avatar: order.user?.avatar || null
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve orders'
    });
  }
};

/**
 * Get single order by ID
 * @route GET /api/v1/admin/orders/:id
 * @access Private/Admin
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('items.product', 'name price images SKU');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve order details'
    });
  }
};

/**
 * Update order status
 * @route PUT /api/v1/admin/orders/:id
 * @access Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update order status'
    });
  }
};

/**
 * Delete an order
 * @route DELETE /api/v1/admin/orders/:id
 * @access Private/Admin
 */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.remove();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Could not delete order'
    });
  }
};

// Tạo đơn hàng từ giỏ hàng
const createOrderFromCart = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Validate input
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin địa chỉ giao hàng hoặc phương thức thanh toán'
      });
    }

    // Kiểm tra thông tin địa chỉ
    const { fullName, address, city, country, phone } = shippingAddress;
    if (!fullName || !address || !city || !country || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin địa chỉ giao hàng'
      });
    }

    // Lấy giỏ hàng của user
    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    // Lấy thông tin chi tiết sản phẩm và kiểm tra tồn kho
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product_id)
        .populate({
          path: 'attributes',
          match: { _id: item.variant_id }
        });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm với ID: ${item.product_id}`
        });
      }

      const variant = product.attributes[0];
      if (!variant) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy biến thể sản phẩm với ID: ${item.variant_id}`
        });
      }

      // Kiểm tra số lượng tồn kho
      if (variant.qty_in_stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" chỉ còn ${variant.qty_in_stock} sản phẩm trong kho`
        });
      }

      // Thêm vào danh sách sản phẩm đặt hàng
      const price = variant.price || product.price;
      orderItems.push({
        product: item.product_id,
        quantity: item.quantity,
        price: price
      });

      // Tính tổng giá trị đơn hàng
      itemsPrice += price * item.quantity;

      // Giảm số lượng tồn kho
      variant.qty_in_stock -= item.quantity;
      await product.save();
    }

    // Tính phí vận chuyển và thuế
    const shippingPrice = itemsPrice > 500000 ? 0 : 30000; // Miễn phí ship cho đơn > 500k
    const taxRate = 0.1; // 10% thuế
    const taxPrice = Math.round(itemsPrice * taxRate);
    const totalAmount = itemsPrice + shippingPrice + taxPrice;

    // Tạo đơn hàng mới
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalAmount,
      status: 'Pending',
      isPaid: paymentMethod === 'COD' ? false : true, // Nếu thanh toán online thì đánh dấu đã thanh toán
      paidAt: paymentMethod === 'COD' ? null : Date.now()
    });

    // Lưu đơn hàng
    const savedOrder = await order.save();

    // Xóa giỏ hàng sau khi đặt hàng thành công
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: savedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng',
      error: error.message
    });
  }
};

// Lấy danh sách đơn hàng của user
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// Lấy chi tiết đơn hàng
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price images')
      .populate('user', 'username email_address');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra quyền truy cập
    if (order.user._id.toString() !== req.user._id.toString() && req.user.roleId.name !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập đơn hàng này'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin đơn hàng',
      error: error.message
    });
  }
};

// Hủy đơn hàng (chỉ cho phép hủy khi đơn hàng ở trạng thái Pending)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra quyền truy cập
    if (order.user.toString() !== req.user._id.toString() && req.user.roleId.name !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền hủy đơn hàng này'
      });
    }

    // Chỉ cho phép hủy đơn hàng ở trạng thái Pending
    if (order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy đơn hàng ở trạng thái đang xử lý'
      });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = 'Canceled';

    // Hoàn trả số lượng sản phẩm vào kho
    for (const item of order.items) {
      const product = await Product.findById(item.product)
        .populate({
          path: 'attributes',
          match: { _id: item.variant_id }
        });

      if (product && product.attributes[0]) {
        product.attributes[0].qty_in_stock += item.quantity;
        await product.save();
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy đơn hàng',
      error: error.message
    });
  }
};

module.exports = {
  createOrderFromCart,
  getMyOrders,
  getOrderDetails,
  cancelOrder
}; 