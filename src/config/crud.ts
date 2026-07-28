import type { CrudConfig } from '@/types/crud'
import {
  assetCategoryRecords,
  assetClassRecords,
  leaseContractRecords,
  locationRecords,
  maintenanceContractRecords,
  toCrudOptions,
  vendorRecords,
} from '@/data/master-data'
import { liveSeedIds } from '@/data/liveSeedIds'

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

const assetCategoryOptions = toCrudOptions(assetCategoryRecords, (item) => `${item.code} - ${item.name}`)
const assetClassOptions = toCrudOptions(assetClassRecords, (item) => `${item.code} - ${item.name}`)
const locationOptions = toCrudOptions(locationRecords, (item) => `${item.code} - ${item.name}`)
const vendorOptions = toCrudOptions(vendorRecords, (item) => `${item.code} - ${item.name}`)
const leaseOptions = leaseContractRecords.map((item) => ({ label: `${item.number} - ${item.vendorName}`, value: item.id }))
const maintenanceContractOptions = maintenanceContractRecords.map((item) => ({
  label: `${item.number} - ${item.vendorName}`,
  value: item.id,
}))

export const crudConfigs: Record<string, CrudConfig> = {
  assets: {
    key: 'assets',
    formRole: 'main',
    title: 'Asset Registry',
    entityName: 'Asset',
    basePath: '/asset-registry',
    createTitle: 'Create Asset',
    editTitle: 'Update Asset',
    deleteTitle: 'Delete Asset',
    createDescription: 'Membuat asset baru sesuai alur category, class, location, dan dynamic attributes.',
    editDescription: 'Memperbarui data master asset tanpa mencampur workflow command historis ke satu form besar.',
    deleteDescription: 'Konfirmasi penghapusan asset atau pengarsipan record sebelum aksi destructive dipanggil ke backend.',
    listDescription: 'Pusat data asset dengan quick filters, search, pagination, dan persiapan menuju detail hub per asset.',
    seedId: 'seed-asset',
    endpoints: {
      create: { method: 'POST', path: '/api/v1/assets', note: 'Membuat asset master baru. Endpoint ini juga menerima multipart/form-data bila ada upload foto, manual book, atau dokumen pendukung.' },
      edit: { method: 'PATCH', path: '/api/v1/assets/{asset_id}', note: 'Memperbarui data utama asset. Endpoint ini juga menerima multipart/form-data untuk menambahkan attachment baru.' },
      delete: { method: 'DELETE', path: '/api/v1/assets/{asset_id}', note: 'Placeholder frontend untuk aksi hapus bila backend mendukung soft/hard delete.' },
    },
    resolveCreatePath: () => '/assets',
    resolveEditPath: (id) => `/assets/${id}`,
    resolveDeletePath: (id) => `/assets/${id}`,
    sampleValues: {
      asset_id: liveSeedIds.asset_id,
      asset_code: 'AST-2026-001',
      asset_name: 'Dell Latitude 7440',
      category: '0e3231ad-c585-43eb-b33e-0c2aa24624d1',
      asset_class: '2dfb30b3-de69-45c7-947e-05398e8c689b',
      asset_type: 'FIXED_ASSET',
      location: 'c75b4cb9-1481-4abe-9fb3-2560ce2ac762',
      status: 'IN_SERVICE',
      condition_status: 'GOOD',
      custodian: 'IT Operations',
      vendor_partner: 'a9946bb0-9734-4c11-98b0-5a19b1eea3c7',
      maintenance_contract: 'f6047c70-f975-4b61-a65d-2bf889f1988a',
      lease_contract: 'fb531e31-3fd6-4286-b0cf-af6e2912907b',
      contract_expiry: '2026-12-31',
      last_maintenance: '2026-07-18',
      predictive_warning: 'Battery health trend below threshold',
      purchase_date: '2026-07-10',
      purchase_cost: '25000000',
      replacement_priority: 'medium',
      dynamic_attributes: 'CPU: Intel Core Ultra 7\nRAM: 32 GB\nStorage: 1 TB SSD',
      maintenance_request_id: liveSeedIds.maintenance_request_id,
      asset_transfer_id: liveSeedIds.asset_transfer_id,
      stocktake_id: liveSeedIds.stocktake_id,
      stocktake_session_id: liveSeedIds.stocktake_session_id,
    },
    relatedActions: [
      {
        label: 'Request Maintenance',
        icon: 'Wrench',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/maintenance/new?asset_id=${encodeURIComponent(values.asset_id || liveSeedIds.asset_id)}&asset_code=${encodeURIComponent(values.asset_code || '')}&asset_name=${encodeURIComponent(values.asset_name || '')}&request_date=2026-07-28&notes=${encodeURIComponent(`Follow-up asset ${values.asset_code || values.asset_name || ''}`)}`,
      },
      {
        label: 'Update Maintenance',
        icon: 'PencilRuler',
        tone: 'primary',
        onlyModes: ['edit'],
        resolveTo: ({ values }) =>
          `/maintenance/${values.maintenance_request_id || liveSeedIds.maintenance_request_id}/edit?asset_id=${encodeURIComponent(values.asset_id || liveSeedIds.asset_id)}&asset_code=${encodeURIComponent(values.asset_code || '')}&asset_name=${encodeURIComponent(values.asset_name || '')}`,
      },
      {
        label: 'Create Transfer',
        icon: 'ArrowRightLeft',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/transfers/new?asset_id=${encodeURIComponent(values.asset_id || liveSeedIds.asset_id)}&asset_code=${encodeURIComponent(values.asset_code || '')}&asset_name=${encodeURIComponent(values.asset_name || '')}&from_location=${encodeURIComponent(values.location || '')}&requested_by=${encodeURIComponent(values.custodian || '')}&notes=${encodeURIComponent(`Transfer initiated for ${values.asset_code || values.asset_name || ''}`)}`,
      },
      {
        label: 'Update Transfer',
        icon: 'Route',
        tone: 'secondary',
        onlyModes: ['edit'],
        resolveTo: ({ values }) =>
          `/transfers/${values.asset_transfer_id || values.transfer_id || liveSeedIds.asset_transfer_id}/edit?asset_id=${encodeURIComponent(values.asset_id || liveSeedIds.asset_id)}&asset_code=${encodeURIComponent(values.asset_code || '')}&asset_name=${encodeURIComponent(values.asset_name || '')}&from_location=${encodeURIComponent(values.location || '')}`,
      },
      {
        label: 'Update Lease Contract',
        icon: 'FilePenLine',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          values.lease_contract
            ? `/leases/${values.lease_contract}/edit?vendor_partner=${encodeURIComponent(values.vendor_partner || '')}`
            : `/leases/new?vendor_partner=${encodeURIComponent(values.vendor_partner || '')}&scope_summary=${encodeURIComponent(`Coverage for asset ${values.asset_name || values.asset_code || ''}`)}`,
      },
      {
        label: 'Start Stocktake',
        icon: 'QrCode',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/tracking/new?asset_id=${encodeURIComponent(values.asset_id || liveSeedIds.asset_id)}&asset_code=${encodeURIComponent(values.asset_code || '')}&asset_name=${encodeURIComponent(values.asset_name || '')}&notes=${encodeURIComponent(`Stocktake follow-up for asset ${values.asset_code || values.asset_name || ''}`)}&location=${encodeURIComponent(values.location || '')}`,
      },
      {
        label: 'Update Stocktake',
        icon: 'ScanLine',
        tone: 'secondary',
        onlyModes: ['edit'],
        resolveTo: ({ values }) =>
          `/tracking/${values.stocktake_session_id || values.stocktake_id || liveSeedIds.stocktake_session_id}/edit?asset_id=${encodeURIComponent(values.asset_id || liveSeedIds.asset_id)}&asset_code=${encodeURIComponent(values.asset_code || '')}&asset_name=${encodeURIComponent(values.asset_name || '')}&location=${encodeURIComponent(values.location || '')}`,
      },
    ],
    validate: (values) => {
      const errors: string[] = []
      if (!values.asset_code) errors.push('Asset Code wajib diisi.')
      if (!values.asset_name) errors.push('Asset Name wajib diisi.')
      if (!values.category) errors.push('Category wajib dipilih.')
      if (!values.asset_class) errors.push('Asset Class wajib dipilih.')
      return errors
    },
    mapToPayload: (values) => ({
      asset_code: values.asset_code,
      asset_name: values.asset_name,
      asset_category_id: values.category,
      asset_class_id: values.asset_class,
      asset_type: values.asset_type || 'FIXED_ASSET',
      asset_status: values.status || 'IN_SERVICE',
      condition_status: values.condition_status || 'GOOD',
      current_location_id: values.location || undefined,
      brand: values.brand || undefined,
      model: values.model || undefined,
      serial_number: values.serial_number || undefined,
      barcode: values.barcode || undefined,
      qr_code: values.qr_code || undefined,
      tag_number: values.tag_number || undefined,
      manufacture_year: values.manufacture_year ? Number(values.manufacture_year) : undefined,
      in_service_date: values.purchase_date || undefined,
      replacement_priority: values.replacement_priority || undefined,
    }),
    sections: [
      {
        title: 'Primary Asset Data',
        description: 'Data inti yang wajib ada sebelum asset dipakai oleh modul lain.',
        fields: [
          { key: 'asset_code', label: 'Asset Code', type: 'text', placeholder: 'AST-2026-001', required: true },
          { key: 'asset_name', label: 'Asset Name', type: 'text', placeholder: 'Dell Latitude 7440', required: true },
          { key: 'category', label: 'Category', type: 'select', required: true, options: assetCategoryOptions },
          { key: 'asset_class', label: 'Asset Class', type: 'select', required: true, options: assetClassOptions },
          {
            key: 'asset_type',
            label: 'Asset Type',
            type: 'select',
            required: true,
            options: [
              { label: 'Fixed Asset', value: 'FIXED_ASSET' },
              { label: 'Low Value Asset', value: 'LOW_VALUE_ASSET' },
              { label: 'Leased Asset', value: 'LEASED_ASSET' },
              { label: 'Partner Asset', value: 'PARTNER_ASSET' },
              { label: 'Borrowed Asset', value: 'BORROWED_ASSET' },
              { label: 'Right Of Use Asset', value: 'RIGHT_OF_USE_ASSET' },
              { label: 'Intangible Asset', value: 'INTANGIBLE_ASSET' },
              { label: 'Component', value: 'COMPONENT' },
            ],
          },
          { key: 'serial_number', label: 'Serial Number', type: 'text', placeholder: 'SN-ABC-001' },
        ],
      },
      {
        title: 'Operational Context',
        description: 'Lokasi, status, dan ownership awal asset.',
        fields: [
          { key: 'location', label: 'Current Location', type: 'select', options: locationOptions },
          {
            key: 'status',
            label: 'Asset Status',
            type: 'select',
            options: [
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Registered', value: 'REGISTERED' },
              { label: 'In Stock', value: 'IN_STOCK' },
              { label: 'In Service', value: 'IN_SERVICE' },
              { label: 'Under Maintenance', value: 'UNDER_MAINTENANCE' },
              { label: 'Idle', value: 'IDLE' },
              { label: 'Lost', value: 'LOST' },
              { label: 'Damaged', value: 'DAMAGED' },
              { label: 'Retired', value: 'RETIRED' },
              { label: 'Disposed', value: 'DISPOSED' },
              { label: 'Returned', value: 'RETURNED' },
            ],
          },
          {
            key: 'condition_status',
            label: 'Condition Status',
            type: 'select',
            required: true,
            options: [
              { label: 'New', value: 'NEW' },
              { label: 'Good', value: 'GOOD' },
              { label: 'Fair', value: 'FAIR' },
              { label: 'Poor', value: 'POOR' },
              { label: 'Critical', value: 'CRITICAL' },
              { label: 'Unserviceable', value: 'UNSERVICEABLE' },
            ],
          },
          { key: 'custodian', label: 'Custodian / PIC', type: 'text', placeholder: 'IT Operations' },
          { key: 'purchase_date', label: 'In Service Date', type: 'date' },
        ],
      },
      {
        title: 'Vendor and Coverage',
        description: 'Relasi asset ke vendor, contract, dan sinyal maintenance.',
        fields: [
          { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Lenovo' },
          { key: 'model', label: 'Model', type: 'text', placeholder: 'ThinkPad X1' },
          { key: 'manufacture_year', label: 'Manufacture Year', type: 'number', placeholder: '2026' },
          { key: 'vendor_partner', label: 'Vendor / Service Partner', type: 'select', options: vendorOptions, helper: 'Ambil dari master business partner agar relasi data konsisten.' },
          { key: 'lease_contract', label: 'Lease Contract', type: 'select', options: leaseOptions },
          { key: 'maintenance_contract', label: 'Maintenance Contract', type: 'select', options: maintenanceContractOptions },
          { key: 'contract_expiry', label: 'Contract Expiry', type: 'date' },
          { key: 'last_maintenance', label: 'Last Maintenance', type: 'date', helper: 'Terakhir sinkron dari histori maintenance asset.' },
          { key: 'predictive_warning', label: 'Predictive Warning', type: 'text', fullWidth: true, placeholder: 'Battery health trend below threshold' },
        ],
      },
      {
        title: 'Financial and Attribute Notes',
        description: 'Ringkasan referensi dan dynamic attributes awal.',
        fields: [
          { key: 'barcode', label: 'Barcode', type: 'text', placeholder: '899900001' },
          { key: 'qr_code', label: 'QR Code', type: 'text', placeholder: 'QR-AST-IT-0001' },
          { key: 'tag_number', label: 'Tag Number', type: 'text', placeholder: 'TAG-0001' },
          { key: 'replacement_priority', label: 'Replacement Priority', type: 'select', options: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }] },
          { key: 'dynamic_attributes', label: 'Dynamic Attributes', type: 'textarea', fullWidth: true, placeholder: 'CPU: Intel Core Ultra 7, RAM: 32 GB, SSD: 1 TB' },
        ],
      },
      {
        title: 'Asset Attachments',
        description: 'Upload manual book, foto asset, dan dokumen pendukung lain langsung dari form create atau update asset registry.',
        fields: [
          {
            key: 'asset_photos',
            label: 'Asset Photos',
            type: 'file',
            multiple: true,
            accept: 'image/*',
            helper: 'File akan dikirim sebagai `photo_files` dan foto pertama akan menjadi primary photo bila asset belum memilikinya.',
          },
          {
            key: 'manual_book_files',
            label: 'Manual Books',
            type: 'file',
            multiple: true,
            accept: '.pdf,.doc,.docx,.txt,image/*',
            helper: 'File akan dikirim sebagai `manual_book_files` untuk manual book atau panduan asset.',
          },
          {
            key: 'supporting_document_files',
            label: 'Supporting Documents',
            type: 'file',
            multiple: true,
            accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,image/*',
            helper: 'Gunakan untuk foto tambahan, sertifikat, invoice, warranty, atau lampiran umum lain.',
            fullWidth: true,
          },
        ],
      },
    ],
  },
  transfers: {
    key: 'transfers',
    formRole: 'sub',
    requiredParentContextKeys: ['asset_id', 'asset_name'],
    parentContext: [
      { queryKey: 'asset_transfer_id', label: 'Transfer ID' },
      { queryKey: 'asset_id', label: 'Parent Asset ID' },
      { queryKey: 'asset_code', label: 'Parent Asset Code' },
      { queryKey: 'asset_name', label: 'Parent Asset' },
      { queryKey: 'from_location', label: 'Origin Location' },
    ],
    title: 'Asset Transfers',
    entityName: 'Transfer',
    basePath: '/transfers',
    createTitle: 'Create Transfer',
    editTitle: 'Update Transfer',
    deleteTitle: 'Delete Transfer',
    createDescription: 'Membuat draft transfer baru sebelum submit dan approval flow dijalankan.',
    editDescription: 'Menyesuaikan draft transfer, tujuan, dan alasan perpindahan sebelum disubmit.',
    deleteDescription: 'Menghapus draft transfer yang belum dijalankan atau tidak lagi valid.',
    listDescription: 'Queue perpindahan asset dari draft hingga complete, dengan status yang mudah dimonitor di mobile maupun desktop.',
    seedId: 'seed-transfer',
    endpoints: {
      create: { method: 'POST', path: '/api/v1/asset-transfers', note: 'Membuat transfer draft baru.' },
      edit: { method: 'PATCH', path: '/api/v1/asset-transfers/{asset_transfer_id}', note: 'Update data transfer sebelum submit.' },
      delete: { method: 'DELETE', path: '/api/v1/asset-transfers/{asset_transfer_id}', note: 'Placeholder frontend untuk membatalkan draft transfer.' },
    },
    resolveCreatePath: () => '/asset-transfers',
    resolveEditPath: (id) => `/asset-transfers/${id}`,
    resolveDeletePath: (id) => `/asset-transfers/${id}`,
    sampleValues: {
      transfer_number: 'TRF-2026-071',
      transfer_date: '2026-07-28',
      movement_purpose: 'Operational allocation',
      from_location: 'hq-wh',
      to_location: 'site-a',
      requested_by: 'Warehouse Lead',
      notes: 'Pastikan asset diterima oleh PIC lokasi tujuan.',
    },
    validate: (values) => {
      const errors: string[] = []
      if (!values.transfer_date) errors.push('Transfer Date wajib diisi.')
      if (!values.from_location) errors.push('From Location wajib dipilih.')
      if (!values.to_location) errors.push('To Location wajib dipilih.')
      if (values.from_location && values.to_location && values.from_location === values.to_location) {
        errors.push('From Location dan To Location tidak boleh sama.')
      }
      return errors
    },
    mapToPayload: (values) => ({
      transfer_number: values.transfer_number || undefined,
      transfer_date: values.transfer_date,
      asset_id: values.asset_id || undefined,
      movement_purpose: values.movement_purpose || undefined,
      from_location_id: values.from_location,
      to_location_id: values.to_location,
      requested_by: values.requested_by || undefined,
      notes: values.notes || undefined,
    }),
    workflowActions: [
      {
        key: 'submit',
        label: 'Move to Submitted',
        description: 'Ajukan draft transfer ke tahap submitted.',
        icon: 'Send',
        tone: 'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
        method: 'POST',
        resolvePath: (id) => `/asset-transfers/${id}/submit`,
        noteFieldLabel: 'Submission Note',
        noteFieldPlaceholder: 'Tambahkan catatan saat transfer diajukan.',
        nextState: 'SUBMITTED',
      },
      {
        key: 'approve',
        label: 'Move to Approved',
        description: 'Setujui transfer agar dapat dilanjutkan ke penerimaan.',
        icon: 'BadgeCheck',
        tone: 'border-violet-200 bg-violet-50/70 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200',
        method: 'POST',
        resolvePath: (id) => `/asset-transfers/${id}/approve`,
        noteFieldLabel: 'Approval Note',
        noteFieldPlaceholder: 'Tambahkan catatan approval jika diperlukan.',
        nextState: 'APPROVED',
      },
      {
        key: 'complete',
        label: 'Move to Completed',
        description: 'Selesaikan transfer setelah asset diterima dan dicek.',
        icon: 'PackageCheck',
        tone: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
        method: 'POST',
        resolvePath: (id) => `/asset-transfers/${id}/complete`,
        noteFieldLabel: 'Completion Note',
        noteFieldPlaceholder: 'Catatan penerimaan atau kondisi akhir asset.',
        nextState: 'COMPLETED',
      },
    ],
    sections: [
      {
        title: 'Transfer Header',
        description: 'Identitas perpindahan asset.',
        fields: [
          { key: 'transfer_number', label: 'Transfer Number', type: 'text', placeholder: 'TRF-2026-077' },
          { key: 'transfer_date', label: 'Transfer Date', type: 'date', required: true },
          { key: 'movement_purpose', label: 'Movement Purpose', type: 'text', placeholder: 'Operational allocation' },
        ],
      },
      {
        title: 'Route and Approval',
        description: 'Lokasi asal, tujuan, dan requester transfer.',
        fields: [
          { key: 'from_location', label: 'From Location', type: 'select', required: true, options: [{ label: 'HQ Warehouse', value: 'hq-wh' }, { label: 'Main Office', value: 'main-office' }] },
          { key: 'to_location', label: 'To Location', type: 'select', required: true, options: [{ label: 'Site A', value: 'site-a' }, { label: 'Branch West', value: 'branch-west' }] },
          { key: 'requested_by', label: 'Requested By', type: 'text', placeholder: 'Warehouse Lead' },
          { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true, placeholder: 'Tambahkan catatan handling atau kondisi asset selama transfer.' },
        ],
      },
    ],
  },
  leases: {
    key: 'leases',
    formRole: 'main',
    title: 'Leases',
    entityName: 'Lease Contract',
    basePath: '/leases',
    createTitle: 'Create Lease Contract',
    editTitle: 'Update Lease Contract',
    deleteTitle: 'Delete Lease Contract',
    createDescription: 'Membuat kontrak lease baru beserta ringkasan vendor, periode, dan payment cycle.',
    editDescription: 'Memperbarui masa kontrak, vendor, atau detail commercial.',
    deleteDescription: 'Konfirmasi penghapusan kontrak lease yang belum aktif atau perlu dibatalkan.',
    listDescription: 'Monitoring kontrak lease, vendor aktif, payment cycle, dan due review secara ringkas.',
    seedId: 'seed-lease',
    endpoints: {
      create: { method: 'POST', path: '/api/v1/lease-contracts', note: 'Membuat kontrak lease baru.' },
      edit: { method: 'PATCH', path: '/api/v1/lease-contracts/{lease_contract_id}', note: 'Placeholder update kontrak lease.' },
      delete: { method: 'DELETE', path: '/api/v1/lease-contracts/{lease_contract_id}', note: 'Placeholder frontend untuk aksi hapus / cancel contract.' },
    },
    resolveCreatePath: () => '/lease-contracts',
    resolveEditPath: (id) => `/lease-contracts/${id}`,
    resolveDeletePath: (id) => `/lease-contracts/${id}`,
    sampleValues: {
      contract_number: 'LS-2026-005',
      vendor_partner: 'partner-dell',
      contract_type: 'DEVICE_LEASE',
      status: 'ACTIVE',
      start_date: '2026-07-01',
      end_date: '2026-12-31',
      monthly_payment: '42000000',
      payment_cycle: 'MONTHLY',
      next_due_date: '2026-08-05',
      owner_team: 'IT Operations',
      renewal_review_date: '2026-11-15',
      scope_summary: 'Kontrak lease untuk laptop project team.',
      notes: 'Sertakan addendum, SLA vendor, dan rencana renewal bila diperlukan.',
      maintenance_request_id: liveSeedIds.maintenance_request_id,
      asset_transfer_id: liveSeedIds.asset_transfer_id,
    },
    relatedActions: [
      {
        label: 'Update Lease',
        icon: 'PencilLine',
        tone: 'primary',
        onlyModes: ['edit'],
        resolveTo: ({ itemId }) => `/leases/${itemId}/edit`,
      },
      {
        label: 'Request Maintenance',
        icon: 'Wrench',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/maintenance/new?lease_contract_id=${encodeURIComponent(values.contract_number || '')}&lease_contract_number=${encodeURIComponent(values.contract_number || '')}&notes=${encodeURIComponent(`Maintenance follow-up for lease ${values.contract_number || ''}`)}&asset_name=${encodeURIComponent(values.scope_summary || values.contract_number || '')}`,
      },
      {
        label: 'Update Maintenance',
        icon: 'PencilRuler',
        tone: 'secondary',
        onlyModes: ['edit'],
        resolveTo: ({ values }) =>
          `/maintenance/${values.maintenance_request_id || liveSeedIds.maintenance_request_id}/edit?lease_contract_id=${encodeURIComponent(values.contract_number || '')}&lease_contract_number=${encodeURIComponent(values.contract_number || '')}&asset_name=${encodeURIComponent(values.scope_summary || values.contract_number || '')}`,
      },
      {
        label: 'Create Transfer',
        icon: 'ArrowRightLeft',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/transfers/new?notes=${encodeURIComponent(`Transfer coordination for lease ${values.contract_number || ''}`)}`,
      },
      {
        label: 'Update Transfer',
        icon: 'Route',
        tone: 'secondary',
        onlyModes: ['edit'],
        resolveTo: ({ values }) =>
          `/transfers/${values.asset_transfer_id || values.transfer_id || liveSeedIds.asset_transfer_id}/edit?notes=${encodeURIComponent(`Transfer coordination for lease ${values.contract_number || ''}`)}`,
      },
      {
        label: 'Register Asset',
        icon: 'Boxes',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/asset-registry/new?vendor_partner=${encodeURIComponent(values.vendor_partner || '')}&predictive_warning=${encodeURIComponent(`Asset registered under lease ${values.contract_number || ''}`)}`,
      },
    ],
    validate: (values) => {
      const errors: string[] = []
      if (!values.contract_number) errors.push('Contract Number wajib diisi.')
      if (!values.vendor_partner) errors.push('Vendor wajib dipilih.')
      if (!values.start_date || !values.end_date) errors.push('Periode kontrak wajib lengkap.')
      if (values.start_date && values.end_date && values.end_date < values.start_date) {
        errors.push('End Date tidak boleh lebih awal dari Start Date.')
      }
      return errors
    },
    mapToPayload: (values) => ({
      contract_number: values.contract_number,
      vendor_partner_id: values.vendor_partner,
      contract_type: values.contract_type || undefined,
      status: values.status || undefined,
      start_date: values.start_date || undefined,
      end_date: values.end_date || undefined,
      monthly_payment: values.monthly_payment ? Number(values.monthly_payment) : undefined,
      payment_cycle: values.payment_cycle || undefined,
      next_due_date: values.next_due_date || undefined,
      renewal_review_date: values.renewal_review_date || undefined,
      notes: values.notes || undefined,
      scope_summary: values.scope_summary || undefined,
      owner_team: values.owner_team || undefined,
    }),
    sections: [
      {
        title: 'Contract Identity',
        description: 'Informasi utama kontrak lease.',
        fields: [
          { key: 'contract_number', label: 'Contract Number', type: 'text', placeholder: 'LS-2026-005' },
          { key: 'vendor_partner', label: 'Vendor Partner', type: 'select', options: vendorOptions, required: true },
          {
            key: 'contract_type',
            label: 'Contract Type',
            type: 'select',
            options: [
              { label: 'Device Lease', value: 'DEVICE_LEASE' },
              { label: 'Vehicle Lease', value: 'VEHICLE_LEASE' },
              { label: 'Equipment Rental', value: 'EQUIPMENT_RENTAL' },
            ],
          },
          { key: 'status', label: 'Status', type: 'select', options: [{ label: 'ACTIVE', value: 'ACTIVE' }, { label: 'REVIEW', value: 'REVIEW' }, { label: 'CLOSED', value: 'CLOSED' }] },
        ],
      },
      {
        title: 'Period and Payment',
        description: 'Periode aktif dan komitmen biaya.',
        fields: [
          { key: 'start_date', label: 'Start Date', type: 'date' },
          { key: 'end_date', label: 'End Date', type: 'date' },
          { key: 'monthly_payment', label: 'Monthly Payment', type: 'number', placeholder: '42000000' },
          {
            key: 'payment_cycle',
            label: 'Payment Cycle',
            type: 'select',
            options: [
              { label: 'Monthly', value: 'MONTHLY' },
              { label: 'Quarterly', value: 'QUARTERLY' },
              { label: 'Semi Annual', value: 'SEMI_ANNUAL' },
            ],
          },
          { key: 'next_due_date', label: 'Next Due Date', type: 'date' },
          { key: 'renewal_review_date', label: 'Renewal Review Date', type: 'date' },
          { key: 'owner_team', label: 'Owner Team', type: 'text', placeholder: 'IT Operations' },
        ],
      },
      {
        title: 'Scope and Notes',
        description: 'Ringkasan cakupan kontrak dan catatan komersial.',
        fields: [
          { key: 'scope_summary', label: 'Scope Summary', type: 'textarea', fullWidth: true, placeholder: 'Kontrak untuk laptop project team dan perangkat pendukung.' },
          { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true, placeholder: 'Sertakan cakupan aset atau syarat penting kontrak.' },
        ],
      },
    ],
  },
  licenses: {
    key: 'licenses',
    formRole: 'main',
    title: 'Software Licenses',
    entityName: 'Software License',
    basePath: '/licenses',
    createTitle: 'Create Software License',
    editTitle: 'Update Software License',
    deleteTitle: 'Delete Software License',
    createDescription: 'Mencatat lisensi software baru beserta product, seat, dan expiry.',
    editDescription: 'Menyesuaikan seat allocation, renewal, dan detail komersial lisensi.',
    deleteDescription: 'Menghapus atau menonaktifkan lisensi yang tidak lagi digunakan.',
    listDescription: 'Seat license, expiry monitoring, dan peluang optimasi lisensi software untuk tim operasional.',
    seedId: 'seed-license',
    endpoints: {
      create: { method: 'POST', path: '/api/v1/software-licenses', note: 'Membuat lisensi software baru.' },
      edit: { method: 'PATCH', path: '/api/v1/software-licenses/{software_license_id}', note: 'Placeholder update lisensi software.' },
      delete: { method: 'DELETE', path: '/api/v1/software-licenses/{software_license_id}', note: 'Placeholder frontend untuk aksi hapus lisensi.' },
    },
    resolveCreatePath: () => '/software-licenses',
    resolveEditPath: (id) => `/software-licenses/${id}`,
    resolveDeletePath: (id) => `/software-licenses/${id}`,
    sampleValues: {
      product_name: 'Microsoft 365 E3',
      license_key: 'M365-E3-09A2',
      vendor_partner: 'partner-dell',
      license_type: 'SUBSCRIPTION',
      status: 'ACTIVE',
      seat_capacity: '220',
      used_seats: '188',
      expires_at: '2026-12-31',
      renewal_review_date: '2026-11-01',
      owner_team: 'IT Infrastructure',
      assignment_policy: 'NAMED_AND_ASSET',
      notes: 'Renewal window Q4 2026',
      maintenance_request_id: liveSeedIds.maintenance_request_id,
      stocktake_id: liveSeedIds.stocktake_id,
      stocktake_session_id: liveSeedIds.stocktake_session_id,
    },
    relatedActions: [
      {
        label: 'Update License',
        icon: 'PencilLine',
        tone: 'primary',
        onlyModes: ['edit'],
        resolveTo: ({ itemId }) => `/licenses/${itemId}/edit`,
      },
      {
        label: 'Update Asset Relation',
        icon: 'MonitorCog',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/asset-registry/new?predictive_warning=${encodeURIComponent(`Software relation for ${values.product_name || ''}`)}`,
      },
      {
        label: 'Request Maintenance',
        icon: 'Wrench',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/maintenance/new?license_id=${encodeURIComponent(values.license_key || '')}&license_name=${encodeURIComponent(values.product_name || '')}&notes=${encodeURIComponent(`License issue follow-up for ${values.product_name || ''}`)}`,
      },
      {
        label: 'Update Maintenance',
        icon: 'PencilRuler',
        tone: 'secondary',
        onlyModes: ['edit'],
        resolveTo: ({ values }) =>
          `/maintenance/${values.maintenance_request_id || liveSeedIds.maintenance_request_id}/edit?license_id=${encodeURIComponent(values.license_id || values.license_key || '')}&license_name=${encodeURIComponent(values.product_name || '')}`,
      },
      {
        label: 'Start Stocktake',
        icon: 'QrCode',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/tracking/new?license_id=${encodeURIComponent(values.license_key || '')}&license_name=${encodeURIComponent(values.product_name || '')}&notes=${encodeURIComponent(`License/device audit for ${values.product_name || ''}`)}`,
      },
      {
        label: 'Update Stocktake',
        icon: 'ScanLine',
        tone: 'secondary',
        onlyModes: ['edit'],
        resolveTo: ({ values }) =>
          `/tracking/${values.stocktake_session_id || values.stocktake_id || liveSeedIds.stocktake_session_id}/edit?license_id=${encodeURIComponent(values.license_id || values.license_key || '')}&license_name=${encodeURIComponent(values.product_name || '')}`,
      },
    ],
    validate: (values) => {
      const errors: string[] = []
      const seatCapacity = Number(values.seat_capacity || '0')
      const usedSeats = Number(values.used_seats || '0')
      if (!values.product_name) errors.push('Product Name wajib diisi.')
      if (!values.vendor_partner) errors.push('Vendor wajib dipilih.')
      if (seatCapacity > 0 && usedSeats > seatCapacity) errors.push('Used Seats tidak boleh melebihi Seat Capacity.')
      return errors
    },
    mapToPayload: (values) => ({
      product_name: values.product_name,
      license_key: values.license_key || undefined,
      vendor_partner_id: values.vendor_partner || undefined,
      license_type: values.license_type || undefined,
      status: values.status || undefined,
      seat_capacity: values.seat_capacity ? Number(values.seat_capacity) : undefined,
      used_seats: values.used_seats ? Number(values.used_seats) : undefined,
      expires_at: values.expires_at || undefined,
      renewal_review_date: values.renewal_review_date || undefined,
      owner_team: values.owner_team || undefined,
      assignment_policy: values.assignment_policy || undefined,
      notes: values.notes || undefined,
    }),
    sections: [
      {
        title: 'License Identity',
        description: 'Produk software dan identitas lisensi.',
        fields: [
          { key: 'product_name', label: 'Product Name', type: 'text', placeholder: 'Microsoft 365 E3' },
          { key: 'license_key', label: 'License Key', type: 'text', placeholder: 'M365-E3-09A2' },
          { key: 'vendor_partner', label: 'Vendor Partner', type: 'select', options: vendorOptions, required: true },
          {
            key: 'license_type',
            label: 'License Type',
            type: 'select',
            options: [
              { label: 'Subscription', value: 'SUBSCRIPTION' },
              { label: 'Annual Term', value: 'ANNUAL_TERM' },
              { label: 'Perpetual', value: 'PERPETUAL' },
            ],
          },
          { key: 'status', label: 'Status', type: 'select', options: [{ label: 'ACTIVE', value: 'ACTIVE' }, { label: 'WARNING', value: 'WARNING' }, { label: 'EXPIRED', value: 'EXPIRED' }] },
        ],
      },
      {
        title: 'Seat and Renewal',
        description: 'Seat capacity dan batas waktu lisensi.',
        fields: [
          { key: 'seat_capacity', label: 'Seat Capacity', type: 'number', placeholder: '220' },
          { key: 'used_seats', label: 'Used Seats', type: 'number', placeholder: '188' },
          { key: 'expires_at', label: 'Expires At', type: 'date' },
          { key: 'renewal_review_date', label: 'Renewal Review Date', type: 'date' },
          { key: 'owner_team', label: 'Owner Team', type: 'text', placeholder: 'IT Infrastructure' },
          {
            key: 'assignment_policy',
            label: 'Assignment Policy',
            type: 'select',
            options: [
              { label: 'Named + Asset', value: 'NAMED_AND_ASSET' },
              { label: 'Named User Only', value: 'NAMED_ONLY' },
              { label: 'Shared Pool', value: 'SHARED_POOL' },
            ],
          },
          { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true, placeholder: 'Tambahkan vendor, PO renewal, atau ketentuan assignment.' },
        ],
      },
    ],
  },
  tracking: {
    key: 'tracking',
    formRole: 'sub',
    requiredParentContextKeys: ['location'],
    parentContext: [
      { queryKey: 'stocktake_session_id', label: 'Stocktake Session ID' },
      { queryKey: 'stocktake_id', label: 'Stocktake ID Alias' },
      { queryKey: 'asset_id', label: 'Linked Asset ID' },
      { queryKey: 'asset_code', label: 'Linked Asset Code' },
      { queryKey: 'asset_name', label: 'Linked Asset' },
      { queryKey: 'location', label: 'Scope Location' },
      { queryKey: 'license_id', label: 'Linked License ID' },
      { queryKey: 'license_name', label: 'Linked License' },
    ],
    title: 'Tracking & Stocktake',
    entityName: 'Stocktake Session',
    basePath: '/tracking',
    createTitle: 'Create Stocktake Session',
    editTitle: 'Update Stocktake Session',
    deleteTitle: 'Delete Stocktake Session',
    createDescription: 'Menyiapkan sesi stocktake baru untuk lokasi atau unit tertentu.',
    editDescription: 'Memperbarui window stocktake, target coverage, dan approver.',
    deleteDescription: 'Menghapus sesi stocktake yang belum berjalan atau salah dibuat.',
    listDescription: 'Pelacakan scan, verifikasi lokasi, dan sesi stocktake yang mengacu pada endpoint tracking dan stocktake backend.',
    seedId: 'seed-stocktake',
    endpoints: {
      create: { method: 'POST', path: '/api/v1/stocktakes', note: 'Membuat sesi stocktake baru.' },
      edit: { method: 'PATCH', path: '/api/v1/stocktakes/{stocktake_id}', note: 'Placeholder update sesi stocktake.' },
      delete: { method: 'DELETE', path: '/api/v1/stocktakes/{stocktake_id}', note: 'Placeholder frontend untuk menghapus sesi stocktake.' },
    },
    resolveCreatePath: () => '/stocktakes',
    resolveEditPath: (id) => `/stocktakes/${id}`,
    resolveDeletePath: (id) => `/stocktakes/${id}`,
    sampleValues: {
      session_name: 'STK-HQ-AUG',
      start_date: '2026-08-01',
      end_date: '2026-08-05',
      location: 'loc-hq-wh',
      approver: 'Finance Controller',
      notes: 'Target coverage minimal 95 persen.',
    },
    validate: (values) => {
      const errors: string[] = []
      if (!values.session_name) errors.push('Session Name wajib diisi.')
      if (!values.location) errors.push('Location wajib dipilih.')
      if (values.start_date && values.end_date && values.end_date < values.start_date) {
        errors.push('End Date tidak boleh lebih awal dari Start Date.')
      }
      return errors
    },
    mapToPayload: (values) => ({
      session_number: values.session_name,
      asset_id: values.asset_id || undefined,
      license_id: values.license_id || undefined,
      location_id: values.location,
      scope_type: 'LOCATION',
      planned_start_at: values.start_date ? `${values.start_date}T00:00:00Z` : undefined,
      planned_end_at: values.end_date ? `${values.end_date}T23:59:59Z` : undefined,
      notes: values.notes || undefined,
      approver_name: values.approver || undefined,
    }),
    workflowActions: [
      {
        key: 'start',
        label: 'Move to In Progress',
        description: 'Mulai sesi stocktake dan bentuk snapshot expected asset dari lokasi target.',
        icon: 'Play',
        tone: 'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
        method: 'POST',
        resolvePath: (id) => `/stocktakes/${id}/start`,
        noteFieldLabel: 'Start Note',
        noteFieldPlaceholder: 'Tambahkan catatan saat sesi stocktake dimulai.',
        nextState: 'IN_PROGRESS',
      },
      {
        key: 'complete',
        label: 'Move to Completed',
        description: 'Tutup sesi stocktake dan bentuk hasil missing untuk item yang belum ditemukan.',
        icon: 'ClipboardCheck',
        tone: 'border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
        method: 'POST',
        resolvePath: (id) => `/stocktakes/${id}/complete`,
        noteFieldLabel: 'Completion Note',
        noteFieldPlaceholder: 'Tambahkan ringkasan hasil stocktake sebelum ditutup.',
        nextState: 'COMPLETED',
      },
      {
        key: 'approve',
        label: 'Move to Approved',
        description: 'Setujui hasil stocktake agar discrepancy bisa ditindaklanjuti secara formal.',
        icon: 'BadgeCheck',
        tone: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
        method: 'POST',
        resolvePath: (id) => `/stocktakes/${id}/approve`,
        noteFieldLabel: 'Approval Note',
        noteFieldPlaceholder: 'Tambahkan catatan approval jika diperlukan.',
        nextState: 'APPROVED',
      },
    ],
    sections: [
      {
        title: 'Session Setup',
        description: 'Penamaan sesi dan jadwal pelaksanaan.',
        fields: [
          { key: 'session_name', label: 'Session Name', type: 'text', placeholder: 'STK-HQ-AUG' },
          { key: 'start_date', label: 'Start Date', type: 'date' },
          { key: 'end_date', label: 'End Date', type: 'date' },
        ],
      },
      {
        title: 'Coverage and Approval',
        description: 'Lokasi target dan approval flow.',
        fields: [
          { key: 'location', label: 'Location', type: 'select', required: true, options: locationOptions },
          { key: 'approver', label: 'Approver', type: 'text', placeholder: 'Finance Controller' },
          { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Cantumkan target coverage dan aturan pengecualian.' },
        ],
      },
    ],
  },
  maintenance: {
    key: 'maintenance',
    formRole: 'sub',
    requiredParentContextKeys: ['asset_name'],
    parentContext: [
      { queryKey: 'asset_id', label: 'Parent Asset ID' },
      { queryKey: 'asset_code', label: 'Parent Asset Code' },
      { queryKey: 'asset_name', label: 'Parent Asset' },
      { queryKey: 'lease_contract_id', label: 'Linked Lease ID' },
      { queryKey: 'lease_contract_number', label: 'Linked Lease' },
      { queryKey: 'license_id', label: 'Linked License ID' },
      { queryKey: 'license_name', label: 'Linked License' },
    ],
    title: 'Maintenance',
    entityName: 'Maintenance Request',
    basePath: '/maintenance',
    createTitle: 'Create Maintenance Request',
    editTitle: 'Update Maintenance Request',
    deleteTitle: 'Delete Maintenance Request',
    createDescription: 'Membuat request maintenance baru dengan prioritas, asset target, dan gejala kerusakan.',
    editDescription: 'Memperbarui request maintenance sebelum atau sesudah assignment awal.',
    deleteDescription: 'Menghapus request yang duplikat atau tidak valid sebelum masuk work order.',
    listDescription: 'Request, work order, backlog, SLA, dan trend reliability disusun dalam section yang terpisah dan mudah dikembangkan.',
    seedId: 'seed-maintenance',
    endpoints: {
      create: { method: 'POST', path: '/api/v1/maintenance/requests', note: 'Membuat maintenance request baru.' },
      edit: { method: 'PATCH', path: '/api/v1/maintenance/requests/{maintenance_request_id}', note: 'Placeholder update maintenance request.' },
      delete: { method: 'DELETE', path: '/api/v1/maintenance/requests/{maintenance_request_id}', note: 'Placeholder frontend untuk menghapus maintenance request.' },
    },
    resolveCreatePath: () => '/maintenance/requests',
    resolveEditPath: (id) => `/maintenance/requests/${id}`,
    resolveDeletePath: (id) => `/maintenance/requests/${id}`,
    sampleValues: {
      request_number: 'MR-2026-126',
      asset_name: 'Forklift FL-12',
      priority: 'HIGH',
      request_date: '2026-07-28',
      symptom: 'Mesin berhenti saat beban di atas 60% dan muncul bunyi abnormal.',
      team: 'Mechanical Team A',
      requires_vendor: 'yes',
    },
    validate: (values) => {
      const errors: string[] = []
      if (!values.asset_name) errors.push('Asset Name wajib diisi.')
      if (!values.priority) errors.push('Priority wajib dipilih.')
      if (!values.symptom) errors.push('Symptom wajib dijelaskan.')
      return errors
    },
    mapToPayload: (values) => ({
      request_number: values.request_number || undefined,
      asset_id: values.asset_id || values.asset_name,
      lease_contract_id: values.lease_contract_id || undefined,
      software_license_id: values.license_id || undefined,
      priority_code: values.priority,
      request_date: values.request_date || undefined,
      symptom_description: values.symptom,
      maintenance_team_id: values.team || undefined,
      requires_vendor: values.requires_vendor === 'yes',
    }),
    sections: [
      {
        title: 'Request Identity',
        description: 'Data utama tiket maintenance.',
        fields: [
          { key: 'request_number', label: 'Request Number', type: 'text', placeholder: 'MR-2026-126' },
          { key: 'asset_name', label: 'Asset Name', type: 'text', placeholder: 'Forklift FL-12' },
          { key: 'priority', label: 'Priority', type: 'select', options: [{ label: 'HIGH', value: 'HIGH' }, { label: 'MEDIUM', value: 'MEDIUM' }, { label: 'LOW', value: 'LOW' }] },
          { key: 'request_date', label: 'Request Date', type: 'date' },
        ],
      },
      {
        title: 'Symptoms and Routing',
        description: 'Deskripsi gejala, tim, dan approver awal.',
        fields: [
          { key: 'symptom', label: 'Symptom', type: 'textarea', required: true, fullWidth: true, placeholder: 'Mesin berhenti saat beban di atas 60% dan muncul bunyi abnormal.' },
          { key: 'team', label: 'Assigned Team', type: 'text', placeholder: 'Mechanical Team A' },
          { key: 'requires_vendor', label: 'Requires Vendor', type: 'select', options: yesNoOptions },
        ],
      },
    ],
  },
  masterData: {
    key: 'masterData',
    formRole: 'main',
    title: 'Master Data',
    entityName: 'Master Record',
    basePath: '/master-data',
    createTitle: 'Create Master Record',
    editTitle: 'Update Master Record',
    deleteTitle: 'Delete Master Record',
    createDescription: 'Membuat reference data baru seperti category, class, location, atau business partner.',
    editDescription: 'Memperbarui code, nama, dan status aktif reference data.',
    deleteDescription: 'Menghapus reference data yang belum dipakai atau perlu dinonaktifkan.',
    listDescription: 'Sumber referensi category, class, location, dan partner yang akan digunakan lintas modul transaksi.',
    seedId: 'seed-master',
    endpoints: {
      create: { method: 'POST', path: '/api/v1/asset-categories | /api/v1/asset-classes | /api/v1/asset-locations', note: 'Endpoint create menyesuaikan jenis reference data.' },
      edit: { method: 'PATCH', path: '/api/v1/{master-entity}/{id}', note: 'Placeholder update reference data.' },
      delete: { method: 'DELETE', path: '/api/v1/{master-entity}/{id}', note: 'Placeholder frontend untuk delete/disable reference data.' },
    },
    resolveCreatePath: (values) => {
      switch (values.master_type) {
        case 'asset-category':
          return '/asset-categories'
        case 'asset-class':
          return '/asset-classes'
        case 'location':
          return '/asset-locations'
        case 'business-partner':
          return '/business-partners'
        default:
          return '/asset-categories'
      }
    },
    resolveEditPath: (id, values) => {
      switch (values.master_type) {
        case 'asset-category':
          return `/asset-categories/${id}`
        case 'asset-class':
          return `/asset-classes/${id}`
        case 'location':
          return `/asset-locations/${id}`
        case 'business-partner':
          return `/business-partners/${id}`
        default:
          return `/asset-categories/${id}`
      }
    },
    resolveDeletePath: (id, values) => {
      switch (values?.master_type) {
        case 'asset-class':
          return `/asset-classes/${id}`
        case 'location':
          return `/asset-locations/${id}`
        case 'business-partner':
          return `/business-partners/${id}`
        case 'asset-category':
        default:
          return `/asset-categories/${id}`
      }
    },
    sections: [
      {
        title: 'Reference Identity',
        description: 'Tentukan tipe master data dan identitas record.',
        fields: [
          { key: 'master_type', label: 'Master Type', type: 'select', options: [{ label: 'Asset Category', value: 'asset-category' }, { label: 'Asset Class', value: 'asset-class' }, { label: 'Location', value: 'location' }, { label: 'Business Partner', value: 'business-partner' }] },
          { key: 'code', label: 'Code', type: 'text', placeholder: 'LAPTOP' },
          { key: 'name', label: 'Name', type: 'text', placeholder: 'Laptop' },
          { key: 'is_active', label: 'Is Active', type: 'select', options: yesNoOptions },
        ],
      },
      {
        title: 'Description',
        description: 'Catatan tambahan untuk membantu admin memahami tujuan record.',
        fields: [
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Digunakan untuk category perangkat laptop korporat.' },
        ],
      },
    ],
    sampleValues: {
      master_type: 'asset-category',
      code: 'LAPTOP',
      name: 'Laptop',
      is_active: 'yes',
      description: 'Digunakan untuk category perangkat laptop korporat.',
    },
    relatedActions: [
      {
        label: 'Create Asset',
        icon: 'Boxes',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: () => '/asset-registry/new',
      },
      {
        label: 'Create Maintenance Request',
        icon: 'Wrench',
        tone: 'secondary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/maintenance/new?notes=${encodeURIComponent(`Follow-up from master data ${values.code || values.name || ''}`)}`,
      },
      {
        label: 'Create Lease',
        icon: 'FilePenLine',
        tone: 'primary',
        onlyModes: ['create', 'edit'],
        resolveTo: ({ values }) =>
          `/leases/new?scope_summary=${encodeURIComponent(`Contract reference from master ${values.code || values.name || ''}`)}`,
      },
    ],
    validate: (values) => {
      const errors: string[] = []
      if (!values.master_type) errors.push('Master Type wajib dipilih.')
      if (!values.code) errors.push('Code wajib diisi.')
      if (!values.name) errors.push('Name wajib diisi.')
      return errors
    },
    mapToPayload: (values) => {
      if (values.master_type === 'asset-category') {
        return {
          category_code: values.code,
          category_name: values.name,
          description: values.description || undefined,
          is_active: values.is_active === 'yes',
        }
      }

      if (values.master_type === 'asset-class') {
        return {
          class_code: values.code,
          class_name: values.name,
          is_active: values.is_active === 'yes',
        }
      }

      if (values.master_type === 'location') {
        return {
          location_code: values.code,
          location_name: values.name,
          description: values.description || undefined,
          is_active: values.is_active === 'yes',
        }
      }

      return {
        partner_code: values.code,
        partner_name: values.name,
        address: values.description || undefined,
        is_active: values.is_active === 'yes',
      }
    },
  },
}

export const getCrudConfig = (key: string) => crudConfigs[key]
