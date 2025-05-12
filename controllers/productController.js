const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

/**
 * Get all products
 * @route GET /api/v1/admin/products
 * @access Private/Admin
 */
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with pagination
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category_id', 'name');

    // Get total count for pagination
    const totalCount = await Product.countDocuments();

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve products'
    });
  }
};

/**
 * Get products by category
 * @route GET /api/v1/admin/products/category/:id
 * @access Private/Admin
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get products by category with pagination
    const products = await Product.find({ category_id: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category_id', 'name');

    // Get total count for pagination
    const totalCount = await Product.countDocuments({ category_id: id });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve products'
    });
  }
};

/**
 * Search products
 * @route GET /api/v1/products/search
 * @access Public
 */
exports.searchProducts = async (req, res) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    // Create regex for search (case insensitive)
    const searchRegex = new RegExp(term, 'i');

    // Search products by name, description, or SKU
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { SKU: searchRegex },
        { tags: searchRegex }
      ]
    })
      .populate('category_id', 'name')
      .select('name images price description');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get product by ID
 * @route GET /api/v1/admin/products/:id
 * @access Private/Admin
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category_id', 'name')
      .populate('attributes');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve product details'
    });
  }
};

/**
 * Create a new product
 * @route POST /api/v1/admin/products
 * @access Private/Admin
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      sale_price,
      category_id,
      SKU,
      qty_in_stock,
      tags,
      attributes
    } = req.body;

    // Basic validation
    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if SKU already exists
    if (SKU) {
      const existingProduct = await Product.findOne({ SKU });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }

    // Prepare product data
    const productData = {
      name,
      description,
      price,
      sale_price,
      category_id,
      SKU,
      qty_in_stock,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      attributes
    };

    // Add image data if images were uploaded
    if (req.body.images && req.body.images.length > 0) {
      productData.images = req.body.images;
    }

    // Create product
    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Could not create product'
    });
  }
};

/**
 * Update a product
 * @route PUT /api/v1/admin/products/:id
 * @access Private/Admin
 */
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      sale_price,
      category_id,
      SKU,
      qty_in_stock,
      tags,
      attributes,
      existing_images
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if SKU already exists (only if it's being changed)
    if (SKU && SKU !== product.SKU) {
      const existingProduct = await Product.findOne({ SKU });
      if (existingProduct && existingProduct._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (sale_price !== undefined) product.sale_price = sale_price;
    if (category_id) {
      // Verify category exists
      const categoryExists = await Category.findById(category_id);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
      product.category_id = category_id;
    }
    if (SKU) product.SKU = SKU;
    if (qty_in_stock !== undefined) product.qty_in_stock = qty_in_stock;
    if (tags) product.tags = tags.split(',').map(tag => tag.trim());
    if (attributes) product.attributes = attributes;

    // Handle image updates
    const { deleteFromCloudinary } = require('../utils/cloudinary');

    // Check which existing images to keep
    const existingImageIds = Array.isArray(existing_images)
      ? existing_images
      : (existing_images ? [existing_images] : []);

    // Delete images that are no longer in the existingImageIds list
    if (product.images && product.images.length > 0) {
      // Find images to delete (not in existingImageIds)
      const imagesToDelete = product.images.filter(img =>
        !existingImageIds.includes(img.public_id)
      );

      // Delete from Cloudinary
      for (const image of imagesToDelete) {
        try {
          await deleteFromCloudinary(image.public_id);
        } catch (err) {
          console.error(`Failed to delete image ${image.public_id}:`, err);
        }
      }

      // Keep only images in existingImageIds
      product.images = product.images.filter(img =>
        existingImageIds.includes(img.public_id)
      );
    }

    // Add new images if uploaded
    if (req.body.images && req.body.images.length > 0) {
      // Add new images to existing ones
      product.images = [...product.images, ...req.body.images];
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update product'
    });
  }
};

/**
 * Delete a product
 * @route DELETE /api/v1/admin/products/:id
 * @access Private/Admin
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      const { deleteFromCloudinary } = require('../utils/cloudinary');
      for (const image of product.images) {
        if (image.public_id) {
          try {
            await deleteFromCloudinary(image.public_id);
          } catch (err) {
            console.error(`Failed to delete image ${image.public_id}:`, err);
          }
        }
      }
    }

    await product.remove();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Could not delete product'
    });
  }
};

/**
 * Get products by tags
 * @route GET /api/v1/products/tags
 * @access Public
 */
exports.getProductsByTags = async (req, res) => {
  try {
    const { tags } = req.query;

    if (!tags) {
      return res.status(400).json({
        success: false,
        message: 'Tags parameter is required'
      });
    }

    const tagArray = tags.split(',').map(tag => tag.trim());

    const products = await Product.find({ tags: { $in: tagArray } })
      .populate('category_id', 'name')
      .select('name images price tags');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error getting products by tags:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 