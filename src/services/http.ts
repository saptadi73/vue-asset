import { apiBasePath } from '@/config/env'
import { clearSessionTokens, getAccessToken, getRefreshToken, setSessionTokens } from '@/services/session'

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  } | null
  meta: {
    request_id: string
    timestamp: string
    api_version: string
    pagination?: {
      page: number
      page_size: number
      total_items: number
      total_pages: number
    } | null
  }
}

export interface ListQuery {
  page?: number
  page_size?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export const buildQueryString = (query: ListQuery = {}) => {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export const createEndpoint = (path: string, query?: ListQuery) =>
  `${apiBasePath}${path}${buildQueryString(query)}`

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | string | null
  withAuth?: boolean
}

interface RefreshTokenResponse {
  tokens: {
    access_token: string
    refresh_token: string
    token_type?: string
    access_token_expires_at?: string
    refresh_token_expires_at?: string
  }
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: Record<string, unknown>

  constructor(message: string, status: number, code?: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

let refreshRequestPromise: Promise<string> | null = null

const redirectToLogin = () => {
  if (typeof window === 'undefined') return
  if (window.location.pathname === '/login') return

  const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const loginUrl = `/login?redirect=${encodeURIComponent(redirect)}`
  window.location.assign(loginUrl)
}

const parsePayload = async <T>(response: Response) =>
  (await response.json().catch(() => null)) as ApiEnvelope<T> | null

const buildHeaders = (headers: HeadersInit | undefined, token: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...headers,
})

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken().trim()

  if (!refreshToken) {
    clearSessionTokens()
    redirectToLogin()
    throw new ApiError('Refresh token tidak tersedia. Silakan login ulang.', 401, 'REFRESH_TOKEN_MISSING')
  }

  if (!refreshRequestPromise) {
    refreshRequestPromise = (async () => {
      const response = await fetch(createEndpoint('/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      })

      const payload = await parsePayload<RefreshTokenResponse>(response)

      if (!response.ok || !payload?.success || !payload.data?.tokens?.access_token) {
        clearSessionTokens()
        redirectToLogin()
        throw new ApiError(
          payload?.error?.message || payload?.message || 'Session berakhir. Silakan login ulang.',
          response.status || 401,
          payload?.error?.code || 'TOKEN_REFRESH_FAILED',
          payload?.error?.details,
        )
      }

      setSessionTokens({
        accessToken: payload.data.tokens.access_token,
        refreshToken: payload.data.tokens.refresh_token,
      })

      return payload.data.tokens.access_token
    })().finally(() => {
      refreshRequestPromise = null
    })
  }

  return refreshRequestPromise
}

const requestOnce = async <T>(path: string, options: ApiRequestOptions, tokenOverride?: string) => {
  const { body, headers, method = 'GET', withAuth = true, ...rest } = options
  const token = withAuth ? tokenOverride ?? getAccessToken() : ''

  const response = await fetch(createEndpoint(path), {
    method,
    headers: buildHeaders(headers, token),
    body: body === null || body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    ...rest,
  })

  return {
    response,
    payload: await parsePayload<T>(response),
  }
}

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}) => {
  const withAuth = options.withAuth ?? true

  let { response, payload } = await requestOnce<T>(path, options)

  if (withAuth && response.status === 401 && getRefreshToken().trim()) {
    const nextAccessToken = await refreshAccessToken()
    const retriedRequest = await requestOnce<T>(path, options, nextAccessToken)
    response = retriedRequest.response
    payload = retriedRequest.payload
  }

  if (!response.ok || !payload?.success) {
    if (withAuth && response.status === 401) {
      clearSessionTokens()
      redirectToLogin()
    }

    throw new ApiError(
      payload?.error?.message || payload?.message || `Request failed with status ${response.status}.`,
      response.status,
      payload?.error?.code,
      payload?.error?.details,
    )
  }

  return payload
}
