export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestConfig {
  skipAuth?: boolean
  skipErrorHandler?: boolean
}
