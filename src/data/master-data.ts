import type { CrudOption } from '@/types/crud'

export interface MasterRecord {
  id: string
  code: string
  name: string
  isActive: 'Yes' | 'No'
}

export const assetCategoryRecords: MasterRecord[] = [
  { id: '0e3231ad-c585-43eb-b33e-0c2aa24624d1', code: 'CAT-20260727123000', name: 'Rotating Equipment', isActive: 'Yes' },
  { id: '0ef673c3-93d9-495e-93ff-025c55bbb9a1', code: 'CAT-20260727124500', name: 'Rotating Equipment', isActive: 'Yes' },
  { id: '483033e4-cf68-48e5-8108-33929e7b6f90', code: 'CAT-20260727130000', name: 'Rotating Equipment', isActive: 'Yes' },
  { id: 'bdcff26b-c2fd-48e1-a3eb-80446236a990', code: 'CAT-20260727204434', name: 'Category Smoke 20260727204434', isActive: 'Yes' },
]

export const assetClassRecords: MasterRecord[] = [
  { id: '2dfb30b3-de69-45c7-947e-05398e8c689b', code: 'CLS-20260727204434', name: 'Class Smoke 20260727204434', isActive: 'Yes' },
  { id: '9d3f5b1c-7cd4-4514-befc-45e6c9e0129c', code: 'CLS-20260727204519', name: 'Class Smoke 20260727204519', isActive: 'Yes' },
  { id: '63656014-b7f2-4d24-bc8d-68691de9329d', code: 'CLS-20260727204640', name: 'Class Smoke 20260727204640', isActive: 'Yes' },
  { id: '3e9c6d68-72b9-46c8-91a5-be0585cab231', code: 'CLS-20260727204717', name: 'Class Smoke 20260727204717', isActive: 'Yes' },
]

export const locationRecords: MasterRecord[] = [
  { id: 'c75b4cb9-1481-4abe-9fb3-2560ce2ac762', code: 'LOC-A-20260727204434', name: 'Gudang A Smoke 20260727204434', isActive: 'Yes' },
  { id: '237b416b-0232-419b-94d0-823a3e9bb065', code: 'LOC-A-20260727204519', name: 'Gudang A Smoke 20260727204519', isActive: 'Yes' },
  { id: 'e96df69f-1947-4587-ba9a-8e47d0522558', code: 'LOC-A-20260727204640', name: 'Gudang A Smoke 20260727204640', isActive: 'Yes' },
  { id: '3bcf3ee6-5c8b-4a16-b3fd-bc8a8ef63d1e', code: 'LOC-A-20260727204717', name: 'Gudang A Smoke 20260727204717', isActive: 'Yes' },
]

export const vendorRecords: Array<MasterRecord & { kind: 'Vendor' | 'Service Partner'; phone: string }> = [
  { id: 'a9946bb0-9734-4c11-98b0-5a19b1eea3c7', code: 'BP-20260727204434', name: 'Vendor Smoke 20260727204434', isActive: 'Yes', kind: 'Vendor', phone: '021555000' },
  { id: '7fe6fa45-9c1b-4cc0-8eac-ba0eec71c6d8', code: 'BP-20260727204519', name: 'Vendor Smoke 20260727204519', isActive: 'Yes', kind: 'Vendor', phone: '021555000' },
  { id: '0848dc71-cbed-4a83-a730-6f51755aa75b', code: 'BP-20260727204640', name: 'Vendor Smoke 20260727204640', isActive: 'Yes', kind: 'Service Partner', phone: '021555000' },
  { id: '5fab30f4-ee28-4341-a7ee-a30cc9a9063e', code: 'BP-20260727204717', name: 'Vendor Smoke 20260727204717', isActive: 'Yes', kind: 'Vendor', phone: '021555000' },
]

export const leaseContractRecords = [
  { id: 'fb531e31-3fd6-4286-b0cf-af6e2912907b', number: 'LEASE-20260727235601-0C8841', vendorId: 'a9946bb0-9734-4c11-98b0-5a19b1eea3c7', vendorName: 'Vendor Smoke 20260727204434', endDate: '2026-12-31', status: 'ACTIVE' },
  { id: 'dac61deb-ae54-45ac-b4e7-f79614bda872', number: 'LEASE-20260728000240-A61666', vendorId: '7fe6fa45-9c1b-4cc0-8eac-ba0eec71c6d8', vendorName: 'Vendor Smoke 20260727204519', endDate: '2026-12-31', status: 'ACTIVE' },
]

export const maintenanceContractRecords = [
  { id: 'f6047c70-f975-4b61-a65d-2bf889f1988a', number: 'AMC-20260727223012-ED7B80', vendorId: '19bc0e21-2911-4e36-be29-986021b39521', vendorName: 'Vendor Smoke AMC 20260727223012', coverage: 'Full contract coverage', endDate: '2026-12-31' },
  { id: '1c292252-5e29-4a8a-a4d6-906203a17dfb', number: 'AMC-20260727223510-CB758F', vendorId: 'd6af4067-b26c-42b1-b3ef-3e4aa0d80b2e', vendorName: 'Vendor Smoke AMC 20260727223510', coverage: 'Full contract coverage', endDate: '2026-12-31' },
]

export const toCrudOptions = <T extends { id: string; code?: string; name?: string; number?: string }>(
  items: T[],
  labelBuilder?: (item: T) => string,
): CrudOption[] =>
  items.map((item) => ({
    label: labelBuilder ? labelBuilder(item) : `${item.code || item.number || item.id} - ${item.name || ''}`.trim(),
    value: item.id,
  }))
