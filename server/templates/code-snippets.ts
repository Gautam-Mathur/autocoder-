export interface CodeSnippet {
  id: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
  language: 'typescript' | 'tsx' | 'css';
  framework: string;
  code: string;
  dependencies: string[];
  useCases: string[];
}

export const codeSnippets: CodeSnippet[] = [
  {
    id: 'jwt-middleware',
    name: 'JWT Authentication Middleware',
    category: 'Auth & Security',
    description: 'Express middleware that validates JWT tokens from Authorization header and attaches decoded payload to request',
    keywords: ['jwt', 'authentication', 'middleware', 'token', 'bearer'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export function jwtMiddleware(secret: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    try {
      const token = header.slice(7);
      const decoded = jwt.verify(token, secret) as AuthRequest['user'];
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}`,
    dependencies: ['jsonwebtoken', '@types/jsonwebtoken'],
    useCases: ['Protecting API routes', 'User authentication in REST APIs', 'Role-based access control'],
  },
  {
    id: 'password-hash',
    name: 'Password Hashing Utility',
    category: 'Auth & Security',
    description: 'Secure password hashing and verification using bcrypt with configurable salt rounds',
    keywords: ['password', 'hash', 'bcrypt', 'security', 'salt'],
    language: 'typescript',
    framework: 'node',
    code: `import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Must contain a number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Must contain a special character');
  return { valid: errors.length === 0, errors };
}`,
    dependencies: ['bcryptjs', '@types/bcryptjs'],
    useCases: ['User registration', 'Password reset flows', 'Credential verification'],
  },
  {
    id: 'session-setup',
    name: 'Express Session Configuration',
    category: 'Auth & Security',
    description: 'Express session setup with PostgreSQL store for persistent sessions',
    keywords: ['session', 'express', 'postgres', 'store', 'cookie'],
    language: 'typescript',
    framework: 'express',
    code: `import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

export function setupSessions(app: any, pool: Pool) {
  const PgSession = connectPgSimple(session);
  app.use(session({
    store: new PgSession({ pool, tableName: 'user_sessions', createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  }));
}`,
    dependencies: ['express-session', 'connect-pg-simple', '@types/express-session'],
    useCases: ['Server-side session management', 'Persistent login across restarts', 'Shopping cart sessions'],
  },
  {
    id: 'role-guard',
    name: 'Role-Based Access Guard',
    category: 'Auth & Security',
    description: 'Middleware that restricts route access based on user roles',
    keywords: ['role', 'guard', 'authorization', 'rbac', 'permission'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';

type Role = 'admin' | 'editor' | 'viewer';

interface AuthRequest extends Request {
  user?: { id: string; role: Role };
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireOwnership(getOwnerId: (req: Request) => string | Promise<string>) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role === 'admin') return next();
    const ownerId = await getOwnerId(req);
    if (ownerId !== req.user.id) return res.status(403).json({ error: 'Not the resource owner' });
    next();
  };
}`,
    dependencies: [],
    useCases: ['Admin-only routes', 'Editor permissions', 'Resource ownership checks'],
  },
  {
    id: 'csrf-protection',
    name: 'CSRF Protection Middleware',
    category: 'Auth & Security',
    description: 'Double-submit cookie pattern for CSRF protection on state-changing requests',
    keywords: ['csrf', 'xsrf', 'security', 'token', 'protection'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function csrfProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie('csrf-token', token, { httpOnly: false, sameSite: 'strict' });
      (req as any).csrfToken = token;
      return next();
    }
    const cookieToken = req.cookies?.['csrf-token'];
    const headerToken = req.headers['x-csrf-token'];
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next();
  };
}`,
    dependencies: ['cookie-parser'],
    useCases: ['Form submission protection', 'API mutation endpoints', 'Session-based auth apps'],
  },
  {
    id: 'rate-limiter',
    name: 'Rate Limiter Middleware',
    category: 'Auth & Security',
    description: 'Sliding window rate limiter using in-memory store with configurable limits per IP',
    keywords: ['rate', 'limit', 'throttle', 'api', 'ddos'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry { count: number; resetAt: number; }

export function rateLimiter(options: { windowMs?: number; max?: number } = {}) {
  const { windowMs = 60000, max = 100 } = options;
  const store = new Map<string, RateLimitEntry>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, windowMs);

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }
    entry.count++;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', entry.resetAt);
    if (entry.count > max) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };
}`,
    dependencies: [],
    useCases: ['API abuse prevention', 'Login attempt throttling', 'Public endpoint protection'],
  },
  {
    id: 'api-key-validation',
    name: 'API Key Validation Middleware',
    category: 'Auth & Security',
    description: 'Validates API keys from headers or query params against a store',
    keywords: ['api-key', 'authentication', 'middleware', 'key', 'validation'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface ApiKeyRecord { key: string; name: string; permissions: string[]; rateLimit: number; }

export function apiKeyValidator(getApiKey: (key: string) => Promise<ApiKeyRecord | null>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string || req.query.apiKey as string;
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const record = await getApiKey(hashedKey);
    if (!record) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    (req as any).apiKeyInfo = record;
    next();
  };
}

export function generateApiKey(): string {
  return \`sk_\${crypto.randomBytes(24).toString('hex')}\`;
}`,
    dependencies: [],
    useCases: ['Third-party API access', 'Machine-to-machine auth', 'Developer portal integration'],
  },
  {
    id: 'oauth-callback',
    name: 'OAuth2 Callback Handler',
    category: 'Auth & Security',
    description: 'Generic OAuth2 authorization code flow callback handler',
    keywords: ['oauth', 'oauth2', 'callback', 'authorization', 'social-login'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response } from 'express';

interface OAuthConfig {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  userInfoUrl: string;
}

export async function handleOAuthCallback(req: Request, res: Response, config: OAuthConfig) {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing authorization code' });

  const tokenRes = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });
  const tokens = await tokenRes.json();
  if (!tokens.access_token) return res.status(400).json({ error: 'Token exchange failed' });

  const userRes = await fetch(config.userInfoUrl, {
    headers: { Authorization: \`Bearer \${tokens.access_token}\` },
  });
  const userInfo = await userRes.json();
  return { tokens, userInfo };
}`,
    dependencies: [],
    useCases: ['Google sign-in', 'GitHub OAuth login', 'Social authentication'],
  },
  {
    id: 'two-factor-setup',
    name: 'Two-Factor Authentication Setup',
    category: 'Auth & Security',
    description: 'TOTP-based two-factor authentication setup and verification',
    keywords: ['2fa', 'totp', 'two-factor', 'mfa', 'authenticator'],
    language: 'typescript',
    framework: 'node',
    code: `import { authenticator } from 'otplib';
import qrcode from 'qrcode';

export function generateTOTPSecret(email: string, issuer: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, issuer, secret);
  return { secret, otpauth };
}

export async function generateQRCode(otpauth: string): Promise<string> {
  return qrcode.toDataURL(otpauth);
}

export function verifyTOTP(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}`,
    dependencies: ['otplib', 'qrcode', '@types/qrcode'],
    useCases: ['Account security setup', 'Login verification', 'Admin panel access'],
  },
  {
    id: 'input-sanitizer',
    name: 'Input Sanitization Middleware',
    category: 'Auth & Security',
    description: 'Sanitizes request body, query, and params to prevent XSS and injection attacks',
    keywords: ['sanitize', 'xss', 'injection', 'security', 'input'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';

function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\\//g, '&#x2F;');
  }
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      sanitized[k] = sanitizeValue(v);
    }
    return sanitized;
  }
  return value;
}

export function inputSanitizer() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) req.body = sanitizeValue(req.body);
    if (req.query) req.query = sanitizeValue(req.query);
    if (req.params) req.params = sanitizeValue(req.params);
    next();
  };
}`,
    dependencies: [],
    useCases: ['Form input sanitization', 'API input cleaning', 'Preventing stored XSS'],
  },
  {
    id: 'cors-config',
    name: 'CORS Configuration',
    category: 'Auth & Security',
    description: 'Flexible CORS setup with origin whitelist and credentials support',
    keywords: ['cors', 'cross-origin', 'security', 'headers', 'origin'],
    language: 'typescript',
    framework: 'express',
    code: `import cors from 'cors';

export function createCorsConfig(allowedOrigins: string[]) {
  return cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
    maxAge: 86400,
  });
}`,
    dependencies: ['cors', '@types/cors'],
    useCases: ['Multi-domain API access', 'Frontend-backend separation', 'Mobile app API access'],
  },
  {
    id: 'helmet-setup',
    name: 'Helmet Security Headers',
    category: 'Auth & Security',
    description: 'Comprehensive HTTP security headers using Helmet with CSP configuration',
    keywords: ['helmet', 'security', 'headers', 'csp', 'hsts'],
    language: 'typescript',
    framework: 'express',
    code: `import helmet from 'helmet';

