let accessToken: string | null = null

export const tokenStore = {
  getAccessToken: (): string | null => accessToken,
  setAccessToken: (token: string | null): void => {
    accessToken = token
  },
  getRefreshToken: (): string | null => localStorage.getItem('refresh_token'),
  setRefreshToken: (token: string | null): void => {
    if (token) {
      localStorage.setItem('refresh_token', token)
    } else {
      localStorage.removeItem('refresh_token')
    }
  },
  clearAll: (): void => {
    accessToken = null
    localStorage.removeItem('refresh_token')
  },
}
