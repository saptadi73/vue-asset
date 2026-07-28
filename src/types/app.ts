export interface DataTableColumn {
  key: string
  label: string
  type?: 'text' | 'badge' | 'currency'
  toneMap?: Record<string, string>
  formatter?: (value: unknown, row: Record<string, unknown>) => string
}

export interface DataTableHeaderAction {
  label: string
  to: string
  icon: string
  tone?: 'primary' | 'secondary' | 'danger'
}

export interface DataTableRowActions {
  editPath?: (row: Record<string, unknown>) => string
  deleteTitle?: string
  deleteMessage?: (row: Record<string, unknown>) => string
  resolveRowLabel?: (row: Record<string, unknown>) => string
  onDelete?: (row: Record<string, unknown>) => Promise<void>
}

export interface MetricCardItem {
  title: string
  value: string
  detail?: string
  icon: string
  tone: string
}

export interface NavigationItem {
  label: string
  to: string
  icon: string
  description: string
}

export interface NavigationGroup {
  id: string
  label: string
  icon: string
  items: NavigationItem[]
}

export interface EndpointReference {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  note: string
}