export function setupHelmet(app: any) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  }));
}`,
    dependencies: ['helmet'],
    useCases: ['Production security hardening', 'Compliance requirements', 'Preventing clickjacking'],
  },
  {
    id: 'error-handler',
    name: 'Global Error Handler',
    category: 'Express Middleware',
    description: 'Centralized Express error handling middleware with structured error responses',
    keywords: ['error', 'handler', 'middleware', 'exception', 'catch'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code, details: err.details },
    });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
  });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}`,
    dependencies: [],
    useCases: ['Centralized error handling', 'Structured API error responses', 'Async route error catching'],
  },
  {
    id: 'request-logger',
    name: 'Request Logger Middleware',
    category: 'Express Middleware',
    description: 'Logs incoming requests with method, path, status code, and response time',
    keywords: ['logger', 'logging', 'request', 'middleware', 'morgan'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';

export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const level = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
      console.log(
        \`[\${level}] \${method} \${originalUrl} \${statusCode} \${duration}ms\`
      );
    });

    next();
  };
}`,
    dependencies: [],
    useCases: ['Request auditing', 'Performance monitoring', 'Debugging API calls'],
  },
  {
    id: 'body-parser',
    name: 'Body Parser Configuration',
    category: 'Express Middleware',
    description: 'Configures JSON and URL-encoded body parsing with size limits',
    keywords: ['body', 'parser', 'json', 'urlencoded', 'middleware'],
    language: 'typescript',
    framework: 'express',
    code: `import express from 'express';

export function setupBodyParsers(app: express.Application, options?: { jsonLimit?: string; urlLimit?: string }) {
  const { jsonLimit = '10mb', urlLimit = '10mb' } = options || {};

  app.use(express.json({ limit: jsonLimit }));
  app.use(express.urlencoded({ extended: true, limit: urlLimit }));
  app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));
}`,
    dependencies: [],
    useCases: ['API payload parsing', 'Form data handling', 'File upload support'],
  },
  {
    id: 'file-upload-multer',
    name: 'File Upload with Multer',
    category: 'Express Middleware',
    description: 'Multer-based file upload middleware with type filtering and size limits',
    keywords: ['upload', 'file', 'multer', 'middleware', 'multipart'],
    language: 'typescript',
    framework: 'express',
    code: `import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(\`File type \${file.mimetype} not allowed\`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});`,
    dependencies: ['multer', '@types/multer'],
    useCases: ['Profile photo upload', 'Document attachment', 'Image gallery upload'],
  },
  {
    id: 'compression',
    name: 'Response Compression',
    category: 'Express Middleware',
    description: 'Gzip/Brotli compression middleware for response payloads',
    keywords: ['compression', 'gzip', 'brotli', 'performance', 'middleware'],
    language: 'typescript',
    framework: 'express',
    code: `import compression from 'compression';

export function setupCompression(app: any) {
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  }));
}`,
    dependencies: ['compression', '@types/compression'],
    useCases: ['Reducing response payload size', 'Improving page load times', 'Bandwidth optimization'],
  },
  {
    id: 'cache-control',
    name: 'Cache Control Headers',
    category: 'Express Middleware',
    description: 'Sets appropriate cache headers based on route patterns',
    keywords: ['cache', 'headers', 'etag', 'middleware', 'performance'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';

interface CacheRule { pattern: RegExp; maxAge: number; scope: 'public' | 'private'; }

export function cacheControl(rules: CacheRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();
    const matchedRule = rules.find(r => r.pattern.test(req.path));
    if (matchedRule) {
      res.setHeader('Cache-Control', \`\${matchedRule.scope}, max-age=\${matchedRule.maxAge}\`);
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  };
}`,
    dependencies: [],
    useCases: ['Static asset caching', 'API response caching', 'CDN cache management'],
  },
  {
    id: 'response-time',
    name: 'Response Time Header',
    category: 'Express Middleware',
    description: 'Adds X-Response-Time header to track server processing duration',
    keywords: ['response', 'time', 'performance', 'header', 'middleware'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';

export function responseTime() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6;
      res.setHeader('X-Response-Time', \`\${durationMs.toFixed(2)}ms\`);
    });
    next();
  };
}`,
    dependencies: [],
    useCases: ['API performance tracking', 'SLA monitoring', 'Performance dashboards'],
  },
  {
    id: 'request-id',
    name: 'Request ID Middleware',
    category: 'Express Middleware',
    description: 'Generates and attaches a unique request ID for tracing',
    keywords: ['request-id', 'tracing', 'correlation', 'middleware', 'uuid'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = (req.headers['x-request-id'] as string) || randomUUID();
    (req as any).requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
  };
}`,
    dependencies: [],
    useCases: ['Distributed tracing', 'Log correlation', 'Debugging production issues'],
  },
  {
    id: 'not-found-handler',
    name: '404 Not Found Handler',
    category: 'Express Middleware',
    description: 'Catches unmatched routes and returns a structured 404 response',
    keywords: ['404', 'not-found', 'middleware', 'handler', 'route'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: \`Route \${req.method} \${req.originalUrl} not found\`,
      code: 'NOT_FOUND',
      statusCode: 404,
    },
  });
}`,
    dependencies: [],
    useCases: ['API fallback handler', 'SPA fallback for unknown API routes', 'Error monitoring'],
  },
  {
    id: 'graceful-shutdown',
    name: 'Graceful Shutdown Handler',
    category: 'Express Middleware',
    description: 'Handles SIGTERM/SIGINT signals for clean server shutdown with connection draining',
    keywords: ['shutdown', 'graceful', 'signal', 'cleanup', 'drain'],
    language: 'typescript',
    framework: 'express',
    code: `import { Server } from 'http';

export function setupGracefulShutdown(server: Server, cleanup?: () => Promise<void>) {
  let isShuttingDown = false;

  async function shutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(\`\\nReceived \${signal}. Starting graceful shutdown...\`);

    server.close(async () => {
      console.log('HTTP server closed');
      if (cleanup) await cleanup();
      console.log('Cleanup complete. Exiting.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}`,
    dependencies: [],
    useCases: ['Production deployments', 'Database connection cleanup', 'Worker thread shutdown'],
  },
  {
    id: 'use-debounce',
    name: 'useDebounce Hook',
    category: 'React Hooks',
    description: 'Debounces a value update by a specified delay',
    keywords: ['debounce', 'hook', 'delay', 'search', 'input'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
    dependencies: [],
    useCases: ['Search input debouncing', 'API call throttling', 'Form auto-save'],
  },
  {
    id: 'use-throttle',
    name: 'useThrottle Hook',
    category: 'React Hooks',
    description: 'Throttles a value update to fire at most once per interval',
    keywords: ['throttle', 'hook', 'interval', 'scroll', 'resize'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useEffect, useRef } from 'react';

export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastExecuted.current;

    if (elapsed >= interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval - elapsed);
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}`,
    dependencies: [],
    useCases: ['Scroll event handling', 'Window resize tracking', 'Mouse movement tracking'],
  },
  {
    id: 'use-local-storage',
    name: 'useLocalStorage Hook',
    category: 'React Hooks',
    description: 'Persists state to localStorage with automatic serialization',
    keywords: ['localStorage', 'storage', 'persist', 'hook', 'state'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const nextValue = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(nextValue));
      return nextValue;
    });
  }, [key]);

  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}`,
    dependencies: [],
    useCases: ['User preferences', 'Theme persistence', 'Form draft saving'],
  },
  {
    id: 'use-media-query',
    name: 'useMediaQuery Hook',
    category: 'React Hooks',
    description: 'Tracks whether a CSS media query matches the current viewport',
    keywords: ['media-query', 'responsive', 'breakpoint', 'hook', 'viewport'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}`,
    dependencies: [],
    useCases: ['Responsive layout switching', 'Mobile detection', 'Dark mode preference detection'],
  },
  {
    id: 'use-click-outside',
    name: 'useClickOutside Hook',
    category: 'React Hooks',
    description: 'Detects clicks outside a referenced element and triggers a callback',
    keywords: ['click-outside', 'dropdown', 'modal', 'hook', 'close'],
    language: 'tsx',
    framework: 'react',
    code: `import { useEffect, useRef, RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(callback: () => void): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}`,
    dependencies: [],
    useCases: ['Dropdown close on outside click', 'Modal dismissal', 'Popover management'],
  },
  {
    id: 'use-intersection-observer',
    name: 'useIntersectionObserver Hook',
    category: 'React Hooks',
    description: 'Observes element visibility in the viewport using IntersectionObserver',
    keywords: ['intersection', 'observer', 'visibility', 'lazy', 'hook'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useEffect, useRef, RefObject } from 'react';

interface UseIntersectionOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement>(
  options: UseIntersectionOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false } = options;
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && triggerOnce) observer.unobserve(element);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isIntersecting];
}`,
    dependencies: [],
    useCases: ['Lazy loading images', 'Infinite scroll triggers', 'Analytics view tracking'],
  },
  {
    id: 'use-keyboard-shortcut',
    name: 'useKeyboardShortcut Hook',
    category: 'React Hooks',
    description: 'Registers global keyboard shortcuts with modifier key support',
    keywords: ['keyboard', 'shortcut', 'hotkey', 'keybinding', 'hook'],
    language: 'tsx',
    framework: 'react',
    code: `import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export function useKeyboardShortcut(config: ShortcutConfig, callback: () => void) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrl = false, shift = false, alt = false, meta = false } = config;
    if (
      event.key.toLowerCase() === key.toLowerCase() &&
      event.ctrlKey === ctrl &&
      event.shiftKey === shift &&
      event.altKey === alt &&
      event.metaKey === meta
    ) {
      event.preventDefault();
      callback();
    }
  }, [config, callback]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}`,
    dependencies: [],
    useCases: ['Save shortcut (Ctrl+S)', 'Search focus (Ctrl+K)', 'Navigation shortcuts'],
  },
  {
    id: 'use-fetch',
    name: 'useFetch Hook',
    category: 'React Hooks',
    description: 'Generic data fetching hook with loading, error, and refetch support',
    keywords: ['fetch', 'api', 'data', 'loading', 'hook'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(url: string, options?: RequestInit): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}`,
    dependencies: [],
    useCases: ['API data fetching', 'Dashboard data loading', 'Resource listing'],
  },
  {
    id: 'use-pagination',
    name: 'usePagination Hook',
    category: 'React Hooks',
    description: 'Manages pagination state with page navigation helpers',
    keywords: ['pagination', 'page', 'offset', 'limit', 'hook'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useMemo } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  offset: number;
  hasNext: boolean;
  hasPrev: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setTotalItems: (total: number) => void;
}

export function usePagination(initialPageSize: number = 20): PaginationState {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);
  const offset = (page - 1) * pageSize;

  return {
    page, pageSize, totalItems, totalPages, offset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    setPage: (p) => setPage(Math.max(1, Math.min(p, totalPages || 1))),
    nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setPage(p => Math.max(p - 1, 1)),
    setTotalItems,
  };
}`,
    dependencies: [],
    useCases: ['Data table pagination', 'Search results paging', 'Blog post listing'],
  },
  {
    id: 'use-infinite-scroll',
    name: 'useInfiniteScroll Hook',
    category: 'React Hooks',
    description: 'Triggers a callback when the user scrolls near the bottom of a container',
    keywords: ['infinite', 'scroll', 'load-more', 'hook', 'pagination'],
    language: 'tsx',
    framework: 'react',
    code: `import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(
  onLoadMore: () => void,
  options: { threshold?: number; enabled?: boolean } = {}
) {
  const { threshold = 200, enabled = true } = options;
  const observerRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && enabled) {
        onLoadMore();
      }
    },
    [onLoadMore, enabled]
  );

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: \`\${threshold}px\`,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection, threshold]);

  return observerRef;
}`,
    dependencies: [],
    useCases: ['Social media feeds', 'Product catalog browsing', 'Chat message history'],
  },
  {
    id: 'use-form-validation',
    name: 'useFormValidation Hook',
    category: 'React Hooks',
    description: 'Lightweight form validation hook with field-level error tracking',
    keywords: ['form', 'validation', 'errors', 'hook', 'input'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useCallback } from 'react';

type Validator<T> = (value: T) => string | null;
type FieldValidators<T> = { [K in keyof T]?: Validator<T[K]>[] };

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validators: FieldValidators<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    const fieldValidators = validators[field] || [];
    for (const validate of fieldValidators) {
      const error = validate(value);
      if (error) { setErrors(prev => ({ ...prev, [field]: error })); return; }
    }
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  }, [validators]);

  const touch = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    for (const field of Object.keys(validators) as (keyof T)[]) {
      for (const v of validators[field] || []) {
        const error = v(values[field]);
        if (error) { newErrors[field] = error; break; }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validators]);

  return { values, errors, touched, setValue, touch, validate, setValues };
}`,
    dependencies: [],
    useCases: ['Registration forms', 'Settings forms', 'Multi-step forms'],
  },
  {
    id: 'use-dark-mode',
    name: 'useDarkMode Hook',
    category: 'React Hooks',
    description: 'Manages dark mode state with system preference detection and localStorage persistence',
    keywords: ['dark-mode', 'theme', 'toggle', 'hook', 'preference'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useEffect } from 'react';

export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return [isDark, toggle];
}`,
    dependencies: [],
    useCases: ['Theme toggle button', 'System preference sync', 'Persistent theme selection'],
  },
  {
    id: 'protected-route',
    name: 'Protected Route Component',
    category: 'React Components',
    description: 'Route wrapper that redirects unauthenticated users to login',
    keywords: ['protected', 'route', 'auth', 'guard', 'redirect'],
    language: 'tsx',
    framework: 'react',
    code: `import { ReactNode } from 'react';
import { Redirect } from 'wouter';

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ children, isAuthenticated, redirectTo = '/login' }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }
  return <>{children}</>;
}`,
    dependencies: ['wouter'],
    useCases: ['Dashboard access control', 'Admin panel protection', 'Premium content gating'],
  },
  {
    id: 'error-boundary',
    name: 'Error Boundary Component',
    category: 'React Components',
    description: 'React error boundary with fallback UI and error reporting',
    keywords: ['error', 'boundary', 'fallback', 'crash', 'recovery'],
    language: 'tsx',
    framework: 'react',
    code: `import { Component, ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, info: ErrorInfo) => void; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div data-testid="error-boundary-fallback" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}`,
    dependencies: [],
    useCases: ['Wrapping page components', 'Widget isolation', 'Graceful error display'],
  },
  {
    id: 'suspense-wrapper',
    name: 'Suspense Wrapper Component',
    category: 'React Components',
    description: 'Suspense wrapper with a loading spinner fallback',
    keywords: ['suspense', 'lazy', 'loading', 'fallback', 'code-splitting'],
    language: 'tsx',
    framework: 'react',
    code: `import { Suspense, ReactNode } from 'react';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function DefaultSpinner() {
  return (
    <div data-testid="loading-spinner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
    </div>
  );
}

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback || <DefaultSpinner />}>
      {children}
    </Suspense>
  );
}`,
    dependencies: [],
    useCases: ['Lazy-loaded pages', 'Code-split routes', 'Heavy component loading'],
  },
  {
    id: 'virtualized-list',
    name: 'Virtualized List Component',
    category: 'React Components',
    description: 'Renders only visible items in a long list for performance',
    keywords: ['virtualized', 'list', 'windowing', 'performance', 'scroll'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useRef, useEffect, ReactNode } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
}

export function VirtualizedList<T>({ items, itemHeight, containerHeight, renderItem, overscan = 5 }: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
  const visibleItems = items.slice(startIndex, endIndex);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={containerRef} data-testid="virtualized-list" style={{ height: containerHeight, overflow: 'auto' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, i) => (
          <div key={startIndex + i} style={{ position: 'absolute', top: (startIndex + i) * itemHeight, height: itemHeight, width: '100%' }}>
            {renderItem(item, startIndex + i)}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    dependencies: [],
    useCases: ['Long data tables', 'Chat message lists', 'File explorers'],
  },
  {
    id: 'drag-and-drop',
    name: 'Drag and Drop List',
    category: 'React Components',
    description: 'Simple drag and drop reorderable list using HTML5 drag API',
    keywords: ['drag', 'drop', 'reorder', 'sortable', 'list'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, DragEvent } from 'react';

interface DragAndDropListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => JSX.Element;
  getKey: (item: T) => string;
}

export function DragAndDropList<T>({ items, onReorder, renderItem, getKey }: DragAndDropListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => (e: DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number) => (e: DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newItems = [...items];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, removed);
    setDragIndex(index);
    onReorder(newItems);
  };

  return (
    <div data-testid="drag-drop-list">
      {items.map((item, index) => (
        <div
          key={getKey(item)}
          draggable
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver(index)}
          onDragEnd={() => setDragIndex(null)}
          style={{ cursor: 'grab', opacity: dragIndex === index ? 0.5 : 1 }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}`,
    dependencies: [],
    useCases: ['Task reordering', 'Playlist management', 'Priority sorting'],
  },
  {
    id: 'copy-to-clipboard',
    name: 'Copy to Clipboard Button',
    category: 'React Components',
    description: 'Button that copies text to clipboard with visual feedback',
    keywords: ['copy', 'clipboard', 'button', 'text', 'feedback'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useCallback } from 'react';

interface CopyToClipboardProps {
  text: string;
  children?: (copied: boolean) => JSX.Element;
}

export function CopyToClipboard({ text, children }: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  if (children) return <div onClick={handleCopy}>{children(copied)}</div>;
  return (
    <button data-testid="button-copy" onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}`,
    dependencies: [],
    useCases: ['Code snippet sharing', 'Referral link copying', 'API key display'],
  },
  {
    id: 'countdown-timer',
    name: 'Countdown Timer Component',
    category: 'React Components',
    description: 'Displays a countdown to a target date with days, hours, minutes, seconds',
    keywords: ['countdown', 'timer', 'clock', 'deadline', 'event'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

function calcTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calcTimeLeft(targetDate);
      setTimeLeft(tl);
      if (tl.expired) { clearInterval(timer); onComplete?.(); }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  return (
    <div data-testid="countdown-timer" style={{ display: 'flex', gap: '1rem' }}>
      {(['days', 'hours', 'minutes', 'seconds'] as const).map(unit => (
        <div key={unit} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{timeLeft[unit]}</div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{unit}</div>
        </div>
      ))}
    </div>
  );
}`,
    dependencies: [],
    useCases: ['Product launch countdown', 'Sale timer', 'Event countdown'],
  },
  {
    id: 'infinite-scroll-container',
    name: 'Infinite Scroll Container',
    category: 'React Components',
    description: 'Container that loads more content when scrolled to the bottom',
    keywords: ['infinite', 'scroll', 'container', 'load-more', 'feed'],
    language: 'tsx',
    framework: 'react',
    code: `import { ReactNode, useEffect, useRef, useCallback } from 'react';

interface InfiniteScrollContainerProps {
  children: ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  loader?: ReactNode;
  threshold?: number;
}

export function InfiniteScrollContainer({
  children, onLoadMore, hasMore, loading, loader, threshold = 200
}: InfiniteScrollContainerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasMore && !loading) onLoadMore();
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: \`\${threshold}px\` });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect, threshold]);

  return (
    <div data-testid="infinite-scroll-container">
      {children}
      {loading && (loader || <div style={{ textAlign: 'center', padding: '1rem' }}>Loading...</div>)}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
}`,
    dependencies: [],
    useCases: ['Social media feeds', 'Image galleries', 'Search results'],
  },
  {
    id: 'skeleton-loader',
    name: 'Skeleton Loader Component',
    category: 'React Components',
    description: 'Animated placeholder skeleton for loading states',
    keywords: ['skeleton', 'loader', 'placeholder', 'loading', 'shimmer'],
    language: 'tsx',
    framework: 'react',
    code: `interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  count?: number;
  gap?: string;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = '4px', count = 1, gap = '8px' }: SkeletonProps) {
  return (
    <div data-testid="skeleton-loader" style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width, height, borderRadius,
            background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      ))}
    </div>
  );
}`,
    dependencies: [],
    useCases: ['Card loading states', 'Profile page loading', 'Data table loading'],
  },
  {
    id: 'responsive-image',
    name: 'Responsive Image Component',
    category: 'React Components',
    description: 'Image component with lazy loading, fallback, and aspect ratio control',
    keywords: ['image', 'responsive', 'lazy', 'fallback', 'aspect-ratio'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  className?: string;
}

export function ResponsiveImage({
  src, alt, fallbackSrc = '', aspectRatio = '16/9', objectFit = 'cover', className
}: ResponsiveImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);

  return (
    <div data-testid="responsive-image" style={{ aspectRatio, overflow: 'hidden', position: 'relative' }} className={className}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, background: '#e5e7eb' }} />
      )}
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => { if (fallbackSrc && imgSrc !== fallbackSrc) setImgSrc(fallbackSrc); }}
        style={{ width: '100%', height: '100%', objectFit, display: loaded ? 'block' : 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
      />
    </div>
  );
}`,
    dependencies: [],
    useCases: ['Image galleries', 'Product images', 'Blog featured images'],
  },
  {
    id: 'pagination-query',
    name: 'Pagination Query Helper',
    category: 'Database Operations',
    description: 'Drizzle ORM pagination helper with total count and metadata',
    keywords: ['pagination', 'query', 'database', 'offset', 'limit'],
    language: 'typescript',
    framework: 'drizzle',
    code: `import { sql, SQL } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

interface PaginationParams { page: number; pageSize: number; }
interface PaginatedResult<T> { data: T[]; total: number; page: number; pageSize: number; totalPages: number; }

export async function paginatedQuery<T>(
  db: any,
  table: PgTable,
  params: PaginationParams,
  where?: SQL,
  orderBy?: SQL
): Promise<PaginatedResult<T>> {
  const { page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const countQuery = db.select({ count: sql<number>\`count(*)\` }).from(table);
  if (where) countQuery.where(where);
  const [{ count: total }] = await countQuery;

  let dataQuery = db.select().from(table);
  if (where) dataQuery = dataQuery.where(where);
  if (orderBy) dataQuery = dataQuery.orderBy(orderBy);
  const data = await dataQuery.limit(pageSize).offset(offset);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}`,
    dependencies: ['drizzle-orm'],
    useCases: ['API list endpoints', 'Admin data tables', 'Search results pagination'],
  },
  {
    id: 'full-text-search',
    name: 'Full-Text Search Query',
    category: 'Database Operations',
    description: 'PostgreSQL full-text search with ranking using tsvector',
    keywords: ['search', 'fulltext', 'tsvector', 'postgres', 'ranking'],
    language: 'typescript',
    framework: 'drizzle',
    code: `import { sql } from 'drizzle-orm';

export async function fullTextSearch(
  db: any,
  tableName: string,
  columns: string[],
  searchTerm: string,
  limit: number = 20
) {
  const tsQuery = searchTerm.trim().split(/\\s+/).join(' & ');
  const tsvectorExpr = columns.map(c => \`coalesce(\${c}, '')\`).join(" || ' ' || ");

  const results = await db.execute(sql.raw(\`
    SELECT *, ts_rank(
      to_tsvector('english', \${tsvectorExpr}),
      to_tsquery('english', '\${tsQuery}')
    ) AS rank
    FROM \${tableName}
    WHERE to_tsvector('english', \${tsvectorExpr}) @@ to_tsquery('english', '\${tsQuery}')
    ORDER BY rank DESC
    LIMIT \${limit}
  \`));

  return results.rows;
}`,
    dependencies: ['drizzle-orm'],
    useCases: ['Product search', 'Article search', 'User search'],
  },
  {
    id: 'transaction-wrapper',
    name: 'Database Transaction Wrapper',
    category: 'Database Operations',
    description: 'Type-safe transaction wrapper with automatic rollback on error',
    keywords: ['transaction', 'database', 'rollback', 'atomic', 'commit'],
    language: 'typescript',
    framework: 'drizzle',
    code: `import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function withTransaction<T>(
  db: PostgresJsDatabase,
  callback: (tx: PostgresJsDatabase) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    return callback(tx as unknown as PostgresJsDatabase);
  });
}

export async function withRetryTransaction<T>(
  db: PostgresJsDatabase,
  callback: (tx: PostgresJsDatabase) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await withTransaction(db, callback);
    } catch (err) {
      lastError = err as Error;
      if (!(err as any)?.message?.includes('serialization')) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
    }
  }
  throw lastError;
}`,
    dependencies: ['drizzle-orm'],
    useCases: ['Order processing', 'Fund transfers', 'Multi-table updates'],
  },
  {
    id: 'soft-delete-query',
    name: 'Soft Delete Pattern',
    category: 'Database Operations',
    description: 'Implements soft delete with deletedAt timestamp and filtered queries',
    keywords: ['soft-delete', 'archive', 'delete', 'restore', 'database'],
    language: 'typescript',
    framework: 'drizzle',
    code: `import { eq, isNull, sql } from 'drizzle-orm';
import { timestamp, PgTable } from 'drizzle-orm/pg-core';

export function addSoftDelete(table: any) {
  return { deletedAt: timestamp('deleted_at') };
}

export async function softDelete(db: any, table: PgTable, idColumn: any, id: number) {
  return db.update(table).set({ deletedAt: new Date() }).where(eq(idColumn, id));
}

export async function restore(db: any, table: PgTable, idColumn: any, id: number) {
  return db.update(table).set({ deletedAt: null }).where(eq(idColumn, id));
}

export function withoutDeleted(deletedAtColumn: any) {
  return isNull(deletedAtColumn);
}

export async function hardDelete(db: any, table: PgTable, idColumn: any, id: number) {
  return db.delete(table).where(eq(idColumn, id));
}`,
    dependencies: ['drizzle-orm'],
    useCases: ['User account deactivation', 'Content archival', 'Recoverable deletions'],
  },
  {
    id: 'bulk-insert',
    name: 'Bulk Insert Helper',
    category: 'Database Operations',
    description: 'Batch insert records in configurable chunk sizes for performance',
    keywords: ['bulk', 'insert', 'batch', 'database', 'performance'],
    language: 'typescript',
    framework: 'drizzle',
    code: `import { PgTable } from 'drizzle-orm/pg-core';

export async function bulkInsert<T extends Record<string, any>>(
  db: any,
  table: PgTable,
  records: T[],
  chunkSize: number = 500
): Promise<{ inserted: number; chunks: number }> {
  let inserted = 0;
  let chunks = 0;

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    await db.insert(table).values(chunk);
    inserted += chunk.length;
    chunks++;
  }

  return { inserted, chunks };
}

export async function upsertBulk<T extends Record<string, any>>(
  db: any,
  table: PgTable,
  records: T[],
  conflictTarget: any,
  chunkSize: number = 500
): Promise<number> {
  let upserted = 0;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    await db.insert(table).values(chunk).onConflictDoUpdate({ target: conflictTarget, set: chunk[0] });
    upserted += chunk.length;
  }
  return upserted;
}`,
    dependencies: ['drizzle-orm'],
    useCases: ['CSV data import', 'Data migration', 'Seed scripts'],
  },
  {
    id: 'optimistic-locking',
    name: 'Optimistic Locking Pattern',
    category: 'Database Operations',
    description: 'Version-based optimistic locking to prevent concurrent update conflicts',
    keywords: ['optimistic', 'locking', 'version', 'concurrency', 'conflict'],
    language: 'typescript',
    framework: 'drizzle',
    code: `import { eq, and, sql } from 'drizzle-orm';

export class OptimisticLockError extends Error {
  constructor(message: string = 'Record was modified by another process') {
    super(message);
    this.name = 'OptimisticLockError';
  }
}

export async function updateWithLock(
  db: any,
  table: any,
  idColumn: any,
  versionColumn: any,
  id: number,
  currentVersion: number,
  updates: Record<string, any>
) {
  const result = await db
    .update(table)
    .set({ ...updates, version: currentVersion + 1 })
    .where(and(eq(idColumn, id), eq(versionColumn, currentVersion)))
    .returning();

  if (result.length === 0) {
    throw new OptimisticLockError();
  }

  return result[0];
}`,
    dependencies: ['drizzle-orm'],
    useCases: ['Collaborative editing', 'Inventory updates', 'Document versioning'],
  },
  {
    id: 'connection-pool',
    name: 'Database Connection Pool',
    category: 'Database Operations',
    description: 'PostgreSQL connection pool configuration with health checks',
    keywords: ['connection', 'pool', 'database', 'postgres', 'health'],
    language: 'typescript',
    framework: 'node',
    code: `import { Pool, PoolConfig } from 'pg';

export function createPool(config?: Partial<PoolConfig>): Pool {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ...config,
  });

  pool.on('error', (err) => {
    console.error('Unexpected pool error:', err);
  });

  return pool;
}

export async function healthCheck(pool: Pool): Promise<{ healthy: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    return { healthy: true, latencyMs: Date.now() - start };
  } catch {
    return { healthy: false, latencyMs: Date.now() - start };
  }
}`,
    dependencies: ['pg', '@types/pg'],
    useCases: ['Application startup', 'Connection management', 'Health monitoring'],
  },
  {
    id: 'migration-runner',
    name: 'Migration Runner',
    category: 'Database Operations',
    description: 'Simple SQL migration runner with up/down support and tracking',
    keywords: ['migration', 'database', 'schema', 'version', 'runner'],
    language: 'typescript',
    framework: 'node',
    code: `import { Pool } from 'pg';

interface Migration {
  id: string;
  up: string;
  down: string;
}

export async function runMigrations(pool: Pool, migrations: Migration[]) {
  await pool.query(\`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  \`);

  const applied = await pool.query('SELECT id FROM _migrations ORDER BY applied_at');
  const appliedIds = new Set(applied.rows.map(r => r.id));

  for (const migration of migrations) {
    if (appliedIds.has(migration.id)) continue;
    console.log(\`Applying migration: \${migration.id}\`);
    await pool.query('BEGIN');
    try {
      await pool.query(migration.up);
      await pool.query('INSERT INTO _migrations (id) VALUES ($1)', [migration.id]);
      await pool.query('COMMIT');
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  }
}`,
    dependencies: ['pg'],
    useCases: ['Schema evolution', 'Deployment automation', 'Database versioning'],
  },
  {
    id: 'seed-data',
    name: 'Database Seeder',
    category: 'Database Operations',
    description: 'Database seeding utility with idempotent insert support',
    keywords: ['seed', 'data', 'database', 'test', 'development'],
    language: 'typescript',
    framework: 'drizzle',
    code: `import { sql } from 'drizzle-orm';

interface SeedConfig<T> {
  table: any;
  data: T[];
  conflictColumn?: any;
}

export async function seedDatabase(db: any, configs: SeedConfig<any>[]) {
  for (const config of configs) {
    const { table, data, conflictColumn } = config;
    if (data.length === 0) continue;
    console.log(\`Seeding \${data.length} records...\`);
    for (const record of data) {
      try {
        if (conflictColumn) {
          await db.insert(table).values(record).onConflictDoNothing({ target: conflictColumn });
        } else {
          await db.insert(table).values(record);
        }
      } catch (err) {
        console.warn(\`Seed record skipped: \${(err as Error).message}\`);
      }
    }
  }
  console.log('Seeding complete');
}`,
    dependencies: ['drizzle-orm'],
    useCases: ['Development data setup', 'Demo environment preparation', 'Test data generation'],
  },
  {
    id: 'query-builder',
    name: 'Dynamic Query Builder',
    category: 'Database Operations',
    description: 'Builds dynamic WHERE clauses from filter objects for Drizzle ORM',
    keywords: ['query', 'builder', 'dynamic', 'filter', 'where'],
    language: 'typescript',
    framework: 'drizzle',
    code: `import { eq, like, gte, lte, and, or, SQL, ilike } from 'drizzle-orm';

interface Filter {
  field: string;
  operator: 'eq' | 'like' | 'gte' | 'lte' | 'ilike';
  value: any;
}

export function buildWhereClause(columns: Record<string, any>, filters: Filter[]): SQL | undefined {
  const conditions: SQL[] = [];

  for (const filter of filters) {
    const column = columns[filter.field];
    if (!column) continue;

    switch (filter.operator) {
      case 'eq': conditions.push(eq(column, filter.value)); break;
      case 'like': conditions.push(like(column, \`%\${filter.value}%\`)); break;
      case 'ilike': conditions.push(ilike(column, \`%\${filter.value}%\`)); break;
      case 'gte': conditions.push(gte(column, filter.value)); break;
      case 'lte': conditions.push(lte(column, filter.value)); break;
    }
  }

  if (conditions.length === 0) return undefined;
  return and(...conditions);
}`,
    dependencies: ['drizzle-orm'],
    useCases: ['API filter endpoints', 'Advanced search', 'Report filtering'],
  },
  {
    id: 'api-client',
    name: 'Typed API Client',
    category: 'API Utilities',
    description: 'Type-safe fetch wrapper with interceptors, error handling, and base URL config',
    keywords: ['api', 'client', 'fetch', 'http', 'typed'],
    language: 'typescript',
    framework: 'node',
    code: `type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  onError?: (error: ApiError) => void;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private async request<T>(method: HttpMethod, path: string, body?: any): Promise<T> {
    const url = \`\${this.config.baseUrl}\${path}\`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...this.config.headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const error = new ApiError(res.status, res.statusText, await res.json().catch(() => null));
      this.config.onError?.(error);
      throw error;
    }
    return res.json();
  }

  get<T>(path: string) { return this.request<T>('GET', path); }
  post<T>(path: string, body: any) { return this.request<T>('POST', path, body); }
  put<T>(path: string, body: any) { return this.request<T>('PUT', path, body); }
  patch<T>(path: string, body: any) { return this.request<T>('PATCH', path, body); }
  delete<T>(path: string) { return this.request<T>('DELETE', path); }
}`,
    dependencies: [],
    useCases: ['Frontend API calls', 'Service-to-service communication', 'Third-party API integration'],
  },
  {
    id: 'retry-with-backoff',
    name: 'Retry with Exponential Backoff',
    category: 'API Utilities',
    description: 'Retries failed async operations with exponential backoff and jitter',
    keywords: ['retry', 'backoff', 'exponential', 'resilience', 'fault-tolerance'],
    language: 'typescript',
    framework: 'node',
    code: `interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, shouldRetry } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      if (shouldRetry && !shouldRetry(error as Error, attempt)) throw error;
      const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry failed');
}`,
    dependencies: [],
    useCases: ['External API calls', 'Database reconnection', 'File upload retry'],
  },
  {
    id: 'request-cache',
    name: 'Request Cache with TTL',
    category: 'API Utilities',
    description: 'In-memory request cache with time-to-live expiration',
    keywords: ['cache', 'ttl', 'memory', 'request', 'performance'],
    language: 'typescript',
    framework: 'node',
    code: `interface CacheEntry<T> { data: T; expiresAt: number; }

export class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtl: number;

  constructor(defaultTtlMs: number = 60000) {
    this.defaultTtl = defaultTtlMs;
    setInterval(() => this.cleanup(), defaultTtlMs);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.cache.delete(key); return null; }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.cache.set(key, { data, expiresAt: Date.now() + (ttlMs || this.defaultTtl) });
  }

  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }

  invalidate(key: string): void { this.cache.delete(key); }
  clear(): void { this.cache.clear(); }
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) { if (now > entry.expiresAt) this.cache.delete(key); }
  }
}`,
    dependencies: [],
    useCases: ['API response caching', 'Reducing database queries', 'Rate limit avoidance'],
  },
  {
    id: 'response-formatter',
    name: 'API Response Formatter',
    category: 'API Utilities',
    description: 'Standardizes API response format with success/error envelopes',
    keywords: ['response', 'format', 'envelope', 'api', 'standard'],
    language: 'typescript',
    framework: 'express',
    code: `import { Response } from 'express';

interface SuccessResponse<T> { success: true; data: T; meta?: Record<string, any>; }
interface ErrorResponse { success: false; error: { message: string; code: string; details?: any }; }

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200, meta?: Record<string, any>) {
  const response: SuccessResponse<T> = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, statusCode: number, message: string, code: string = 'ERROR', details?: any) {
  const response: ErrorResponse = { success: false, error: { message, code, details } };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(res: Response, data: T[], total: number, page: number, pageSize: number) {
  return sendSuccess(res, data, 200, { total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}`,
    dependencies: [],
    useCases: ['Consistent API responses', 'Frontend data parsing', 'API documentation'],
  },
  {
    id: 'error-serializer',
    name: 'Error Serializer',
    category: 'API Utilities',
    description: 'Serializes various error types into a consistent JSON format',
    keywords: ['error', 'serialize', 'format', 'json', 'api'],
    language: 'typescript',
    framework: 'node',
    code: `interface SerializedError {
  name: string;
  message: string;
  code?: string;
  statusCode: number;
  stack?: string;
  details?: any;
}

export function serializeError(error: unknown, includeStack: boolean = false): SerializedError {
  if (error instanceof Error) {
    const serialized: SerializedError = {
      name: error.name,
      message: error.message,
      statusCode: (error as any).statusCode || (error as any).status || 500,
      code: (error as any).code,
    };
    if (includeStack && error.stack) serialized.stack = error.stack;
    if ((error as any).details) serialized.details = (error as any).details;
    return serialized;
  }
  return { name: 'UnknownError', message: String(error), statusCode: 500 };
}

export function isOperationalError(error: unknown): boolean {
  if (error instanceof Error && 'statusCode' in error) {
    return (error as any).statusCode < 500;
  }
  return false;
}`,
    dependencies: [],
    useCases: ['Error logging', 'Error tracking services', 'API error responses'],
  },
  {
    id: 'query-string-parser',
    name: 'Query String Parser',
    category: 'API Utilities',
    description: 'Parses and validates query parameters with type coercion',
    keywords: ['query', 'string', 'parser', 'params', 'url'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request } from 'express';

interface ParsedQuery {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  filters: Record<string, string>;
}

export function parseQueryParams(req: Request, defaults?: Partial<ParsedQuery>): ParsedQuery {
  const query = req.query;
  const page = Math.max(1, parseInt(query.page as string) || defaults?.page || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || defaults?.pageSize || 20));
  const sortBy = (query.sortBy as string) || defaults?.sortBy || 'id';
  const sortOrder = (query.sortOrder as string) === 'asc' ? 'asc' : 'desc';
  const search = (query.search as string) || '';

  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('filter.') && typeof value === 'string') {
      filters[key.replace('filter.', '')] = value;
    }
  }

  return { page, pageSize, sortBy, sortOrder, search, filters };
}`,
    dependencies: [],
    useCases: ['List API endpoints', 'Data table backends', 'Search endpoints'],
  },
  {
    id: 'file-stream-response',
    name: 'File Stream Response',
    category: 'API Utilities',
    description: 'Streams file content as a response with proper headers for download',
    keywords: ['file', 'stream', 'download', 'response', 'binary'],
    language: 'typescript',
    framework: 'express',
    code: `import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.zip': 'application/zip',
  '.txt': 'text/plain',
};

export function streamFile(res: Response, filePath: string, filename?: string) {
  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
  const downloadName = filename || path.basename(filePath);

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', \`attachment; filename="\${downloadName}"\`);

  const stat = fs.statSync(filePath);
  res.setHeader('Content-Length', stat.size);

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('error', () => {
    res.status(500).json({ error: 'File streaming failed' });
  });
}`,
    dependencies: [],
    useCases: ['File downloads', 'Report exports', 'Document serving'],
  },
  {
    id: 'batch-processor',
    name: 'Batch Processor',
    category: 'API Utilities',
    description: 'Processes arrays in configurable batches with concurrency control',
    keywords: ['batch', 'processor', 'concurrent', 'parallel', 'queue'],
    language: 'typescript',
    framework: 'node',
    code: `interface BatchOptions {
  batchSize?: number;
  concurrency?: number;
  onProgress?: (processed: number, total: number) => void;
}

export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: BatchOptions = {}
): Promise<R[]> {
  const { batchSize = 10, concurrency = 5, onProgress } = options;
  const results: R[] = [];
  let processed = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const chunks: T[][] = [];
    for (let j = 0; j < batch.length; j += concurrency) {
      chunks.push(batch.slice(j, j + concurrency));
    }
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(processor));
      results.push(...chunkResults);
      processed += chunk.length;
      onProgress?.(processed, items.length);
    }
  }

  return results;
}`,
    dependencies: [],
    useCases: ['Email sending', 'Image processing', 'Data import/export'],
  },
  {
    id: 'webhook-sender',
    name: 'Webhook Sender',
    category: 'API Utilities',
    description: 'Sends webhook payloads with signature verification and retry logic',
    keywords: ['webhook', 'sender', 'event', 'notification', 'signature'],
    language: 'typescript',
    framework: 'node',
    code: `import crypto from 'crypto';

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: number;
}

