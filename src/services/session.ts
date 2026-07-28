const ACCESS_TOKEN_KEY = 'asset-hub-access-token'
const REFRESH_TOKEN_KEY = 'asset-hub-refresh-token'

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY) || ''
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY) || ''

export const setSessionTokens = (tokens: { accessToken?: string; refreshToken?: string }) => {
  if (tokens.accessToken !== undefined) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  }

  if (tokens.refreshToken !== undefined) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }
}

export const clearSessionTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
