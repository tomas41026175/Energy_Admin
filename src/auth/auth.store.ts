import { create } from 'zustand'
import { z } from 'zod'
import { authApi } from './auth.api'
import { tokenStore } from '@/shared/api/token-store'
import type { AuthState, AuthUser, LoginRequest } from './auth.types'

const authUserSchema = z.object({
  username: z.string(),
  role: z.string(),
})

const USER_STORAGE_KEY = 'auth_user'

const getStoredUser = (): AuthUser | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY)
  if (!stored) return null
  try {
    return authUserSchema.parse(JSON.parse(stored))
  } catch {
    return null
  }
}

const setStoredUser = (user: AuthUser | null): void => {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

interface AuthStore extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (data: LoginRequest): Promise<void> => {
    const response = await authApi.login(data)
    tokenStore.setAccessToken(response.access_token, response.expires_in)
    tokenStore.setRefreshToken(response.refresh_token)
    setStoredUser(response.user)
    set({ user: response.user, isAuthenticated: true, isLoading: false })
  },

  logout: (): void => {
    tokenStore.clearAll()
    setStoredUser(null)
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  restoreSession: async (): Promise<void> => {
    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      set({ user: null, isAuthenticated: false, isLoading: false })
      return
    }

    try {
      const response = await authApi.refreshToken(refreshToken)
      tokenStore.setAccessToken(response.access_token, response.expires_in)
      const user = getStoredUser()
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        tokenStore.clearAll()
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      tokenStore.clearAll()
      setStoredUser(null)
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
