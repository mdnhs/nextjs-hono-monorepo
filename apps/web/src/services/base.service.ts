import restApiClient from '@/lib/api-client';
import { ApiResponse, PaginationApiResponse } from '@/lib/api-client';
import { PaginationType, ServiceResponse } from '@/types';

export class BaseService {
  protected formatResponse<T>(response: ApiResponse<T>): ServiceResponse<T> {
    return {
      error: restApiClient.hasError(response),
      message: restApiClient.getMessage(response),
      data: restApiClient.extractBackendData(response),
      pagination: this.formatPagination(restApiClient.extractPagination(response)),
      status: response.status,
    };
  }

  protected formatPagination(pagination: PaginationApiResponse | null): PaginationType | undefined {
    if (!pagination) return undefined;
    return {
      totalData: pagination.total,
      totalPages: pagination.total_pages,
      currentPage: pagination.current_page,
      limit: pagination.limit,
      hasNextPage: pagination.has_next_page,
      hasPrevPage: pagination.has_prev_page,
    };
  }
}
