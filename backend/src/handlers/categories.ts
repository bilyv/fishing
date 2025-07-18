/**
 * Product categories handlers for CRUD operations
 * Provides endpoints for managing product categories
 */

import { z } from 'zod';
import type { HonoContext, PaginationParams } from '../types/index';
import {
  calculatePagination,
} from '../utils/response';
import {
  applyPagination,
  applySearch,
  getTotalCount,
  recordExists,
} from '../utils/db';
import {
  asyncHandler,
  DatabaseError,
  throwValidationError,
  throwNotFoundError,
  throwConflictError,
  throwBusinessLogicError,
} from '../middleware/error-handler';

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

const getCategoriesQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  sortBy: z.string().default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
});

/**
 * Get all product categories with pagination and search
 * @param request - HTTP request
 * @param context - Request context
 * @returns Paginated list of categories
 */
export const getCategoriesHandler = asyncHandler(async (c: HonoContext) => {
  const queryParams = c.req.query();

  // Validate query parameters
  const validation = getCategoriesQuerySchema.safeParse(queryParams);
  if (!validation.success) {
    throwValidationError('Invalid query parameters', {
      errors: validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  const { page, limit, sortBy, sortOrder, search } = validation.data!;

  // Build query
  let query = c.get('supabase')
    .from('product_categories')
    .select('category_id, name, description, created_at, updated_at');

  // Apply search
  if (search) {
    query = applySearch(query, search, ['name', 'description']);
  }

  // Get total count for pagination
  const totalCount = await getTotalCount(c.get('supabase'), 'product_categories', {});

  // Apply pagination
  query = applyPagination(query, { page, limit, sortBy, sortOrder });

  // Execute query
  const { data: categories, error } = await query;

  if (error) {
    throw new DatabaseError(`Failed to fetch categories: ${error.message}`, error);
  }

  // Calculate pagination info
  const pagination = calculatePagination(totalCount, page, limit);

  return c.json({
    success: true,
    data: categories || [],
    pagination,
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
  });
});

/**
 * Get a single category by ID
 */
export const getCategoryHandler = asyncHandler(async (c: HonoContext) => {
  const id = c.req.param('id');

  if (!id) {
    throwValidationError('Category ID is required');
  }

  // Get category from database
  const { data: category, error } = await c.get('supabase')
    .from('product_categories')
    .select('*')
    .eq('category_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throwNotFoundError('Category');
    }
    throw new DatabaseError(`Failed to fetch category: ${error.message}`, error);
  }

  return c.json({
    success: true,
    data: category,
    message: 'Category retrieved successfully',
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
  });
});

/**
 * Create a new product category
 * @param request - HTTP request
 * @param context - Request context
 * @returns Created category
 */
export const createCategoryHandler = asyncHandler(async (c: HonoContext) => {
  const body = await c.req.json();

  // Validate request body
  const validation = createCategorySchema.safeParse(body);
  if (!validation.success) {
    throwValidationError('Invalid category data', {
      errors: validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  const categoryData = validation.data!;

  // Check if category name already exists
  const { data: existingCategory, error: checkError } = await c.get('supabase')
    .from('product_categories')
    .select('category_id')
    .eq('name', categoryData.name)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw new DatabaseError(`Failed to check category name uniqueness: ${checkError.message}`, checkError);
  }

  if (existingCategory) {
    throwConflictError('A category with this name already exists');
  }

  // Create category
  const { data: newCategory, error } = await c.get('supabase')
    .from('product_categories')
    .insert({
      name: categoryData.name,
      description: categoryData.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to create category: ${error.message}`, error);
  }

  return c.json({
    success: true,
    message: 'Category created successfully',
    data: newCategory,
    requestId: c.get('requestId'),
  }, 201);
});

/**
 * Update an existing category
 */
export const updateCategoryHandler = asyncHandler(async (c: HonoContext) => {
  const id = c.req.param('id');

  if (!id) {
    throwValidationError('Category ID is required');
  }

  const body = await c.req.json();

  // Validate request body
  const validation = updateCategorySchema.safeParse(body);
  if (!validation.success) {
    throwValidationError('Invalid category data', {
      errors: validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  const updateData = validation.data!;

  // Check if category exists
  const categoryExists = await recordExists(c.get('supabase'), 'product_categories', id, 'category_id');
  if (!categoryExists) {
    throwNotFoundError('Category');
  }

  // Check if new name conflicts with existing category (if name is being updated)
  if (updateData.name) {
    const { data: existingCategory, error: checkError } = await c.get('supabase')
      .from('product_categories')
      .select('category_id')
      .eq('name', updateData.name)
      .neq('category_id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new DatabaseError(`Failed to check category name uniqueness: ${checkError.message}`, checkError);
    }

    if (existingCategory) {
      throwConflictError('A category with this name already exists');
    }
  }

  // Update category
  const { data: updatedCategory, error } = await c.get('supabase')
    .from('product_categories')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('category_id', id)
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Failed to update category: ${error.message}`, error);
  }

  return c.json({
    success: true,
    data: updatedCategory,
    message: 'Category updated successfully',
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
  });
});

/**
 * Delete a category
 */
export const deleteCategoryHandler = asyncHandler(async (c: HonoContext) => {
  const id = c.req.param('id');

  if (!id) {
    throwValidationError('Category ID is required');
  }

  // Check if category exists
  const categoryExists = await recordExists(c.get('supabase'), 'product_categories', id, 'category_id');
  if (!categoryExists) {
    throwNotFoundError('Category');
  }

  // Check if category is being used by any products
  const { data: productsUsingCategory, error: checkError } = await c.get('supabase')
    .from('products')
    .select('product_id')
    .eq('category_id', id)
    .limit(1);

  if (checkError) {
    throw new DatabaseError(`Failed to check category usage: ${checkError.message}`, checkError);
  }

  if (productsUsingCategory && productsUsingCategory.length > 0) {
    throwBusinessLogicError(
      'Cannot delete category because it is being used by one or more products. Please remove all products from this category first.',
      409,
      { productsCount: productsUsingCategory.length },
    );
  }

  // Delete category
  const { error } = await c.get('supabase')
    .from('product_categories')
    .delete()
    .eq('category_id', id);

  if (error) {
    throw new DatabaseError(`Failed to delete category: ${error.message}`, error);
  }

  return c.json({
    success: true,
    data: { deleted: true, category_id: id },
    message: 'Category deleted successfully',
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
  });
});