export async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string,
  retries: number = 3
): Promise<boolean> {
  const body = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': String(payload.timestamp),
        },
        body,
      });
      if (res.ok) return true;
      if (res.status >= 400 && res.status < 500) return false;
    } catch {}
    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
  }
  return false;
}

export function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}`,
    dependencies: [],
    useCases: ['Event notifications', 'Third-party integrations', 'Payment callbacks'],
  },
  {
    id: 'api-versioning',
    name: 'API Versioning Middleware',
    category: 'API Utilities',
    description: 'Routes requests to versioned handlers based on URL prefix or header',
    keywords: ['versioning', 'api', 'version', 'middleware', 'routing'],
    language: 'typescript',
    framework: 'express',
    code: `import { Router, Request, Response, NextFunction } from 'express';

export function createVersionedRouter(versions: Record<string, Router>): Router {
  const router = Router();

  for (const [version, versionRouter] of Object.entries(versions)) {
    router.use(\`/\${version}\`, versionRouter);
  }

  router.use((req: Request, res: Response) => {
    const availableVersions = Object.keys(versions);
    res.status(400).json({
      error: 'API version not specified or invalid',
      availableVersions,
      example: \`/api/\${availableVersions[availableVersions.length - 1]}/resource\`,
    });
  });

  return router;
}

export function headerVersioning(versions: Record<string, Router>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const version = req.headers['api-version'] as string || 'v1';
    const versionRouter = versions[version];
    if (!versionRouter) {
      return res.status(400).json({ error: \`Unsupported API version: \${version}\` });
    }
    versionRouter(req, res, next);
  };
}`,
    dependencies: [],
    useCases: ['API evolution', 'Backward compatibility', 'Gradual migration'],
  },
  {
    id: 'zustand-store',
    name: 'Zustand Store Pattern',
    category: 'State Management',
    description: 'Type-safe Zustand store with actions, selectors, and middleware',
    keywords: ['zustand', 'store', 'state', 'global', 'management'],
    language: 'typescript',
    framework: 'react',
    code: `import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  items: any[];
  selectedId: string | null;
  loading: boolean;
  addItem: (item: any) => void;
  removeItem: (id: string) => void;
  setSelected: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = { items: [], selectedId: null, loading: false };

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        addItem: (item) => set((s) => ({ items: [...s.items, item] })),
        removeItem: (id) => set((s) => ({ items: s.items.filter((i: any) => i.id !== id) })),
        setSelected: (id) => set({ selectedId: id }),
        setLoading: (loading) => set({ loading }),
        reset: () => set(initialState),
      }),
      { name: 'app-store' }
    )
  )
);`,
    dependencies: ['zustand'],
    useCases: ['Global UI state', 'Shopping cart', 'User preferences'],
  },
  {
    id: 'context-provider',
    name: 'React Context Provider Pattern',
    category: 'State Management',
    description: 'Type-safe React context with provider and custom hook',
    keywords: ['context', 'provider', 'react', 'state', 'hook'],
    language: 'tsx',
    framework: 'react',
    code: `import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface AppContextValue {
  user: { id: string; name: string } | null;
  theme: 'light' | 'dark';
  setUser: (user: AppContextValue['user']) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppContextValue['user']>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), []);

  return (
    <AppContext.Provider value={{ user, theme, setUser, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}`,
    dependencies: [],
    useCases: ['Theme management', 'Auth state sharing', 'App-wide configuration'],
  },
  {
    id: 'reducer-pattern',
    name: 'useReducer Pattern',
    category: 'State Management',
    description: 'Complex state management using useReducer with typed actions',
    keywords: ['reducer', 'useReducer', 'dispatch', 'action', 'state'],
    language: 'tsx',
    framework: 'react',
    code: `import { useReducer } from 'react';

interface State { items: any[]; filter: string; sortBy: string; loading: boolean; error: string | null; }

type Action =
  | { type: 'SET_ITEMS'; payload: any[] }
  | { type: 'ADD_ITEM'; payload: any }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_SORT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: State = { items: [], filter: '', sortBy: 'name', loading: false, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ITEMS': return { ...state, items: action.payload, loading: false };
    case 'ADD_ITEM': return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM': return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'SET_FILTER': return { ...state, filter: action.payload };
    case 'SET_SORT': return { ...state, sortBy: action.payload };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    case 'RESET': return initialState;
    default: return state;
  }
}

export function useItemManager() {
  return useReducer(reducer, initialState);
}`,
    dependencies: [],
    useCases: ['Complex form state', 'List management', 'Multi-step workflows'],
  },
  {
    id: 'optimistic-update',
    name: 'Optimistic Update Pattern',
    category: 'State Management',
    description: 'Optimistic UI update with rollback on failure using React Query',
    keywords: ['optimistic', 'update', 'rollback', 'react-query', 'mutation'],
    language: 'tsx',
    framework: 'react',
    code: `import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Item { id: string; title: string; completed: boolean; }

export function useOptimisticToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Item) => {
      const res = await fetch(\`/api/items/\${item.id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !item.completed }),
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: ['/api/items'] });
      const previous = queryClient.getQueryData<Item[]>(['/api/items']);
      queryClient.setQueryData<Item[]>(['/api/items'], (old) =>
        old?.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i)
      );
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous) queryClient.setQueryData(['/api/items'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
    },
  });
}`,
    dependencies: ['@tanstack/react-query'],
    useCases: ['Todo toggle', 'Like/unlike actions', 'Status updates'],
  },
  {
    id: 'cache-invalidation',
    name: 'Cache Invalidation Helpers',
    category: 'State Management',
    description: 'React Query cache invalidation utilities for related queries',
    keywords: ['cache', 'invalidation', 'react-query', 'refresh', 'stale'],
    language: 'typescript',
    framework: 'react',
    code: `import { QueryClient } from '@tanstack/react-query';

export function createCacheInvalidator(queryClient: QueryClient) {
  return {
    invalidateAll: () => queryClient.invalidateQueries(),

    invalidateByPrefix: (prefix: string) =>
      queryClient.invalidateQueries({ queryKey: [prefix] }),

    invalidateRelated: (keys: string[][]) =>
      Promise.all(keys.map(key => queryClient.invalidateQueries({ queryKey: key }))),

    resetQuery: (key: string[]) => queryClient.resetQueries({ queryKey: key }),

    prefetch: <T>(key: string[], fetcher: () => Promise<T>, staleTime?: number) =>
      queryClient.prefetchQuery({ queryKey: key, queryFn: fetcher, staleTime }),

    setData: <T>(key: string[], updater: (old: T | undefined) => T) =>
      queryClient.setQueryData<T>(key, updater),
  };
}`,
    dependencies: ['@tanstack/react-query'],
    useCases: ['Post-mutation cache refresh', 'Related data invalidation', 'Prefetching'],
  },
  {
    id: 'real-time-sync',
    name: 'Real-Time Sync with WebSocket',
    category: 'State Management',
    description: 'WebSocket-based real-time state synchronization hook',
    keywords: ['websocket', 'real-time', 'sync', 'live', 'push'],
    language: 'tsx',
    framework: 'react',
    code: `import { useEffect, useRef, useState, useCallback } from 'react';

interface UseRealtimeOptions {
  url: string;
  onMessage?: (data: any) => void;
  reconnectInterval?: number;
}

export function useRealTimeSync({ url, onMessage, reconnectInterval = 3000 }: UseRealtimeOptions) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(connect, reconnectInterval);
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage?.(data);
      } catch {}
    };
  }, [url, onMessage, reconnectInterval]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { connected, send };
}`,
    dependencies: [],
    useCases: ['Chat applications', 'Live dashboards', 'Collaborative editing'],
  },
  {
    id: 'undo-redo',
    name: 'Undo/Redo State Manager',
    category: 'State Management',
    description: 'Undo/redo functionality with state history stack',
    keywords: ['undo', 'redo', 'history', 'state', 'stack'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useCallback } from 'react';

interface UndoRedoState<T> {
  current: T;
  canUndo: boolean;
  canRedo: boolean;
  set: (value: T) => void;
  undo: () => void;
  redo: () => void;
  reset: (value: T) => void;
}

export function useUndoRedo<T>(initialValue: T, maxHistory: number = 50): UndoRedoState<T> {
  const [past, setPast] = useState<T[]>([]);
  const [current, setCurrent] = useState<T>(initialValue);
  const [future, setFuture] = useState<T[]>([]);

  const set = useCallback((value: T) => {
    setPast(p => [...p.slice(-maxHistory), current]);
    setCurrent(value);
    setFuture([]);
  }, [current, maxHistory]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast(p => p.slice(0, -1));
    setFuture(f => [current, ...f]);
    setCurrent(previous);
  }, [past, current]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(f => f.slice(1));
    setPast(p => [...p, current]);
    setCurrent(next);
  }, [future, current]);

  const reset = useCallback((value: T) => {
    setPast([]);
    setFuture([]);
    setCurrent(value);
  }, []);

  return { current, canUndo: past.length > 0, canRedo: future.length > 0, set, undo, redo, reset };
}`,
    dependencies: [],
    useCases: ['Text editors', 'Drawing applications', 'Form step navigation'],
  },
  {
    id: 'persisted-state',
    name: 'Persisted State Hook',
    category: 'State Management',
    description: 'State hook that persists to sessionStorage with expiration',
    keywords: ['persist', 'session', 'storage', 'state', 'expiration'],
    language: 'tsx',
    framework: 'react',
    code: `import { useState, useEffect } from 'react';

interface PersistedEntry<T> { value: T; expiresAt: number | null; }

export function usePersistedState<T>(key: string, initialValue: T, ttlMs?: number): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return initialValue;
      const entry: PersistedEntry<T> = JSON.parse(stored);
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        sessionStorage.removeItem(key);
        return initialValue;
      }
      return entry.value;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    const entry: PersistedEntry<T> = {
      value: state,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    };
    sessionStorage.setItem(key, JSON.stringify(entry));
  }, [key, state, ttlMs]);

  return [state, setState];
}`,
    dependencies: [],
    useCases: ['Form draft saving', 'Wizard step state', 'Tab session data'],
  },
  {
    id: 'zod-schema-factory',
    name: 'Zod Schema Factory',
    category: 'Validation',
    description: 'Factory functions for creating common Zod validation schemas',
    keywords: ['zod', 'schema', 'validation', 'factory', 'type-safe'],
    language: 'typescript',
    framework: 'zod',
    code: `import { z } from 'zod';

