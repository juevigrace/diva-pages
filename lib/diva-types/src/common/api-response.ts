export interface APIResponse<T = unknown> {
  data: T;
  message: string;
  time: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination_info: PaginationInfo;
}
