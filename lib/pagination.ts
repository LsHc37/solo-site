/**
 * Pagination Utilities
 * Provides pagination helpers for paginated API responses
 */

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Calculate pagination start and limit for database queries
 */
export function getPaginationOffset(page: number, limit: number): { offset: number; limit: number } {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 100)); // Max 100 per page
  const offset = (safePage - 1) * safeLimit;
  return { offset, limit: safeLimit };
}

/**
 * Calculate pagination metadata
 */
export function getPaginationMeta(page: number, limit: number, total: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const pages = Math.ceil(total / safeLimit);

  return {
    page: safePage,
    limit: safeLimit,
    total,
    pages,
    hasNext: safePage < pages,
    hasPrev: safePage > 1,
  };
}

/**
 * Build pagination query string for URL
 */
export function buildPaginationQuery(page: number, limit: number, sort?: string, order?: string): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (sort) params.set("sort", sort);
  if (order) params.set("order", order);
  return params.toString();
}

/**
 * Parse and validate pagination params from URL
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
  const sort = searchParams.get("sort") || undefined;
  const order = (searchParams.get("order") as "asc" | "desc" | null) || "desc";

  return { page, limit, sort, order };
}
