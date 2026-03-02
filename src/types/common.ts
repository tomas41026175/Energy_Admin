export interface ApiResponse<T> {
  data: T
  pagination?: Pagination
}

export interface Pagination {
  total: number
  current_page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  message: string
  code?: string
}
