import { createRouter, createWebHistory } from 'vue-router'

import AssetRegistryPage from '@/features/assets/AssetRegistryPage.vue'
import CrudDeletePage from '@/features/crud/CrudDeletePage.vue'
import CrudFormPage from '@/features/crud/CrudFormPage.vue'
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
      path: '/asset-registry/new',
      component: CrudFormPage,
      meta: {
        title: 'Create Asset',
        description: 'Halaman create untuk asset registry.',
        crudKey: 'assets',
        crudMode: 'create',
      },
    },
    {
      path: '/asset-registry/:id/edit',
      component: CrudFormPage,
      meta: {
        title: 'Update Asset',
        description: 'Halaman update untuk asset registry.',
        crudKey: 'assets',
        crudMode: 'edit',
      },
    },
    {
      path: '/asset-registry/:id/delete',
      component: CrudDeletePage,
      meta: {
        title: 'Delete Asset',
        description: 'Konfirmasi delete untuk asset registry.',
        crudKey: 'assets',
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
      path: '/transfers/new',
      component: CrudFormPage,
      meta: {
        title: 'Create Transfer',
        description: 'Halaman create untuk asset transfer.',
        crudKey: 'transfers',
        crudMode: 'create',
      },
    },
    {
      path: '/transfers/:id/edit',
      component: CrudFormPage,
      meta: {
        title: 'Update Transfer',
        description: 'Halaman update untuk asset transfer.',
        crudKey: 'transfers',
        crudMode: 'edit',
      },
    },
    {
      path: '/transfers/:id/delete',
      component: CrudDeletePage,
      meta: {
        title: 'Delete Transfer',
        description: 'Konfirmasi delete untuk transfer.',
        crudKey: 'transfers',
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
      path: '/leases/new',
      component: CrudFormPage,
      meta: {
        title: 'Create Lease',
        description: 'Halaman create untuk lease contract.',
        crudKey: 'leases',
        crudMode: 'create',
      },
    },
    {
      path: '/leases/:id/edit',
      component: CrudFormPage,
      meta: {
        title: 'Update Lease',
        description: 'Halaman update untuk lease contract.',
        crudKey: 'leases',
        crudMode: 'edit',
      },
    },
    {
      path: '/leases/:id/delete',
      component: CrudDeletePage,
      meta: {
        title: 'Delete Lease',
        description: 'Konfirmasi delete untuk lease contract.',
        crudKey: 'leases',
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
      path: '/licenses/new',
      component: CrudFormPage,
      meta: {
        title: 'Create Software License',
        description: 'Halaman create untuk software license.',
        crudKey: 'licenses',
        crudMode: 'create',
      },
    },
    {
      path: '/licenses/:id/edit',
      component: CrudFormPage,
      meta: {
        title: 'Update Software License',
        description: 'Halaman update untuk software license.',
        crudKey: 'licenses',
        crudMode: 'edit',
      },
    },
    {
      path: '/licenses/:id/delete',
      component: CrudDeletePage,
      meta: {
        title: 'Delete Software License',
        description: 'Konfirmasi delete untuk software license.',
        crudKey: 'licenses',
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
      path: '/tracking/new',
      component: CrudFormPage,
      meta: {
        title: 'Create Stocktake Session',
        description: 'Halaman create untuk stocktake session.',
        crudKey: 'tracking',
        crudMode: 'create',
      },
    },
    {
      path: '/tracking/:id/edit',
      component: CrudFormPage,
      meta: {
        title: 'Update Stocktake Session',
        description: 'Halaman update untuk stocktake session.',
        crudKey: 'tracking',
        crudMode: 'edit',
      },
    },
    {
      path: '/tracking/:id/delete',
      component: CrudDeletePage,
      meta: {
        title: 'Delete Stocktake Session',
        description: 'Konfirmasi delete untuk stocktake session.',
        crudKey: 'tracking',
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
      path: '/maintenance/new',
      component: CrudFormPage,
      meta: {
        title: 'Create Maintenance Request',
        description: 'Halaman create untuk maintenance request.',
        crudKey: 'maintenance',
        crudMode: 'create',
      },
    },
    {
      path: '/maintenance/:id/edit',
      component: CrudFormPage,
      meta: {
        title: 'Update Maintenance Request',
        description: 'Halaman update untuk maintenance request.',
        crudKey: 'maintenance',
        crudMode: 'edit',
      },
    },
    {
      path: '/maintenance/:id/delete',
      component: CrudDeletePage,
      meta: {
        title: 'Delete Maintenance Request',
        description: 'Konfirmasi delete untuk maintenance request.',
        crudKey: 'maintenance',
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
    {
      path: '/master-data/new',
      component: CrudFormPage,
      meta: {
        title: 'Create Master Record',
        description: 'Halaman create untuk master data.',
        crudKey: 'masterData',
        crudMode: 'create',
      },
    },
    {
      path: '/master-data/:id/edit',
      component: CrudFormPage,
      meta: {
        title: 'Update Master Record',
        description: 'Halaman update untuk master data.',
        crudKey: 'masterData',
        crudMode: 'edit',
      },
    },
    {
      path: '/master-data/:id/delete',
      component: CrudDeletePage,
      meta: {
        title: 'Delete Master Record',
        description: 'Konfirmasi delete untuk master data.',
        crudKey: 'masterData',
      },
    },
  ],
})

export default router
