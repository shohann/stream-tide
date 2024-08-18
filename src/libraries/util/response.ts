export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function calculatePagination(
  currentPage: number,
  pageSize: number,
  totalItems: number
): Pagination {
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
  };
}

export default class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  pagination?: Pagination;

  constructor(
    statusCode: number,
    data: T,
    message: string = "Success",
    pagination?: Pagination
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    this.data = data;
    this.pagination = pagination;
  }
}

// currentPage: number;

// This represents the current page number being displayed or requested.
// For example, if you're on the second page of results, this would be 2.

// pageSize: number;

// This indicates how many items are displayed per page.
// For instance, if each page shows 10 items, this would be 10.

// totalItems: number;

// This is the total count of all items across all pages.
// For example, if you have 100 total items in your dataset, this would be 100.

// totalPages: number;

// This represents the total number of pages available based on the total items and page size.
// It can be calculated by dividing totalItems by pageSize and rounding up.
// For example, if you have 100 total items and 10 items per page, this would be 10.
