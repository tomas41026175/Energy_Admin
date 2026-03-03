export type UserStatus = 'active' | 'inactive'

export interface User {
  id: number
  name: string
  email: string
  avatar: string
  status: UserStatus
  created_at: string
}

export interface UsersParams {
  page?: number
  limit?: number
  name?: string
  email?: string
  status?: UserStatus
  id?: number
  createdFrom?: string
  createdTo?: string
}

export interface UsersResponse {
  data: User[]
  pagination: {
    total: number
    current_page: number
    per_page: number
    total_pages: number
  }
}
