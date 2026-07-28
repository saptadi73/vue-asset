export interface CrudOption {
  label: string
  value: string
}

export interface CrudField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'file'
  placeholder?: string
  helper?: string
  options?: CrudOption[]
  required?: boolean
  fullWidth?: boolean
  readOnly?: boolean
  accept?: string
  multiple?: boolean
}

export type CrudFormValues = Record<string, string>
export type CrudFileValues = Record<string, File[]>

export interface CrudSection {
  title: string
  description: string
  fields: CrudField[]
}

export interface CrudHeaderAction {
  label: string
  icon: string
  tone?: 'primary' | 'secondary'
  onlyModes?: Array<'create' | 'edit'>
  resolveTo: (context: {
    mode: 'create' | 'edit'
    itemId: string
    values: Record<string, string>
  }) => string
}

export interface CrudParentContextItem {
  queryKey: string
  label: string
}

export interface CrudConfig {
  key: string
  title: string
  entityName: string
  formRole?: 'main' | 'sub'
  parentContext?: CrudParentContextItem[]
  requiredParentContextKeys?: string[]
  basePath: string
  createTitle: string
  editTitle: string
  deleteTitle: string
  createDescription: string
  editDescription: string
  deleteDescription: string
  listDescription: string
  seedId: string
  endpoints: {
    create: { method: 'POST'; path: string; note: string }
    edit: { method: 'PATCH'; path: string; note: string }
    delete?: { method: 'DELETE'; path: string; note: string }
  }
  resolveCreatePath?: (values: Record<string, string>) => string
  resolveEditPath?: (id: string, values: Record<string, string>) => string
  resolveDeletePath?: (id: string, values?: Record<string, string>) => string
  validate?: (values: CrudFormValues, files?: CrudFileValues) => string[]
  mapToPayload?: (values: CrudFormValues, files?: CrudFileValues) => Record<string, unknown>
  sampleValues?: CrudFormValues
  relatedActions?: CrudHeaderAction[]
  workflowActions?: Array<{
    key: string
    label: string
    description: string
    icon: string
    tone: string
    method: 'POST' | 'PATCH'
    resolvePath: (id: string) => string
    noteFieldLabel?: string
    noteFieldPlaceholder?: string
    nextState: string
  }>
  sections: CrudSection[]
}
