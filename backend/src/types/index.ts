/**
 * Comprehensive type definitions for the Local Fishing Backend
 * Provides type safety across the entire application with Hono framework
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../config/supabase';
import type { Environment } from '../config/environment';
import type { Context } from 'hono';

// Re-export database types for convenience
export type { Database } from '../config/supabase';
export type { Environment } from '../config/environment';

// Cloudflare Workers environment interface
export interface Env extends Environment {
  // Add any additional Cloudflare-specific bindings here
  // KV?: KVNamespace;
  // DURABLE_OBJECT?: DurableObjectNamespace;
}

// Hono context variables interface
export interface Variables {
  supabase: SupabaseClient<Database>;
  user?: AuthenticatedUser;
  requestId: string;
  startTime: number;
}

// Hono context type with our custom variables
export type HonoContext = Context<{ Bindings: Env; Variables: Variables }>;

// Legacy request context interface for backward compatibility
export interface RequestContext {
  env: Env;
  supabase: SupabaseClient<Database>;
  user?: AuthenticatedUser;
  requestId: string;
  startTime: number;
}

// Authentication types
export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export type UserRole = 'admin' | 'manager' | 'employee';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: string;
  details?: Record<string, unknown>;
  stack?: string; // Only in development
}

// Request validation types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Product types
export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  sku: string;
  barcode?: string;
  stockQuantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unit?: string;
  supplierId?: string;
  imageUrl?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface ProductFilters extends FilterParams {
  category?: string;
  inStock?: boolean;
  lowStock?: boolean;
  priceMin?: number;
  priceMax?: number;
}

// User types
export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  role?: UserRole;
  phone?: string;
  address?: string;
}

export interface UpdateUserRequest {
  id: string;
  email?: string;
  username?: string;
  fullName?: string;
  role?: UserRole;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Authentication request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends CreateUserRequest {
  confirm_password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Sales types
export interface CreateSaleRequest {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: SaleItemRequest[];
  paymentMethod: PaymentMethod;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
}

export interface SaleItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateSaleRequest {
  id: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Stock movement types
export interface CreateStockMovementRequest {
  productId: string;
  movementType: MovementType;
  quantity: number;
  unitCost?: number;
  referenceType: ReferenceType;
  referenceId?: string;
  notes?: string;
}

export type MovementType = 'in' | 'out' | 'adjustment';
export type ReferenceType = 'sale' | 'purchase' | 'adjustment' | 'return' | 'transfer';

// File upload types
export interface FileUploadRequest {
  file: File;
  folder?: string;
  publicId?: string;
}

export interface FileUploadResponse {
  url: string;
  publicId: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Logging types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  data?: Record<string, unknown>;
  error?: Error;
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

// Route handler types
export type RouteHandler = (
  request: Request,
  context: RequestContext
) => Promise<Response> | Response;

export interface Route {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  middleware?: (Middleware | RouteHandler)[];
}

// Middleware types
export type Middleware = (
  request: Request,
  context: RequestContext,
  next: () => Promise<Response>
) => Promise<Response>;

// Health check types
export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: HealthCheckResult[];
  uptime: number;
  version: string;
}

// Report types
export type ReportType = 'stock' | 'sales' | 'financial' | 'transactions' | 'products' | 'customers';

export interface ReportRequest {
  type: ReportType;
  dateFrom?: string;
  dateTo?: string;
  filters?: ReportFilters;
  format?: 'pdf' | 'csv' | 'json';
}

export interface ReportFilters {
  categoryId?: string;
  productId?: string;
  customerId?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  minAmount?: number;
  maxAmount?: number;
  userId?: string;
}

export interface StockReportData {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  stockValue: number;
  lastMovementDate?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

export interface SalesReportData {
  saleId: string;
  saleDate: string;
  customerName?: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: SalesReportItem[];
}

export interface SalesReportItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface FinancialReportData {
  period: string;
  totalSales: number;
  totalExpenses: number;
  totalDeposits: number;
  netProfit: number;
  salesCount: number;
  expenseCount: number;
  depositCount: number;
  averageSaleAmount: number;
  topSellingProducts: TopSellingProduct[];
  salesByPaymentMethod: PaymentMethodSummary[];
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface PaymentMethodSummary {
  paymentMethod: PaymentMethod;
  totalAmount: number;
  transactionCount: number;
}

export interface TransactionReportData {
  transactionId: string;
  date: string;
  type: 'sale' | 'expense' | 'deposit';
  description: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  category?: string;
  reference?: string;
}

export interface ProductReportData {
  productId: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  currentStock: number;
  totalSold: number;
  totalRevenue: number;
  profitMargin: number;
  lastSaleDate?: string | undefined;
  createdAt: string;
}

export interface CustomerReportData {
  customerId?: string;
  customerName: string;
  customerEmail?: string | undefined;
  customerPhone?: string | undefined;
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate?: string | undefined;
  firstPurchaseDate?: string | undefined;
}

export interface GeneralReportData {
  productName: string;
  openingStock: {
    boxes: number;
    kg: number;
  };
  newStock: {
    boxes: number;
    kg: number;
  };
  damaged: {
    boxes: number;
    kg: number;
  };
  closingStock: {
    boxes: number;
    kg: number;
  };
  unpaid: {
    boxes: number;
    kg: number;
    amount: number;
  };
  sales: {
    boxes: number;
    kg: number;
    amount: number;
  };
  unitPrice: {
    boxPrice: number;
    kgPrice: number;
  };
  sellingPrice: {
    boxPrice: number;
    kgPrice: number;
  };
  profit: {
    boxProfit: number;
    kgProfit: number;
    totalProfit: number;
  };
  totalPrice: number;
}

export interface ReportResponse<T = unknown> extends ApiResponse<T> {
  reportType: ReportType;
  generatedAt: string;
  period?: {
    from: string;
    to: string;
  };
  summary?: ReportSummary;
}

export interface ReportSummary {
  totalRecords: number;
  totalValue?: number;
  averageValue?: number;
  filters?: ReportFilters;
}
