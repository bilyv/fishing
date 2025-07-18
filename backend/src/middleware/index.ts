/**
 * Middleware exports for Hono framework
 * Centralized exports for all middleware functions
 */

// Authentication middleware
export {
  authenticate,
  requireRole,
  optionalAuth,
  requireAdmin,
  requireManager,
  requireEmployee,
  requireSelfOrAdmin,
} from './auth-hono';

// CORS middleware
export {
  createCorsMiddleware,
  developmentCors,
  createProductionCors,
  handlePreflight,
} from './cors-hono';

// Logging middleware
export {
  requestLogger,
  errorLogger,
  securityLogger,
  developmentLogger,
  createLoggingMiddleware,
  productionLogger,
} from './logging';

// Rate limiting middleware
export {
  rateLimit,
  authRateLimit,
  apiRateLimit,
  userRateLimit,
  ipRateLimit,
  adminRateLimit,
} from './rate-limit';

// Request ID middleware
export {
  requestId,
  requestTiming,
} from './request-id';

// Database middleware
export {
  database,
} from './database';

// Error handling middleware
export {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  BusinessLogicError,
  ErrorType,
  throwValidationError,
  throwNotFoundError,
  throwConflictError,
  throwBusinessLogicError,
} from './error-handler';
