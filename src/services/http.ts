import { apiBasePath } from '@/config/env'
import { getAccessToken } from '@/services/session'

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

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}) => {
  const { body, headers, method = 'GET', withAuth = true, ...rest } = options
  const token = withAuth ? getAccessToken() : ''

  const response = await fetch(createEndpoint(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === null || body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    ...rest,
  })

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.error?.message || payload?.message || `Request failed with status ${response.status}.`,
      response.status,
      payload?.error?.code,
      payload?.error?.details,
    )
  }

  return payload
}
