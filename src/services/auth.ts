import { apiRequest } from '@/services/http'
import { clearSessionTokens, getAccessToken, setSessionTokens, setSessionUser } from '@/services/session'
import type { SessionUser } from '@/services/session'

interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type?: string
  access_token_expires_at?: string
  refresh_token_expires_at?: string
}

interface AuthLoginResponse {
  user: SessionUser
  tokens: AuthTokens
}

export const loginWithPassword = async (email: string, password: string) => {
  const response = await apiRequest<AuthLoginResponse>('/auth/login', {
    method: 'POST',
    withAuth: false,
    body: {
      email,
      password,
    },
  })

  setSessionTokens({
    accessToken: response.data.tokens.access_token,
    refreshToken: response.data.tokens.refresh_token,
  })
  setSessionUser(response.data.user)

  return response.data
}

export const fetchCurrentUser = async () => {
  const response = await apiRequest<SessionUser>('/auth/me')
  setSessionUser(response.data)
  return response.data
}

export const logoutSession = async () => {
  try {
    if (getAccessToken().trim()) {
      await apiRequest<null>('/auth/logout', {
        method: 'POST',
      })
    }
  } finally {
    clearSessionTokens()
  }
}
