import { apiBasePath } from '@/config/env'

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
