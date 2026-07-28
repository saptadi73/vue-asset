const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'Asset Hub',
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'),
  apiPrefix: import.meta.env.VITE_API_PREFIX || '/api/v1',
}

export const apiBasePath = `${appConfig.apiBaseUrl}${appConfig.apiPrefix}`
