import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import { registerRoutes, setWebSocketManager } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { MenuWebSocketManager } from "./websocket";
import bcrypt from "bcrypt";
import { closeRedis } from "./redis";
import { pool } from "./db";

export let wsManager: MenuWebSocketManager;

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "ws:", "wss:", "https://www.google-analytics.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://www.googletagmanager.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Permissions-Policy header
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// Compression middleware - reduces response size by ~70%
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept it
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// CORS configuration for development and production
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // No origin header (same-origin requests, curl, etc.) — allow through without CORS headers
  if (!origin) {
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  }

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

  // Allow configured origins; localhost only in development
  const isAllowed =
    allowedOrigins.includes(origin) ||
    (isDevelopment && isLocalhost);

  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,X-CSRF-Protection');
    res.header('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: '10mb' })); // Increase limit for AI image uploads
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CSRF protection via custom header
// All mutating API requests must include X-CSRF-Protection header.
// Custom headers trigger CORS preflight, so cross-origin requests from
// unauthorized origins are blocked by the browser before they reach the server.
app.use('/api', (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Public endpoints that don't require CSRF (no session mutation)
  const publicPaths = ['/api/feedback'];
  if (publicPaths.some(p => req.path.startsWith(p))) {
    return next();
  }

  if (req.headers['x-csrf-protection'] !== '1') {
    return res.status(403).json({ message: 'CSRF validation failed' });
  }

  next();
});

// Global error handlers for unhandled exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection]', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  // Don't exit - let the process continue handling requests
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', {
    message: error.message,
    stack: error.stack,
  });
  // For uncaught exceptions, we should exit gracefully
  // Give time to finish pending requests
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Initialize WebSocket manager with allowed origins for Origin validation
  const wsAllowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  wsManager = new MenuWebSocketManager(server, wsAllowedOrigins);
  setWebSocketManager(wsManager);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error without crashing the process
    console.error('[Error Handler]', {
      status,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Graceful shutdown handler
  const shutdown = async () => {
    log('Shutting down gracefully...');
    wsManager.close();
    await closeRedis();
    await pool.end();
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})();
