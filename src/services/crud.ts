import type { CrudConfig } from '@/types/crud'

import { ApiError, apiRequest } from '@/services/http'

const normalizePayload = (values: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(values)
      .filter(([, value]) => value !== '')
      .map(([key, value]) => {
        if (value === 'yes') return [key, true]
        if (value === 'no') return [key, false]
        if (/^\d+(\.\d+)?$/.test(value) && key !== 'asset_code' && key !== 'request_number' && key !== 'transfer_number') {
          return [key, Number(value)]
        }
        return [key, value]
      }),
  )

export const submitCrudForm = async (config: CrudConfig, mode: 'create' | 'edit', values: Record<string, string>, id?: string) => {
  const payload = normalizePayload(values)
  const path =
    mode === 'create'
      ? config.resolveCreatePath?.(values) || config.endpoints.create.path.replace('/api/v1', '')
      : config.resolveEditPath?.(id || config.seedId, values) || config.endpoints.edit.path.replace('/api/v1', '').replace('{id}', id || config.seedId)

  return apiRequest(path, {
    method: mode === 'create' ? 'POST' : 'PATCH',
    body: payload,
  })
}

export const deleteCrudRecord = async (config: CrudConfig, id: string, values: Record<string, string> = {}) => {
  if (!config.endpoints.delete) {
    throw new ApiError('Delete endpoint belum dikonfigurasi untuk modul ini.', 400, 'DELETE_NOT_AVAILABLE')
  }

  const path =
    config.resolveDeletePath?.(id, values) ||
    config.endpoints.delete.path.replace('/api/v1', '').replace('{id}', id)

  return apiRequest(path, {
    method: 'DELETE',
  })
}
