const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Get dashboard statistics
 * @route GET /api/v1/admin/dashboard/stats
 * @access Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total order value
    const totalOrdersValue = await Order.aggregate([
      { $match: { status: { $ne: 'Canceled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get active orders value
    const activeOrdersValue = await Order.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get completed orders value
    const completedOrdersValue = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get return orders value
    const returnOrdersValue = await Order.aggregate([
      { $match: { status: 'Returned' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Prepare stats data
    const stats = {
      totalOrders: totalOrdersValue[0]?.total || 0,
      activeOrders: activeOrdersValue[0]?.total || 0,
      completedOrders: completedOrdersValue[0]?.total || 0,
      returnOrders: returnOrdersValue[0]?.total || 0,
      totalUsers,
      totalProducts
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve dashboard statistics'
    });
  }
};

/**
 * Get recent orders
 * @route GET /api/v1/admin/orders/recent
 * @access Private/Admin
 */
exports.getRecentOrders = async (req, res) => {
  try {
    // Get the 10 most recent orders
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .populate('items.product', 'name');

    // Format orders for frontend display
    const formattedOrders = orders.map(order => ({
      id: order._id,
      product: order.items[0]?.product?.name || 'Multiple Products',
      date: order.createdAt,
      customer: order.user?.name || 'Guest',
      status: order.status,
      amount: order.totalAmount
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error getting recent orders:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve recent orders'
    });
  }
}; 