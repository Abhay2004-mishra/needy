require('dotenv').config();
const path = require('path');
const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length;
const isProd = process.env.NODE_ENV === 'production';

// In production, use all CPU cores via clustering
if (isProd && cluster.isPrimary) {
  console.log(`\n🔧 Primary process ${process.pid} starting ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    console.log(`⚠️  Worker ${worker.process.pid} died (code: ${code}). Restarting...`);
    cluster.fork();
  });
} else {
  // Worker process or development mode
  startServer();
}

function startServer() {
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');
  const compression = require('compression');
  const rateLimit = require('express-rate-limit');
  const mongoSanitize = require('express-mongo-sanitize');
  const hpp = require('hpp');
  const connectDB = require('./config/db');

  // Import routes
  const authRoutes = require('./routes/auth');
  const jobRoutes = require('./routes/jobs');
  const bookingRoutes = require('./routes/bookings');
  const userRoutes = require('./routes/users');
  const adminRoutes = require('./routes/admin');
  const messageRoutes = require('./routes/messages');
  const paymentRoutes = require('./routes/payments');

  const app = express();

  // Connect to MongoDB
  connectDB();

  // Trust proxy (for Render, Railway, etc.)
  app.set('trust proxy', 1);

  // Gzip compression - reduces response size by ~70%
  app.use(compression());

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: isProd ? undefined : false
  }));

  // Prevent NoSQL injection attacks
  app.use(mongoSanitize());

  // Prevent HTTP parameter pollution
  app.use(hpp());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/', limiter);

  // Stricter rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' }
  });
  app.use('/api/auth', authLimiter);

  // CORS configuration
  const allowedOrigins = isProd 
    ? (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim())
    : /^http:\/\/localhost/; // Allow any localhost origin in development

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, server-to-server, requests without origin header)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      const isAllowed = isProd 
        ? allowedOrigins.includes(origin)
        : allowedOrigins.test(origin);
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  }));

  // Body parser with size limits
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Logging - concise in production
  if (isProd) {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check (for load balancers / uptime monitors)
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'JobConnect API is running',
      environment: process.env.NODE_ENV,
      pid: process.pid,
      uptime: Math.floor(process.uptime()) + 's',
      timestamp: new Date().toISOString()
    });
  });

  // Serve frontend in production
  if (isProd) {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });
  }

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: isProd ? 'Internal Server Error' : err.message
    });
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`\n🚀 JobConnect Server [Worker ${process.pid}] on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
  });
}
