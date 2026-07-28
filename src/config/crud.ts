import type { CrudConfig } from '@/types/crud'

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
]

export const crudConfigs: Record<string, CrudConfig> = {
  assets: {
    key: 'assets',
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
      create: { method: 'POST', path: '/api/v1/assets', note: 'Membuat asset master baru.' },
      edit: { method: 'PATCH', path: '/api/v1/assets/{asset_id}', note: 'Memperbarui data utama asset.' },
      delete: { method: 'DELETE', path: '/api/v1/assets/{asset_id}', note: 'Placeholder frontend untuk aksi hapus bila backend mendukung soft/hard delete.' },
    },
    resolveCreatePath: () => '/assets',
    resolveEditPath: (id) => `/assets/${id}`,
    resolveDeletePath: (id) => `/assets/${id}`,
    sections: [
      {
        title: 'Primary Asset Data',
        description: 'Data inti yang wajib ada sebelum asset dipakai oleh modul lain.',
        fields: [
          { key: 'asset_code', label: 'Asset Code', type: 'text', placeholder: 'AST-2026-001' },
          { key: 'asset_name', label: 'Asset Name', type: 'text', placeholder: 'Dell Latitude 7440' },
          { key: 'category', label: 'Category', type: 'select', options: [{ label: 'Laptop', value: 'laptop' }, { label: 'Vehicle', value: 'vehicle' }, { label: 'Printer', value: 'printer' }] },
          { key: 'asset_class', label: 'Asset Class', type: 'select', options: [{ label: 'IT-4Y', value: 'it-4y' }, { label: 'VEH-8Y', value: 'veh-8y' }, { label: 'OFF-5Y', value: 'off-5y' }] },
        ],
      },
      {
        title: 'Operational Context',
        description: 'Lokasi, status, dan ownership awal asset.',
        fields: [
          { key: 'location', label: 'Current Location', type: 'select', options: [{ label: 'HQ Warehouse', value: 'hq-wh' }, { label: 'Site A', value: 'site-a' }, { label: 'Finance Office', value: 'finance-office' }] },
          { key: 'status', label: 'Status', type: 'select', options: [{ label: 'ACTIVE', value: 'ACTIVE' }, { label: 'MAINTENANCE', value: 'MAINTENANCE' }, { label: 'RETIRED', value: 'RETIRED' }] },
          { key: 'custodian', label: 'Custodian / PIC', type: 'text', placeholder: 'IT Operations' },
          { key: 'purchase_date', label: 'Purchase Date', type: 'date' },
        ],
      },
      {
        title: 'Financial and Attribute Notes',
        description: 'Ringkasan referensi dan dynamic attributes awal.',
        fields: [
          { key: 'purchase_cost', label: 'Purchase Cost', type: 'number', placeholder: '25000000' },
          { key: 'replacement_priority', label: 'Replacement Priority', type: 'select', options: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }] },
          { key: 'dynamic_attributes', label: 'Dynamic Attributes', type: 'textarea', placeholder: 'CPU: Intel Core Ultra 7, RAM: 32 GB, SSD: 1 TB' },
        ],
      },
    ],
  },
  transfers: {
    key: 'transfers',
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
    sections: [
      {
        title: 'Transfer Header',
        description: 'Identitas perpindahan asset.',
        fields: [
          { key: 'transfer_number', label: 'Transfer Number', type: 'text', placeholder: 'TRF-2026-077' },
          { key: 'transfer_date', label: 'Transfer Date', type: 'date' },
          { key: 'movement_purpose', label: 'Movement Purpose', type: 'text', placeholder: 'Operational allocation' },
        ],
      },
      {
        title: 'Route and Approval',
        description: 'Lokasi asal, tujuan, dan requester transfer.',
        fields: [
          { key: 'from_location', label: 'From Location', type: 'select', options: [{ label: 'HQ Warehouse', value: 'hq-wh' }, { label: 'Main Office', value: 'main-office' }] },
          { key: 'to_location', label: 'To Location', type: 'select', options: [{ label: 'Site A', value: 'site-a' }, { label: 'Branch West', value: 'branch-west' }] },
          { key: 'requested_by', label: 'Requested By', type: 'text', placeholder: 'Warehouse Lead' },
          { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Tambahkan catatan handling atau kondisi asset selama transfer.' },
        ],
      },
    ],
  },
  leases: {
    key: 'leases',
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
    sections: [
      {
        title: 'Contract Identity',
        description: 'Informasi utama kontrak lease.',
        fields: [
          { key: 'contract_number', label: 'Contract Number', type: 'text', placeholder: 'LS-2026-005' },
          { key: 'vendor_name', label: 'Vendor Name', type: 'text', placeholder: 'PT Rental Teknologi' },
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
          { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Sertakan cakupan aset atau syarat penting kontrak.' },
        ],
      },
    ],
  },
  licenses: {
    key: 'licenses',
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
    sections: [
      {
        title: 'License Identity',
        description: 'Produk software dan identitas lisensi.',
        fields: [
          { key: 'product_name', label: 'Product Name', type: 'text', placeholder: 'Microsoft 365 E3' },
          { key: 'license_key', label: 'License Key', type: 'text', placeholder: 'M365-E3-09A2' },
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
          { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Tambahkan vendor, PO renewal, atau ketentuan assignment.' },
        ],
      },
    ],
  },
  tracking: {
    key: 'tracking',
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
          { key: 'location', label: 'Location', type: 'select', options: [{ label: 'HQ Warehouse', value: 'hq-wh' }, { label: 'Site A', value: 'site-a' }, { label: 'Branch West', value: 'branch-west' }] },
          { key: 'approver', label: 'Approver', type: 'text', placeholder: 'Finance Controller' },
          { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Cantumkan target coverage dan aturan pengecualian.' },
        ],
      },
    ],
  },
  maintenance: {
    key: 'maintenance',
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
          { key: 'symptom', label: 'Symptom', type: 'textarea', placeholder: 'Mesin berhenti saat beban di atas 60% dan muncul bunyi abnormal.' },
          { key: 'team', label: 'Assigned Team', type: 'text', placeholder: 'Mechanical Team A' },
          { key: 'requires_vendor', label: 'Requires Vendor', type: 'select', options: yesNoOptions },
        ],
      },
    ],
  },
  masterData: {
    key: 'masterData',
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
  },
}

export const getCrudConfig = (key: string) => crudConfigs[key]
