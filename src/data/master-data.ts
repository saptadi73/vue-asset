import type { CrudOption } from '@/types/crud'

export interface MasterRecord {
  id: string
  code: string
  name: string
  isActive: 'Yes' | 'No'
}

export const assetCategoryRecords: MasterRecord[] = [
  { id: 'cat-laptop', code: 'LAPTOP', name: 'Laptop', isActive: 'Yes' },
  { id: 'cat-vehicle', code: 'VEHICLE', name: 'Vehicle', isActive: 'Yes' },
  { id: 'cat-printer', code: 'PRINTER', name: 'Printer', isActive: 'Yes' },
  { id: 'cat-network', code: 'NETWORK', name: 'Network Device', isActive: 'Yes' },
]

export const assetClassRecords: MasterRecord[] = [
  { id: 'class-it-4y', code: 'IT-4Y', name: 'IT Equipment - 4 Years', isActive: 'Yes' },
  { id: 'class-veh-8y', code: 'VEH-8Y', name: 'Vehicle - 8 Years', isActive: 'Yes' },
  { id: 'class-off-5y', code: 'OFF-5Y', name: 'Office Equipment - 5 Years', isActive: 'Yes' },
  { id: 'class-net-6y', code: 'NET-6Y', name: 'Network Infrastructure - 6 Years', isActive: 'Yes' },
]

export const locationRecords: MasterRecord[] = [
  { id: 'loc-hq-wh', code: 'HQ-WH', name: 'HQ Warehouse', isActive: 'Yes' },
  { id: 'loc-site-a', code: 'SITE-A', name: 'Site A', isActive: 'Yes' },
  { id: 'loc-finance', code: 'FIN', name: 'Finance Office', isActive: 'Yes' },
  { id: 'loc-dc', code: 'DC-01', name: 'Data Center', isActive: 'Yes' },
]

export const vendorRecords: Array<MasterRecord & { kind: 'Vendor' | 'Service Partner'; phone: string }> = [
  { id: 'partner-dell', code: 'VND-001', name: 'PT Dell Indonesia', isActive: 'Yes', kind: 'Vendor', phone: '+62-21-555-0101' },
  { id: 'partner-toyota', code: 'VND-002', name: 'PT Astra Mobility', isActive: 'Yes', kind: 'Vendor', phone: '+62-21-555-0114' },
  { id: 'partner-mekar', code: 'VND-003', name: 'PT Mekar Service Solusi', isActive: 'Yes', kind: 'Service Partner', phone: '+62-21-555-0199' },
  { id: 'partner-cisco', code: 'VND-004', name: 'PT Infra Network Nusantara', isActive: 'Yes', kind: 'Vendor', phone: '+62-21-555-0155' },
]

export const leaseContractRecords = [
  { id: 'lease-001', number: 'LS-2026-001', vendorId: 'partner-dell', vendorName: 'PT Dell Indonesia', endDate: '2026-12-31', status: 'ACTIVE' },
  { id: 'lease-002', number: 'LS-2026-002', vendorId: 'partner-toyota', vendorName: 'PT Astra Mobility', endDate: '2026-08-14', status: 'REVIEW' },
]

export const maintenanceContractRecords = [
  { id: 'mc-001', number: 'MC-2026-014', vendorId: 'partner-mekar', vendorName: 'PT Mekar Service Solusi', coverage: 'On-call corrective', endDate: '2026-08-09' },
  { id: 'mc-002', number: 'MC-2026-021', vendorId: 'partner-cisco', vendorName: 'PT Infra Network Nusantara', coverage: 'Preventive quarterly', endDate: '2027-03-31' },
]

export const toCrudOptions = <T extends { id: string; code?: string; name?: string; number?: string }>(
  items: T[],
  labelBuilder?: (item: T) => string,
): CrudOption[] =>
  items.map((item) => ({
    label: labelBuilder ? labelBuilder(item) : `${item.code || item.number || item.id} - ${item.name || ''}`.trim(),
    value: item.id,
  }))
