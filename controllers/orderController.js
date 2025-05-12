const Order = require('../models/Order');
const User = require('../models/User');

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