export const schemas = {
  id: () => z.number().int().positive(),
  uuid: () => z.string().uuid(),
  email: () => z.string().email().max(255).toLowerCase().trim(),
  password: () => z.string().min(8).max(128),
  name: () => z.string().min(1).max(100).trim(),
  url: () => z.string().url().max(2048),
  phone: () => z.string().regex(/^\\+?[1-9]\\d{1,14}$/, 'Invalid phone number'),
  slug: () => z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug'),
  date: () => z.string().datetime(),
  money: () => z.number().nonnegative().multipleOf(0.01),
  percentage: () => z.number().min(0).max(100),
  pagination: () => z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
  }),
  sortOrder: () => z.enum(['asc', 'desc']).default('desc'),
};

export function createInsertSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).strict();
}`,
    dependencies: ['zod'],
    useCases: ['API validation', 'Form validation', 'Data sanitization'],
  },
  {
    id: 'email-validator',
    name: 'Email Validator',
    category: 'Validation',
    description: 'Comprehensive email validation with domain and format checks',
    keywords: ['email', 'validator', 'validation', 'format', 'domain'],
    language: 'typescript',
    framework: 'node',
    code: `const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'trashmail.com', 'fakeinbox.com',
]);

interface EmailValidation {
  valid: boolean;
  normalized: string;
  errors: string[];
}

