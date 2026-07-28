import type { NavigationGroup } from '@/types/app'

export const navigationGroups: NavigationGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'LayoutDashboard',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: 'LayoutDashboard',
        description: 'Ringkasan KPI, antrian kerja, dan status operasional.',
      },
      {
        label: 'Reports',
        to: '/reports',
        icon: 'ChartColumn',
        description: 'Report exception, verifikasi, dan insight bisnis.',
      },
    ],
  },
  {
    id: 'registry',
    label: 'Asset Operations',
    icon: 'Boxes',
    items: [
      {
        label: 'Asset Registry',
        to: '/asset-registry',
        icon: 'Boxes',
        description: 'Pusat data asset lengkap dengan search dan pagination.',
      },
      {
        label: 'Asset Transfers',
        to: '/transfers',
        icon: 'ArrowRightLeft',
        description: 'Monitoring perpindahan asset antar lokasi atau unit.',
      },
      {
        label: 'Tracking & Stocktake',
        to: '/tracking',
        icon: 'ScanSearch',
        description: 'Pelacakan scan, stocktake, dan verifikasi lapangan.',
      },
    ],
  },
  {
    id: 'commercial',
    label: 'Commercial',
    icon: 'FileClock',
    items: [
      {
        label: 'Leases',
        to: '/leases',
        icon: 'FileClock',
        description: 'Kontrak lease aktif, due date, dan payment cycle.',
      },
      {
        label: 'Software Licenses',
        to: '/licenses',
        icon: 'KeyRound',
        description: 'Seat license, expiry, dan utilisasi software.',
      },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: 'Wrench',
    items: [
      {
        label: 'Maintenance',
        to: '/maintenance',
        icon: 'Wrench',
        description: 'Request, work order, backlog, dan reliability trend.',
      },
    ],
  },
  {
    id: 'master',
    label: 'Administration',
    icon: 'Database',
    items: [
      {
        label: 'Master Data',
        to: '/master-data',
        icon: 'Database',
        description: 'Category, class, location, vendor, dan reference data.',
      },
    ],
  },
]
