const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { cache } = require('../config/redis');
const { processImage } = require('../middleware/upload');

// Get all products with advanced filtering
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { 
    category,
    subcategory,
    minPrice, 
    maxPrice, 
    organic,
    quality,
    state,
    district,
    seller,
    search,
    tags,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 20,
    featured = false
  } = req.query;

  // Build query
  const query = { isActive: true };
  
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (organic !== undefined) query.organic = organic === 'true';
  if (quality) query.quality = quality;
  if (featured === 'true') query.isFeatured = true;
  if (seller) query.seller = seller;
  if (state) query['location.state'] = state;
  if (district) query['location.district'] = district;
  if (tags) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }
  
  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }
  
  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Check cache first
  const cacheKey = `products:${JSON.stringify({ query, sortBy, order, page, limit })}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return res.json(new ApiResponse(200, cached, 'Products fetched from cache'));
  }

  // Execute query
  const totalProducts = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('seller', 'name location contact ratings profileImage')
    .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Increment view count for products
  const productIds = products.map(p => p._id);
  await Product.updateMany(
    { _id: { $in: productIds } },
    { $inc: { views: 1 } }
  );

  const result = {
    products,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      limit: parseInt(limit),
      hasNext: page * limit < totalProducts,
      hasPrev: page > 1
    },
    filters: {
      applied: Object.keys(req.query).filter(k => !['page', 'limit', 'sortBy', 'order'].includes(k)),
      available: {
        categories: await Product.distinct('category', { isActive: true }),
        states: await Product.distinct('location.state', { isActive: true }),
        qualities: ['A', 'B', 'C']
      }
    }
  };

  // Cache for 5 minutes
  await cache.set(cacheKey, result, 300);

  res.json(new ApiResponse(200, result, 'Products fetched successfully'));
});

// Get single product with related products
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name email contact location ratings profileImage bankDetails.accountHolderName');
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Increment view count
  product.views += 1;
  await product.save();

  // Find related products
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true
  })
  .limit(4)
  .select('name price images ratings unit');

  res.json(
    new ApiResponse(200, {
      product,
      relatedProducts
    }, 'Product details fetched successfully')
  );
});

// Create new product with image upload
exports.createProduct = asyncHandler(async (req, res) => {
  // Check if user is a farmer
  if (req.user.role !== 'Farmer' && req.user.role !== 'Admin') {
    throw new ApiError(403, 'Only farmers can list products');
  }

  // Process uploaded images
  const images = req.files?.map(file => `/uploads/products/${file.filename}`) || [];
  
  const productData = {
    ...req.body,
    seller: req.userId,
    images,
    location: req.body.location || req.user.address // Use seller's location if not provided
  };
  
  const product = await Product.create(productData);
  
  const populatedProduct = await Product.findById(product._id)
    .populate('seller', 'name location contact');

  // Send notification to buyers in the area
  const io = req.app.get('io');
  io.to(`location:${product.location.state}`).emit('new-product', {
    product: populatedProduct,
    message: `New ${product.category} available from ${product.location.district}`
  });

  // Clear product cache
  await cache.del('products:*');
  
  res.status(201).json(
    new ApiResponse(201, populatedProduct, 'Product listed successfully')
  );
});

// Update product with validation
exports.updateProduct = asyncHandler(async (req, res) => {
  // Find product and verify ownership
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Check ownership
  if (product.seller.toString() !== req.userId && req.user.role !== 'Admin') {
    throw new ApiError(403, 'You are not authorized to update this product');
  }

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
    req.body.images = [...(product.images || []), ...newImages];
  }

  // Update product
  Object.assign(product, req.body);
  await product.save();
  
  const updatedProduct = await Product.findById(product._id)
    .populate('seller', 'name location contact');

  // Clear cache
  await cache.del('products:*');
  
  res.json(
    new ApiResponse(200, updatedProduct, 'Product updated successfully')
  );
});

// Delete product (soft delete)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Check ownership
  if (product.seller.toString() !== req.userId && req.user.role !== 'Admin') {
    throw new ApiError(403, 'You are not authorized to delete this product');
  }
  
  product.isActive = false;
  product.deletedAt = Date.now();
  await product.save();

  // Clear cache
  await cache.del('products:*');
  
  res.json(
    new ApiResponse(200, null, 'Product deleted successfully')
  );
});

// Get farmer's own products with statistics
exports.getMyProducts = asyncHandler(async (req, res) => {
  const { status = 'active', sortBy = 'createdAt', order = 'desc' } = req.query;
  
  const query = { seller: req.userId };
  if (status === 'active') query.isActive = true;
  else if (status === 'inactive') query.isActive = false;
  
  const products = await Product.find(query)
    .sort({ [sortBy]: order === 'desc' ? -1 : 1 });
  
  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.isActive).length,
    totalViews: products.reduce((sum, p) => sum + p.views, 0),
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    outOfStock: products.filter(p => p.quantity === 0).length
  };
  
  res.json(
    new ApiResponse(200, { products, stats }, 'Products fetched successfully')
  );
});

// Update product stock
exports.updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation = 'add' } = req.body;
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Check ownership
  if (product.seller.toString() !== req.userId && req.user.role !== 'Admin') {
    throw new ApiError(403, 'Unauthorized to update stock');
  }
  
  await product.updateStock(quantity, operation);
  
  res.json(
    new ApiResponse(200, product, 'Stock updated successfully')
  );
});

// Bulk update products
exports.bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { productIds, updates } = req.body;
  
  // Verify ownership of all products
  const products = await Product.find({
    _id: { $in: productIds },
    seller: req.userId
  });
  
  if (products.length !== productIds.length) {
    throw new ApiError(403, 'You can only update your own products');
  }
  
  // Perform bulk update
  await Product.updateMany(
    { _id: { $in: productIds } },
    { $set: updates }
  );
  
  // Clear cache
  await cache.del('products:*');
  
  res.json(
    new ApiResponse(200, null, `${productIds.length} products updated successfully`)
  );
});

// Get product analytics
exports.getProductAnalytics = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Check ownership
  if (product.seller.toString() !== req.userId && req.user.role !== 'Admin') {
    throw new ApiError(403, 'Unauthorized to view analytics');
  }
  
  // Get analytics data
  const analytics = {
    views: product.views,
    ratings: product.ratings,
    stock: {
      current: product.quantity,
      status: product.quantity > 0 ? 'in_stock' : 'out_of_stock'
    },
    performance: {
      viewsPerDay: Math.round(product.views / Math.max(1, Math.floor((Date.now() - product.createdAt) / (1000 * 60 * 60 * 24)))),
      conversionRate: 0 // TODO: Calculate from orders
    }
  };
  
  res.json(
    new ApiResponse(200, analytics, 'Analytics fetched successfully')
  );
});

// Get categories with counts
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        subcategories: { $addToSet: '$subcategory' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  res.json(
    new ApiResponse(200, categories, 'Categories fetched successfully')
  );
});

// Featured products with caching
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  
  // Check cache
  const cacheKey = `featured:${limit}`;
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return res.json(new ApiResponse(200, cached, 'Featured products from cache'));
  }
  
  const products = await Product.find({ 
    isActive: true,
    isFeatured: true 
  })
  .populate('seller', 'name location')
  .sort({ 'ratings.average': -1, views: -1 })
  .limit(limit);
  
  // Cache for 1 hour
  await cache.set(cacheKey, products, 3600);
  
  res.json(
    new ApiResponse(200, products, 'Featured products fetched successfully')
  );
});

// Get trending products
exports.getTrendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort({ views: -1, 'ratings.average': -1 })
    .limit(10)
    .populate('seller', 'name');
  
  res.json(
    new ApiResponse(200, products, 'Trending products fetched successfully')
  );
});

// Rate a product
exports.rateProduct = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;
  const productId = req.params.id;
  
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Update ratings
  const newCount = product.ratings.count + 1;
  const newAverage = ((product.ratings.average * product.ratings.count) + rating) / newCount;
  
  product.ratings = {
    average: newAverage,
    count: newCount
  };
  
  await product.save();
  
  res.json(
    new ApiResponse(200, product, 'Product rated successfully')
  );
});

// Search products
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q, category, limit = 20 } = req.query;
  
  const query = { isActive: true };
  
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ];
  }
  
  if (category) {
    query.category = category;
  }
  
  const products = await Product.find(query)
    .populate('seller', 'name location')
    .limit(parseInt(limit))
    .sort({ views: -1 });
  
  res.json(
    new ApiResponse(200, products, 'Products found')
  );
});

// Get products by category
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 20, page = 1 } = req.query;
  
  const skip = (page - 1) * limit;
  
  const products = await Product.find({ 
    category, 
    isActive: true 
  })
    .populate('seller', 'name location')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
  
  const total = await Product.countDocuments({ category, isActive: true });
  
  res.json(
    new ApiResponse(200, {
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    }, 'Products fetched successfully')
  );
});
