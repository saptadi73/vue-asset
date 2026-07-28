const ACCESS_TOKEN_KEY = 'asset-hub-access-token'
const REFRESH_TOKEN_KEY = 'asset-hub-refresh-token'
const USER_PROFILE_KEY = 'asset-hub-user-profile'
const SESSION_CHANGED_EVENT = 'asset-hub-session-changed'

export interface SessionUser {
  id?: string
  email?: string
  full_name?: string
  name?: string
  role?: string
  roles?: string[]
}

const emitSessionChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT))
  }
}

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY) || ''
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY) || ''
export const hasActiveSession = () => Boolean(getAccessToken().trim())

export const getSessionUser = (): SessionUser | null => {
  const raw = localStorage.getItem(USER_PROFILE_KEY)

  if (!raw) return null

  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export const setSessionTokens = (tokens: { accessToken?: string; refreshToken?: string }) => {
  if (tokens.accessToken !== undefined) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  }

  if (tokens.refreshToken !== undefined) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  emitSessionChanged()
}

export const setSessionUser = (user: SessionUser | null) => {
  if (user) {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_PROFILE_KEY)
  }

  emitSessionChanged()
}

export const clearSessionTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_PROFILE_KEY)
  emitSessionChanged()
}

export const sessionChangedEvent = SESSION_CHANGED_EVENT
