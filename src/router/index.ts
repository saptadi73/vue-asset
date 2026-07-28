import { createRouter, createWebHistory } from 'vue-router'

import AssetRegistryPage from '@/features/assets/AssetRegistryPage.vue'
import DashboardPage from '@/features/dashboard/DashboardPage.vue'
import LeasesPage from '@/features/leases/LeasesPage.vue'
import LicensesPage from '@/features/licenses/LicensesPage.vue'
import MaintenancePage from '@/features/maintenance/MaintenancePage.vue'
import MasterDataPage from '@/features/master-data/MasterDataPage.vue'
import ReportsPage from '@/features/reports/ReportsPage.vue'
import TrackingPage from '@/features/tracking/TrackingPage.vue'
import TransfersPage from '@/features/transfers/TransfersPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      component: DashboardPage,
      meta: {
        title: 'Dashboard',
        description: 'Landing page operasional untuk KPI, backlog, transfer, maintenance, dan item yang perlu perhatian.',
      },
    },
    {
      path: '/asset-registry',
      component: AssetRegistryPage,
      meta: {
        title: 'Asset Registry',
        description: 'Pusat data asset dengan quick filters, search, pagination, dan persiapan menuju detail hub per asset.',
      },
    },
    {
      path: '/transfers',
      component: TransfersPage,
      meta: {
        title: 'Asset Transfers',
        description: 'Queue perpindahan asset dari draft hingga complete, dengan status yang mudah dimonitor di mobile maupun desktop.',
      },
    },
    {
      path: '/leases',
      component: LeasesPage,
      meta: {
        title: 'Leases',
        description: 'Monitoring kontrak lease, vendor aktif, payment cycle, dan due review secara ringkas.',
      },
    },
    {
      path: '/licenses',
      component: LicensesPage,
      meta: {
        title: 'Software Licenses',
        description: 'Seat license, expiry monitoring, dan peluang optimasi lisensi software untuk tim operasional.',
      },
    },
    {
      path: '/tracking',
      component: TrackingPage,
      meta: {
        title: 'Tracking & Stocktake',
        description: 'Pelacakan scan, verifikasi lokasi, dan sesi stocktake yang mengacu pada endpoint tracking dan stocktake backend.',
      },
    },
    {
      path: '/maintenance',
      component: MaintenancePage,
      meta: {
        title: 'Maintenance',
        description: 'Request, work order, backlog, SLA, dan trend reliability disusun dalam section yang terpisah dan mudah dikembangkan.',
      },
    },
    {
      path: '/reports',
      component: ReportsPage,
      meta: {
        title: 'Reports',
        description: 'Halaman report exception dan insight yang diarahkan untuk kebutuhan keputusan cepat, bukan sekadar tabel statis.',
      },
    },
    {
      path: '/master-data',
      component: MasterDataPage,
      meta: {
        title: 'Master Data',
        description: 'Sumber referensi category, class, location, dan partner yang akan digunakan lintas modul transaksi.',
      },
    },
  ],
})

export default router
