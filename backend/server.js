// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const winston = require('winston');

// Import custom middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import database config
const { connectDB } = require('./config/database');
const { redisClient, cache } = require('./config/redis');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'agrismart-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Import all routes
const authRoutes = require('./routes/auth');
const infoRoutes = require('./routes/info');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const soilRoutes = require('./routes/soil');
const diseaseRoutes = require('./routes/disease');
const cropRoutes = require('./routes/crop');
const priceRoutes = require('./routes/price');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true
  }
});

const PORT = process.env.PORT || 9653;

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CLIENT_URL?.split(',') || [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-API-Key'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Trust proxy - important for deployment
app.set('trust proxy', 1);

// Security middleware - must be before routes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", 'ws:', 'wss:']
    }
  },
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
}));

// Enable CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Clean user input from malicious HTML
app.use(hpp()); // Prevent HTTP parameter pollution

// Rate limiting
app.use('/api/', generalLimiter);

// Serve static files for uploads with proper headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '30d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    }
  }
}));

// Make io accessible in routes
app.set('io', io);

// Root endpoint - must be before API routes to avoid being caught by notFound middleware
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AgriSmart API is running and ready!'
  });
});

// API Routes
// Use the base paths for all routes
app.use('/api/auth', authRoutes); // for /api/auth/login, /api/auth/signup
app.use('/api/info', infoRoutes); // for /api/info/fertilizers, etc.
app.use('/api/products', productRoutes); // for /api/products
app.use('/api/orders', orderRoutes); // for /api/orders/checkout, etc.
app.use('/api/soil', soilRoutes); // for /api/soil
app.use('/api/disease', diseaseRoutes); // for /api/disease/scan
app.use('/api/crop', cropRoutes); // for /api/crop/recommendations
app.use('/api/price', priceRoutes); // for /api/price/trends

// Test connectivity endpoint (for debugging) - MUST be before error handlers
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API test successful - backend is reachable',
    timestamp: new Date().toISOString(),
    mongooseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware (MUST be after routes)
app.use(notFound);
app.use(errorHandler);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'AgriSmart API Documentation',
    baseURL: `http://localhost:${PORT}`,
    endpoints: {
      'Auth (Public)': {
        'POST /api/signup': {
          description: 'Register a new user',
          body: { name: 'string', email: 'string', password: 'string (min 6 chars)' }
        },
        'POST /api/login': {
          description: 'Login and get JWT token',
          body: { email: 'string', password: 'string' },
          returns: 'token and user object'
        },
        'POST /api/verifyToken': {
          description: 'Verify if JWT token is valid',
          headers: { Authorization: 'Bearer <token>' }
        }
      },
      'Products (Public)': {
        'GET /api/products': {
          description: 'Get all products',
          returns: 'Array of products'
        }
      },
      'Orders (Protected - Requires JWT)': {
        'POST /api/orders/checkout': {
          description: 'Create a new order',
          headers: { Authorization: 'Bearer <token>' },
          body: { products: '[{product: ObjectId, quantity: number}]', totalAmount: 'number' }
        },
        'GET /api/orders/my-orders': {
          description: 'Get all orders for logged-in user',
          headers: { Authorization: 'Bearer <token>' }
        }
      },
      'Soil Data (Protected - Requires JWT)': {
        'GET /api/soil': {
          description: 'Get user soil data',
          headers: { Authorization: 'Bearer <token>' }
        },
        'POST /api/soil': {
          description: 'Update or create soil data',
          headers: { Authorization: 'Bearer <token>' },
          body: { ph: 'number', nitrogen: 'number', potassium: 'number', phosphorus: 'number' }
        }
      },
      'Info (Public)': {
        'GET /api/info/fertilizers': 'Get all fertilizers',
        'GET /api/info/pests': 'Get all pests',
        'GET /api/info/schemes': 'Get all government schemes'
      },
      'Weather (Protected - Requires JWT)': {
        'GET /api/weather/forecast': {
          description: 'Get weather forecast',
          headers: { Authorization: 'Bearer <token>' },
          query: '?location=cityname (optional)'
        }
      }
    }
  });
});

// Socket.io configuration
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  
  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    logger.info(`User ${userId} joined their room`);
  });
  
  // Join role-based rooms
  socket.on('join-role', (role) => {
    socket.join(`role:${role}`);
    logger.info(`Socket ${socket.id} joined role room: ${role}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    logger.error(`Socket error: ${error.message}`);
  });
});

// Export io for use in controllers
app.locals.io = io;

// Initialize application
async function initializeApp() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ MongoDB connected');
    
    // Redis is optional - already attempting connection in redis.js
    if (redisClient?.isOpen) {
      logger.info('✅ Redis connected');
    } else {
      logger.warn('⚠️ Redis not available - running without cache');
    }
    
    // Start server
    startServer();
  } catch (error) {
    logger.error('❌ Failed to initialize application:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('⚠️ Running in development mode with limited functionality');
      startServer();
    }
  }
}

// Initialize the application
initializeApp();

// Start server function
function startServer() {
  // Verify environment variables
  const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
      logger.error('❌ Cannot start server in production without required environment variables');
      process.exit(1);
    }
  }

  server.listen(PORT, (err) => {
    if (err) {
      logger.error('❌ Failed to start server:', err);
      return;
    }
    logger.info(`✅ Server started on port ${PORT}`);
    logger.info(`🌐 API available at http://localhost:${PORT}`);
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
    logger.info(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
    logger.info(`🔌 WebSocket server ready for connections`);
    
    // Log environment
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    logger.info(`Redis: ${redisClient?.isOpen ? 'Connected' : 'Disconnected'}`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });
    
    // Close database connections
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      
      if (redisClient?.isOpen) {
        await redisClient.quit();
        logger.info('Redis connection closed');
      }
      
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught errors
  process.on('unhandledRejection', (err) => {
    logger.error('❌ Unhandled Promise Rejection:', err);
    if (process.env.NODE_ENV === 'production') {
      gracefulShutdown('unhandledRejection');
    }
  });

  process.on('uncaughtException', (err) => {
    logger.error('❌ Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
  });
}