export function validateEmail(email: string): EmailValidation {
  const errors: string[] = [];
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) { errors.push('Email is required'); return { valid: false, normalized: '', errors }; }
  if (trimmed.length > 254) errors.push('Email too long');

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(trimmed)) errors.push('Invalid email format');

  const domain = trimmed.split('@')[1];
  if (domain && DISPOSABLE_DOMAINS.has(domain)) errors.push('Disposable email not allowed');

  return { valid: errors.length === 0, normalized: trimmed, errors };
}`,
    dependencies: [],
    useCases: ['Registration validation', 'Newsletter signup', 'Contact forms'],
  },
  {
    id: 'phone-formatter',
    name: 'Phone Number Formatter',
    category: 'Validation',
    description: 'Formats and validates phone numbers with country code support',
    keywords: ['phone', 'format', 'validate', 'number', 'international'],
    language: 'typescript',
    framework: 'node',
    code: `interface PhoneResult {
  valid: boolean;
  formatted: string;
  digits: string;
  countryCode: string;
}

export function formatPhone(input: string, defaultCountry: string = '+1'): PhoneResult {
  const digits = input.replace(/\\D/g, '');

  if (digits.length < 7 || digits.length > 15) {
    return { valid: false, formatted: input, digits, countryCode: '' };
  }

  let normalized = digits;
  let countryCode = defaultCountry;

  if (input.startsWith('+')) {
    countryCode = '+' + digits.substring(0, digits.length - 10);
    normalized = digits.substring(digits.length - 10);
  } else if (digits.length === 10) {
    normalized = digits;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    countryCode = '+1';
    normalized = digits.substring(1);
  }

  const formatted = normalized.length === 10
    ? \`\${countryCode} (\${normalized.slice(0, 3)}) \${normalized.slice(3, 6)}-\${normalized.slice(6)}\`
    : \`\${countryCode} \${normalized}\`;

  return { valid: true, formatted, digits: normalized, countryCode };
}`,
    dependencies: [],
    useCases: ['User profile forms', 'Contact information', 'SMS verification'],
  },
  {
    id: 'url-validator',
    name: 'URL Validator',
    category: 'Validation',
    description: 'Validates URLs with protocol, domain, and path checks',
    keywords: ['url', 'validator', 'link', 'validation', 'protocol'],
    language: 'typescript',
    framework: 'node',
    code: `interface UrlValidation {
  valid: boolean;
  normalized: string;
  protocol: string;
  hostname: string;
  errors: string[];
}

export function validateUrl(input: string, options?: { requireHttps?: boolean; allowedDomains?: string[] }): UrlValidation {
  const errors: string[] = [];
  const trimmed = input.trim();

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : \`https://\${trimmed}\`);

    if (!['http:', 'https:'].includes(url.protocol)) {
      errors.push('Only HTTP and HTTPS protocols are allowed');
    }
    if (options?.requireHttps && url.protocol !== 'https:') {
      errors.push('HTTPS is required');
    }
    if (options?.allowedDomains && !options.allowedDomains.some(d => url.hostname.endsWith(d))) {
      errors.push('Domain not in allowed list');
    }
    if (!url.hostname.includes('.')) {
      errors.push('Invalid domain');
    }

    return { valid: errors.length === 0, normalized: url.toString(), protocol: url.protocol, hostname: url.hostname, errors };
  } catch {
    return { valid: false, normalized: trimmed, protocol: '', hostname: '', errors: ['Invalid URL format'] };
  }
}`,
    dependencies: [],
    useCases: ['Link submission', 'Webhook URL validation', 'Social media links'],
  },
  {
    id: 'password-strength',
    name: 'Password Strength Checker',
    category: 'Validation',
    description: 'Evaluates password strength with scoring and suggestions',
    keywords: ['password', 'strength', 'security', 'scoring', 'validation'],
    language: 'typescript',
    framework: 'node',
    code: `interface StrengthResult {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  suggestions: string[];
}

export function checkPasswordStrength(password: string): StrengthResult {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score += 1;
  else suggestions.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;
  else suggestions.push('Consider using 12+ characters');

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else suggestions.push('Mix uppercase and lowercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push('Add numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else suggestions.push('Add special characters');

  const repeated = /(.)\\1{2,}/.test(password);
  if (repeated) { score -= 1; suggestions.push('Avoid repeated characters'); }

  const common = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (common.some(c => password.toLowerCase().includes(c))) { score -= 1; suggestions.push('Avoid common words'); }

  score = Math.max(0, Math.min(4, score));
  const levels: StrengthResult['level'][] = ['weak', 'fair', 'good', 'strong'];
  const level = levels[Math.min(score, 3)];

  return { score, level, suggestions };
}`,
    dependencies: [],
    useCases: ['Registration forms', 'Password change', 'Security auditing'],
  },
  {
    id: 'date-range-validator',
    name: 'Date Range Validator',
    category: 'Validation',
    description: 'Validates date ranges with min/max constraints and business logic',
    keywords: ['date', 'range', 'validation', 'calendar', 'constraint'],
    language: 'typescript',
    framework: 'node',
    code: `interface DateRangeValidation {
  valid: boolean;
  errors: string[];
  startDate: Date;
  endDate: Date;
  durationDays: number;
}

export function validateDateRange(
  start: string | Date,
  end: string | Date,
  options?: { maxDays?: number; minDays?: number; allowPast?: boolean; allowWeekends?: boolean }
): DateRangeValidation {
  const errors: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  const { maxDays, minDays = 0, allowPast = false, allowWeekends = true } = options || {};

  if (isNaN(startDate.getTime())) errors.push('Invalid start date');
  if (isNaN(endDate.getTime())) errors.push('Invalid end date');

  if (errors.length === 0) {
    if (endDate <= startDate) errors.push('End date must be after start date');
    if (!allowPast && startDate < new Date()) errors.push('Start date cannot be in the past');

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (maxDays && diffDays > maxDays) errors.push(\`Range cannot exceed \${maxDays} days\`);
    if (diffDays < minDays) errors.push(\`Range must be at least \${minDays} days\`);

    if (!allowWeekends) {
      if (startDate.getDay() === 0 || startDate.getDay() === 6) errors.push('Start date cannot be a weekend');
      if (endDate.getDay() === 0 || endDate.getDay() === 6) errors.push('End date cannot be a weekend');
    }

    return { valid: errors.length === 0, errors, startDate, endDate, durationDays: diffDays };
  }

  return { valid: false, errors, startDate, endDate, durationDays: 0 };
}`,
    dependencies: [],
    useCases: ['Booking systems', 'Report date filters', 'Leave request forms'],
  },
  {
    id: 'file-type-checker',
    name: 'File Type Checker',
    category: 'Validation',
    description: 'Validates file types by extension and MIME type with size limits',
    keywords: ['file', 'type', 'validation', 'mime', 'extension'],
    language: 'typescript',
    framework: 'node',
    code: `interface FileValidation {
  valid: boolean;
  errors: string[];
  extension: string;
  mimeType: string;
}

const FILE_CATEGORIES: Record<string, { extensions: string[]; mimeTypes: string[]; maxSize: number }> = {
  image: { extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'], mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'], maxSize: 10 * 1024 * 1024 },
  document: { extensions: ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx'], mimeTypes: ['application/pdf', 'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], maxSize: 25 * 1024 * 1024 },
  video: { extensions: ['.mp4', '.webm', '.mov', '.avi'], mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'], maxSize: 100 * 1024 * 1024 },
};

export function validateFile(
  filename: string, mimeType: string, size: number, allowedCategories: string[]
): FileValidation {
  const errors: string[] = [];
  const ext = '.' + filename.split('.').pop()?.toLowerCase();

  const matchedCategory = allowedCategories.find(cat => {
    const config = FILE_CATEGORIES[cat];
    return config?.extensions.includes(ext) || config?.mimeTypes.includes(mimeType);
  });

  if (!matchedCategory) errors.push(\`File type not allowed. Accepted: \${allowedCategories.join(', ')}\`);
  else {
    const maxSize = FILE_CATEGORIES[matchedCategory].maxSize;
    if (size > maxSize) errors.push(\`File too large. Max: \${(maxSize / 1024 / 1024).toFixed(0)}MB\`);
  }

  return { valid: errors.length === 0, errors, extension: ext, mimeType };
}`,
    dependencies: [],
    useCases: ['File upload validation', 'Profile picture upload', 'Document submission'],
  },
  {
    id: 'custom-zod-refinement',
    name: 'Custom Zod Refinements',
    category: 'Validation',
    description: 'Reusable Zod refinement functions for common validation patterns',
    keywords: ['zod', 'refinement', 'custom', 'validation', 'transform'],
    language: 'typescript',
    framework: 'zod',
    code: `import { z } from 'zod';

export const refinements = {
  noWhitespace: (schema: z.ZodString) =>
    schema.refine(val => !/\\s/.test(val), 'Must not contain whitespace'),

  alphanumeric: (schema: z.ZodString) =>
    schema.refine(val => /^[a-zA-Z0-9]+$/.test(val), 'Must be alphanumeric'),

  futureDate: (schema: z.ZodString) =>
    schema.refine(val => new Date(val) > new Date(), 'Must be a future date'),

  uniqueArray: <T extends z.ZodTypeAny>(schema: z.ZodArray<T>) =>
    schema.refine(arr => new Set(arr).size === arr.length, 'Array must contain unique values'),

  matchField: (fieldName: string) => (val: any, ctx: z.RefinementCtx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Passwords do not match', path: ['confirmPassword'] });
    }
  },

  conditionalRequired: (condition: (data: any) => boolean, field: string) =>
    (val: any, ctx: z.RefinementCtx) => {
      if (condition(val) && !val[field]) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: \`\${field} is required\`, path: [field] });
      }
    },
};

export const transforms = {
  trimAll: <T extends Record<string, any>>(obj: T): T => {
    const result = { ...obj };
    for (const key of Object.keys(result)) {
      if (typeof result[key] === 'string') (result as any)[key] = result[key].trim();
    }
    return result;
  },
};`,
    dependencies: ['zod'],
    useCases: ['Complex form validation', 'API input validation', 'Custom business rules'],
  },
  {
    id: 'slug-generator',
    name: 'URL Slug Generator',
    category: 'Utility Functions',
    description: 'Generates URL-friendly slugs from strings with collision avoidance',
    keywords: ['slug', 'url', 'generator', 'seo', 'friendly'],
    language: 'typescript',
    framework: 'node',
    code: `export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

export function generateUniqueSlug(text: string, existingSlugs: Set<string>): string {
  let slug = generateSlug(text);
  if (!existingSlugs.has(slug)) return slug;

  let counter = 1;
  while (existingSlugs.has(\`\${slug}-\${counter}\`)) counter++;
  return \`\${slug}-\${counter}\`;
}`,
    dependencies: [],
    useCases: ['Blog post URLs', 'Product page URLs', 'Category pages'],
  },
  {
    id: 'color-contrast',
    name: 'Color Contrast Checker',
    category: 'Utility Functions',
    description: 'Calculates WCAG color contrast ratio between two colors',
    keywords: ['color', 'contrast', 'wcag', 'accessibility', 'a11y'],
    language: 'typescript',
    framework: 'node',
    code: `function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(color1: string, color2: string): number {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(color1, color2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}`,
    dependencies: [],
    useCases: ['Design system validation', 'Accessibility auditing', 'Theme generation'],
  },
  {
    id: 'deep-merge',
    name: 'Deep Merge Utility',
    category: 'Utility Functions',
    description: 'Deep merges objects with array handling and type preservation',
    keywords: ['deep', 'merge', 'object', 'utility', 'recursive'],
    language: 'typescript',
    framework: 'node',
    code: `export function deepMerge<T extends Record<string, any>>(...objects: Partial<T>[]): T {
  const result: any = {};

  for (const obj of objects) {
    if (!obj) continue;
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        result[key] = Array.isArray(result[key]) ? [...result[key], ...value] : [...value];
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = deepMerge(result[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  const cloned: any = {};
  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    cloned[key] = deepClone(value);
  }
  return cloned;
}`,
    dependencies: [],
    useCases: ['Config merging', 'Default options', 'State updates'],
  },
  {
    id: 'debounce-function',
    name: 'Debounce Function',
    category: 'Utility Functions',
    description: 'Creates a debounced version of any function with cancel support',
    keywords: ['debounce', 'function', 'utility', 'delay', 'cancel'],
    language: 'typescript',
    framework: 'node',
    code: `export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;

  const debounced = ((...args: any[]) => {
    lastArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      lastArgs = null;
    }, delay);
  }) as T & { cancel: () => void; flush: () => void };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      if (lastArgs) fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
}`,
    dependencies: [],
    useCases: ['Search input handling', 'Window resize handlers', 'Auto-save functionality'],
  },
  {
    id: 'format-currency',
    name: 'Currency Formatter',
    category: 'Utility Functions',
    description: 'Formats numbers as currency with locale and currency code support',
    keywords: ['currency', 'format', 'money', 'locale', 'number'],
    language: 'typescript',
    framework: 'node',
    code: `interface CurrencyOptions {
  currency?: string;
  locale?: string;
  compact?: boolean;
  showSign?: boolean;
}

export function formatCurrency(amount: number, options: CurrencyOptions = {}): string {
  const { currency = 'USD', locale = 'en-US', compact = false, showSign = false } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    signDisplay: showSign ? 'always' : 'auto',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
  });

  return formatter.format(amount);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
}`,
    dependencies: [],
    useCases: ['Product pricing', 'Financial reports', 'Invoice generation'],
  },
  {
    id: 'format-date-relative',
    name: 'Relative Date Formatter',
    category: 'Utility Functions',
    description: 'Formats dates as relative time strings (e.g., "2 hours ago")',
    keywords: ['date', 'relative', 'time', 'ago', 'format'],
    language: 'typescript',
    framework: 'node',
    code: `const UNITS: [string, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

export function formatRelativeDate(date: Date | string | number): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (Math.abs(diffSeconds) < 5) return 'just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, seconds] of UNITS) {
    const value = Math.floor(Math.abs(diffSeconds) / seconds);
    if (value >= 1) {
      return rtf.format(diffSeconds > 0 ? -value : value, unit as Intl.RelativeTimeFormatUnit);
    }
  }

  return 'just now';
}`,
    dependencies: [],
    useCases: ['Comment timestamps', 'Activity feeds', 'Notification times'],
  },
  {
    id: 'truncate-text',
    name: 'Text Truncation Utility',
    category: 'Utility Functions',
    description: 'Truncates text with word boundary awareness and custom suffix',
    keywords: ['truncate', 'text', 'ellipsis', 'shorten', 'string'],
    language: 'typescript',
    framework: 'node',
    code: `interface TruncateOptions {
  maxLength?: number;
  suffix?: string;
  wordBoundary?: boolean;
}

export function truncateText(text: string, options: TruncateOptions = {}): string {
  const { maxLength = 100, suffix = '...', wordBoundary = true } = options;

  if (text.length <= maxLength) return text;

  let truncated = text.substring(0, maxLength - suffix.length);

  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.5) truncated = truncated.substring(0, lastSpace);
  }

  return truncated.trimEnd() + suffix;
}

export function truncateMiddle(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text;
  const half = Math.floor((maxLength - 3) / 2);
  return text.substring(0, half) + '...' + text.substring(text.length - half);
}`,
    dependencies: [],
    useCases: ['Card descriptions', 'Table cell content', 'Meta descriptions'],
  },
  {
    id: 'group-by',
    name: 'Group By Utility',
    category: 'Utility Functions',
    description: 'Groups array items by a key with type-safe accessor',
    keywords: ['group', 'array', 'categorize', 'utility', 'collection'],
    language: 'typescript',
    framework: 'node',
    code: `export function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

export function countBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, number> {
  return items.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<K, number>);
}

export function indexBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T> {
  return items.reduce((index, item) => {
    index[keyFn(item)] = item;
    return index;
  }, {} as Record<K, T>);
}`,
    dependencies: [],
    useCases: ['Data categorization', 'Report generation', 'Dashboard aggregation'],
  },
  {
    id: 'unique-id-generator',
    name: 'Unique ID Generator',
    category: 'Utility Functions',
    description: 'Generates unique IDs with various formats (UUID, nanoid, prefixed)',
    keywords: ['id', 'uuid', 'unique', 'generator', 'nanoid'],
    language: 'typescript',
    framework: 'node',
    code: `import { randomUUID, randomBytes } from 'crypto';

export function uuid(): string {
  return randomUUID();
}

export function nanoid(size: number = 21): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  const bytes = randomBytes(size);
  let id = '';
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
}

export function prefixedId(prefix: string, size: number = 12): string {
  return \`\${prefix}_\${nanoid(size)}\`;
}

export function timestampId(): string {
  const ts = Date.now().toString(36);
  const rand = nanoid(8);
  return \`\${ts}-\${rand}\`;
}

export function shortId(): string {
  return nanoid(8);
}`,
    dependencies: [],
    useCases: ['Database record IDs', 'API keys', 'File naming'],
  },
  {
    id: 'csv-parser',
    name: 'CSV Parser',
    category: 'Utility Functions',
    description: 'Parses CSV strings into typed objects with header mapping',
    keywords: ['csv', 'parser', 'import', 'data', 'spreadsheet'],
    language: 'typescript',
    framework: 'node',
    code: `interface CsvOptions {
  delimiter?: string;
  hasHeaders?: boolean;
  trimValues?: boolean;
}

export function parseCsv<T extends Record<string, string>>(
  input: string,
  options: CsvOptions = {}
): T[] {
  const { delimiter = ',', hasHeaders = true, trimValues = true } = options;

  const lines = input.split(/\\r?\\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === delimiter && !inQuotes) { values.push(trimValues ? current.trim() : current); current = ''; continue; }
      current += char;
    }
    values.push(trimValues ? current.trim() : current);
    return values;
  };

  if (!hasHeaders) {
    return lines.map(line => {
      const values = parseLine(line);
      const obj: any = {};
      values.forEach((v, i) => { obj[\`col\${i}\`] = v; });
      return obj;
    });
  }

  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const obj: any = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

export function toCsv<T extends Record<string, any>>(data: T[], delimiter: string = ','): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const lines = [headers.join(delimiter)];
  for (const row of data) {
    lines.push(headers.map(h => {
      const val = String(row[h] ?? '');
      return val.includes(delimiter) || val.includes('"') ? \`"\${val.replace(/"/g, '""')}"\` : val;
    }).join(delimiter));
  }
  return lines.join('\\n');
}`,
    dependencies: [],
    useCases: ['Data import', 'Report export', 'Spreadsheet processing'],
  },
  {
    id: 'responsive-grid',
    name: 'Responsive Grid Layout',
    category: 'CSS/Tailwind Patterns',
    description: 'Auto-responsive grid using CSS Grid with min-max columns',
    keywords: ['grid', 'responsive', 'layout', 'columns', 'auto-fit'],
    language: 'css',
    framework: 'tailwind',
    code: `.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.responsive-grid-sm {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.responsive-grid-lg {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 2rem;
}`,
    dependencies: [],
    useCases: ['Product card grids', 'Dashboard widgets', 'Image galleries'],
  },
  {
    id: 'glass-morphism',
    name: 'Glassmorphism Effect',
    category: 'CSS/Tailwind Patterns',
    description: 'Frosted glass effect with backdrop blur and transparency',
    keywords: ['glass', 'blur', 'frosted', 'morphism', 'transparent'],
    language: 'css',
    framework: 'tailwind',
    code: `.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
}

.glass-dark {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}`,
    dependencies: [],
    useCases: ['Hero overlays', 'Navigation bars', 'Modal backgrounds'],
  },
  {
    id: 'gradient-text',
    name: 'Gradient Text Effect',
    category: 'CSS/Tailwind Patterns',
    description: 'Multi-color gradient text with various preset gradients',
    keywords: ['gradient', 'text', 'color', 'effect', 'heading'],
    language: 'css',
    framework: 'tailwind',
    code: `.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-sunset {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-ocean {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-fire {
  background: linear-gradient(135deg, #f83600 0%, #f9d423 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}`,
    dependencies: [],
    useCases: ['Hero headings', 'Feature titles', 'Brand text'],
  },
  {
    id: 'animated-underline',
    name: 'Animated Underline Effect',
    category: 'CSS/Tailwind Patterns',
    description: 'Smooth animated underline that expands on hover',
    keywords: ['underline', 'animated', 'hover', 'link', 'effect'],
    language: 'css',
    framework: 'tailwind',
    code: `.animated-underline {
  position: relative;
  text-decoration: none;
}

.animated-underline::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}

.animated-underline:hover::after {
  width: 100%;
}

.animated-underline-center::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease, left 0.3s ease;
}

.animated-underline-center:hover::after {
  width: 100%;
  left: 0;
}`,
    dependencies: [],
    useCases: ['Navigation links', 'Text links', 'Tab indicators'],
  },
  {
    id: 'skeleton-pulse',
    name: 'Skeleton Pulse Animation',
    category: 'CSS/Tailwind Patterns',
    description: 'CSS keyframe animation for skeleton loading placeholders',
    keywords: ['skeleton', 'pulse', 'loading', 'animation', 'placeholder'],
    language: 'css',
    framework: 'tailwind',
    code: `@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-pulse {
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 37%, #e5e7eb 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 0.25rem;
}

.skeleton-pulse-dark {
  background: linear-gradient(90deg, #374151 25%, #4b5563 37%, #374151 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 0.25rem;
}

.skeleton-text { height: 1em; margin-bottom: 0.5em; }
.skeleton-title { height: 1.5em; width: 60%; margin-bottom: 1em; }
.skeleton-avatar { width: 3rem; height: 3rem; border-radius: 50%; }
.skeleton-image { width: 100%; aspect-ratio: 16/9; }`,
    dependencies: [],
    useCases: ['Content loading states', 'Page transitions', 'Data fetching placeholders'],
  },
  {
    id: 'scroll-snap',
    name: 'Scroll Snap Container',
    category: 'CSS/Tailwind Patterns',
    description: 'CSS scroll snap for carousel-like horizontal scrolling',
    keywords: ['scroll', 'snap', 'carousel', 'horizontal', 'slider'],
    language: 'css',
    framework: 'tailwind',
    code: `.scroll-snap-x {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 1rem;
  padding: 1rem;
}

.scroll-snap-x::-webkit-scrollbar { display: none; }

.scroll-snap-item {
  scroll-snap-align: start;
  flex-shrink: 0;
}

.scroll-snap-y {
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  height: 100%;
}

.scroll-snap-y > * {
  scroll-snap-align: start;
}`,
    dependencies: [],
    useCases: ['Image carousels', 'Story viewers', 'Product sliders'],
  },
  {
    id: 'aspect-ratio-container',
    name: 'Aspect Ratio Container',
    category: 'CSS/Tailwind Patterns',
    description: 'Maintains aspect ratio for responsive media containers',
    keywords: ['aspect-ratio', 'container', 'responsive', 'video', 'embed'],
    language: 'css',
    framework: 'tailwind',
    code: `.aspect-square { aspect-ratio: 1 / 1; }
.aspect-video { aspect-ratio: 16 / 9; }
.aspect-photo { aspect-ratio: 4 / 3; }
.aspect-portrait { aspect-ratio: 3 / 4; }
.aspect-cinema { aspect-ratio: 21 / 9; }

.aspect-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.aspect-container > * {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.aspect-container > img,
.aspect-container > video {
  object-fit: cover;
}`,
    dependencies: [],
    useCases: ['Video embeds', 'Image containers', 'Card media sections'],
  },
  {
    id: 'truncate-ellipsis',
    name: 'Text Truncation with Ellipsis',
    category: 'CSS/Tailwind Patterns',
    description: 'Single and multi-line text truncation with CSS',
    keywords: ['truncate', 'ellipsis', 'text', 'overflow', 'clamp'],
    language: 'css',
    framework: 'tailwind',
    code: `.truncate-1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`,
    dependencies: [],
    useCases: ['Card descriptions', 'Table cells', 'Navigation labels'],
  },
  {
    id: 'custom-scrollbar',
    name: 'Custom Scrollbar Styles',
    category: 'CSS/Tailwind Patterns',
    description: 'Custom styled scrollbars for webkit and Firefox browsers',
    keywords: ['scrollbar', 'custom', 'style', 'webkit', 'scroll'],
    language: 'css',
    framework: 'tailwind',
    code: `.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.hidden-scrollbar::-webkit-scrollbar { display: none; }
.hidden-scrollbar { scrollbar-width: none; }`,
    dependencies: [],
    useCases: ['Sidebar navigation', 'Chat panels', 'Code editors'],
  },
  {
    id: 'animated-gradient-bg',
    name: 'Animated Gradient Background',
    category: 'CSS/Tailwind Patterns',
    description: 'Smoothly animated gradient background with configurable colors',
    keywords: ['gradient', 'animated', 'background', 'effect', 'motion'],
    language: 'css',
    framework: 'tailwind',
    code: `@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animated-gradient {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

.animated-gradient-subtle {
  background: linear-gradient(-45deg, #f5f7fa, #c3cfe2, #f5f7fa, #e0c3fc);
  background-size: 400% 400%;
  animation: gradient-shift 20s ease infinite;
}

.animated-gradient-dark {
  background: linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #0f0c29);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}`,
    dependencies: [],
    useCases: ['Hero sections', 'Landing page backgrounds', 'Loading screens'],
  },
];
