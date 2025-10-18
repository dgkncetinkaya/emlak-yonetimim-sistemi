import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import xss from 'xss';

// Rate limiting configuration
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  50, // 50 attempts (increased for development)
  'Too many authentication attempts, please try again later'
);

export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many API requests, please try again later'
);

export const webhookRateLimit = createRateLimit(
  1 * 60 * 1000, // 1 minute
  50, // 50 requests
  'Too many webhook requests'
);

export const adminRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  200, // 200 requests for admin operations
  'Too many admin requests'
);

// Helmet security configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.stripe.com', 'https://sandbox-api.iyzipay.com', 'https://api.iyzipay.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration
export const corsConfig = cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://yourdomain.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
});

// JWT Authentication middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin role requirement
export const requireAdmin = requireRole(['admin', 'super_admin']);

// Input validation and sanitization middleware
export const validateAndSanitize = (validationRules) => {
  return (req, res, next) => {
    const errors = [];

    // Sanitize all string inputs
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // XSS protection
          obj[key] = xss(obj[key]);
          // Trim whitespace
          obj[key] = obj[key].trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    // Sanitize request body
    if (req.body) {
      sanitizeObject(req.body);
    }

    // Apply validation rules
    if (validationRules) {
      for (const field in validationRules) {
        const rules = validationRules[field];
        const value = req.body[field];

        // Required field validation
        if (rules.required && (!value || value === '')) {
          errors.push(`${field} is required`);
          continue;
        }

        // Skip further validation if field is not required and empty
        if (!rules.required && (!value || value === '')) {
          continue;
        }

        // Email validation
        if (rules.email && !validator.isEmail(value)) {
          errors.push(`${field} must be a valid email`);
        }

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }

        // Numeric validation
        if (rules.numeric && !validator.isNumeric(value.toString())) {
          errors.push(`${field} must be numeric`);
        }

        // URL validation
        if (rules.url && !validator.isURL(value)) {
          errors.push(`${field} must be a valid URL`);
        }

        // Custom validation
        if (rules.custom && typeof rules.custom === 'function') {
          const customResult = rules.custom(value);
          if (customResult !== true) {
            errors.push(customResult || `${field} is invalid`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Password hashing utility
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password verification utility
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT token generation
export const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn,
    issuer: 'emlak-yonetim-sistemi',
    audience: 'emlak-yonetim-users'
  });
};

// JWT token verification
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log request details (avoid logging sensitive data)
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    // Add user info if available (without sensitive data)
    if (req.user) {
      logData.userId = req.user.id;
      logData.userRole = req.user.role;
    }

    console.log('Request:', JSON.stringify(logData));
    
    originalSend.call(this, data);
  };

  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: isDevelopment ? err.message : undefined
    });
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden'
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      error: 'Not found'
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: isDevelopment ? err.message : undefined
  });
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      const localhostIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
      if (localhostIPs.includes(clientIP)) {
        return next();
      }
    }

    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        error: 'IP address not allowed'
      });
    }

    next();
  };
};

// Session security middleware
export const sessionSecurity = (req, res, next) => {
  // Set secure session cookies
  if (req.session) {
    req.session.cookie.secure = process.env.NODE_ENV === 'production';
    req.session.cookie.httpOnly = true;
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    req.session.cookie.sameSite = 'strict';
  }
  
  next();
};

export default {
  createRateLimit,
  authRateLimit,
  apiRateLimit,
  webhookRateLimit,
  adminRateLimit,
  helmetConfig,
  corsConfig,
  authenticateToken,
  requireRole,
  requireAdmin,
  validateAndSanitize,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  requestLogger,
  errorHandler,
  securityHeaders,
  ipWhitelist,
  sessionSecurity
};