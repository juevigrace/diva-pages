export type APIResponse<T = unknown> = {
  data: T;
  message: string;
  time: number;
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination_info: PaginationInfo;
};
