export interface CrudOption {
  label: string
  value: string
}

export interface CrudField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'number'
  placeholder?: string
  helper?: string
  options?: CrudOption[]
  required?: boolean
  fullWidth?: boolean
  readOnly?: boolean
}

export interface CrudSection {
  title: string
  description: string
  fields: CrudField[]
}

export interface CrudConfig {
  key: string
  title: string
  entityName: string
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
  validate?: (values: Record<string, string>) => string[]
  mapToPayload?: (values: Record<string, string>) => Record<string, unknown>
  sampleValues?: Record<string, string>
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
