import type { CrudConfig, CrudFileValues, CrudFormValues } from '@/types/crud'

import { ApiError, apiRequest } from '@/services/http'

const normalizePayload = (values: CrudFormValues) =>
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

const getFilesForUpload = (files: CrudFileValues) =>
  Object.entries(files).filter(([, value]) => value.length > 0)

const buildAssetRegistryFormData = (
  payload: Record<string, unknown>,
  files: CrudFileValues,
) => {
  const formData = new FormData()
  formData.append('asset_data', JSON.stringify(payload))

  for (const file of files.asset_photos || []) {
    formData.append('photo_files', file)
  }

  for (const file of files.manual_book_files || []) {
    formData.append('manual_book_files', file)
  }

  for (const file of files.supporting_document_files || []) {
    formData.append('supporting_document_files', file)
  }

  return formData
}

export const submitCrudForm = async (
  config: CrudConfig,
  mode: 'create' | 'edit',
  values: CrudFormValues,
  id?: string,
  files: CrudFileValues = {},
) => {
  const payload = config.mapToPayload ? config.mapToPayload(values, files) : normalizePayload(values)
  const path =
    mode === 'create'
      ? config.resolveCreatePath?.(values) || config.endpoints.create.path.replace('/api/v1', '')
      : config.resolveEditPath?.(id || config.seedId, values) || config.endpoints.edit.path.replace('/api/v1', '').replace('{id}', id || config.seedId)

  const body =
    config.key === 'assets' && getFilesForUpload(files).length > 0
      ? buildAssetRegistryFormData(payload, files)
      : payload

  return apiRequest(path, {
    method: mode === 'create' ? 'POST' : 'PATCH',
    body,
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

export const submitWorkflowAction = async (
  config: CrudConfig,
  actionKey: string,
  id: string,
  note?: string,
) => {
  const action = config.workflowActions?.find((item) => item.key === actionKey)

  if (!action) {
    throw new ApiError('Workflow action belum dikonfigurasi untuk modul ini.', 400, 'WORKFLOW_ACTION_NOT_AVAILABLE')
  }

  const payload = note ? { note } : undefined

  return apiRequest(action.resolvePath(id), {
    method: action.method,
    body: payload,
  })
}
