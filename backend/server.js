import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';

// Import routes
import authRoutes from './routes/auth.js';
import recordsRoutes from './routes/records.js';
import consentRoutes from './routes/consent.js';
import auditRoutes from './routes/audit.js';
import complianceRoutes from './routes/compliance.js';
import emergencyRoutes from './routes/emergency.js';
import patientRoutes from './routes/patient.js';

// Import services
import blockchainService from './services/blockchainService.js';
import { 
  initSentry, 
  sentryRequestHandler, 
  sentryTracingHandler, 
  sentryErrorHandler 
} from './services/sentryService.js';

// Import middleware
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Sentry (must be first)
initSentry(app);

// Sentry request handler (must be first middleware)
if (process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'your-sentry-dsn-here') {
  app.use(sentryRequestHandler());
  app.use(sentryTracingHandler());
}

// Initialize Socket.io
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST']
  }
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB injection protection
app.use(mongoSanitize());

// HTTP Parameter Pollution protection
app.use(hpp());

// Compression
app.use(compression());

// Rate limiting for all API routes
app.use('/api/', apiLimiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myhealthid')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Initialize blockchain service
blockchainService.initialize()
  .then(() => console.log('✅ Blockchain service ready'))
  .catch(err => console.error('❌ Blockchain initialization error:', err));

// Track connected users for cleaner logging
const connectedUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  // Only log in development with minimal noise
  if (process.env.NODE_ENV !== 'production') {
    const clientCount = io.engine.clientsCount;
    console.log(`🔌 Socket connected (${clientCount} active)`);
  }

  // Join room based on user ID
  socket.on('join', (userId) => {
    // Prevent duplicate join logs for same user
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
      console.log(`👤 ${userId} connected to real-time updates`);
    }
    connectedUsers.get(userId).add(socket.id);
    socket.join(userId);
  });

  // Leave room
  socket.on('leave', (userId) => {
    if (connectedUsers.has(userId)) {
      connectedUsers.get(userId).delete(socket.id);
      if (connectedUsers.get(userId).size === 0) {
        connectedUsers.delete(userId);
        console.log(`👋 ${userId} disconnected from real-time updates`);
      }
    }
    socket.leave(userId);
  });

  socket.on('disconnect', () => {
    // Clean up user from connected users map
    for (const [userId, sockets] of connectedUsers.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          connectedUsers.delete(userId);
          if (process.env.NODE_ENV !== 'production') {
            console.log(`👋 ${userId} session ended`);
          }
        }
        break;
      }
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const blockchainInfo = await blockchainService.getNetworkInfo();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      mongodb: mongoStatus,
      blockchain: blockchainInfo ? 'connected' : 'disconnected',
      socketio: 'running',
      sentry: process.env.SENTRY_DSN ? 'enabled' : 'disabled'
    },
    blockchain: blockchainInfo
  });
});

// Sentry test endpoint (development only)
app.get('/debug-sentry', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  throw new Error('Sentry Test Error - This is a test error to verify Sentry is working!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/patient', patientRoutes);

// Sentry error handler (must be after routes, before other error handlers)
if (process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'your-sentry-dsn-here') {
  app.use(sentryErrorHandler());
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Send appropriate error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({ 
    error: statusCode >= 500 ? 'Internal server error' : message,
    message: process.env.NODE_ENV === 'development' ? message : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log('\n🚀 MyHealthID Backend Server');
  console.log(`📡 HTTP API: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⛓️  Blockchain: ${process.env.CONTRACT_ADDRESS ? 'Enabled' : 'Disabled'}`);
  console.log('\n📚 API Endpoints:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  POST   /api/records/upload');
  console.log('  GET    /api/records/:patientId');
  console.log('  POST   /api/consent/request');
  console.log('  POST   /api/consent/approve');
  console.log('  GET    /api/audit/:patientId');
  console.log('  GET    /health');
  console.log('\n✨ Ready to handle requests!\n');
});

export default app;
