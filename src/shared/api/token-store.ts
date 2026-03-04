let accessToken: string | null = null
let accessTokenExpiry: number | null = null

export const tokenStore = {
  getAccessToken: (): string | null => {
    // 主動過期檢查：若 token 已過期則返回 null 觸發刷新
    if (accessToken && accessTokenExpiry && Date.now() >= accessTokenExpiry) {
      accessToken = null
      accessTokenExpiry = null
      return null
    }
    return accessToken
  },
  setAccessToken: (token: string | null, expiresIn?: number): void => {
    accessToken = token
    accessTokenExpiry = token && expiresIn ? Date.now() + expiresIn * 1000 : null
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
    accessTokenExpiry = null
    localStorage.removeItem('refresh_token')
  },
}
