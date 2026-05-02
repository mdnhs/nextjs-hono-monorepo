// Standard service layer response
export interface ServiceResponse<T> {
  error: boolean;
  message: string;
  data: T | null;
  pagination?: PaginationType;
  status?: number;
}

// Mapped camelCase version used in app code
export interface PaginationType {
  totalData: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
