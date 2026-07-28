<script setup lang="ts">
import ApiEndpointList from '@/components/ApiEndpointList.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, EndpointReference, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  {
    title: 'Registered Assets',
    value: '4,982',
    detail: 'Mencakup asset aktif, under repair, available, dan retired.',
    icon: 'PackageSearch',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Dynamic Attributes',
    value: '126',
    detail: 'Siap menyesuaikan form berdasarkan category dan attribute definitions.',
    icon: 'SlidersHorizontal',
    tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
  },
  {
    title: 'Replacement Review',
    value: '58',
    detail: 'Asset dengan indikasi review lifecycle atau rekomendasi replace.',
    icon: 'RefreshCw',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
]

const assetColumns: DataTableColumn[] = [
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'category', label: 'Category' },
  { key: 'location', label: 'Location' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      ACTIVE: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      MAINTENANCE: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      RETIRED: 'bg-slate-400/20 text-slate-700 ring-slate-300/50 dark:text-slate-200',
    },
  },
]

const assetRows = [
  { id: 1, asset_code: 'AST-0001', asset_name: 'Dell Latitude 7440', category: 'Laptop', location: 'HQ - IT Room', status: 'ACTIVE' },
  { id: 2, asset_code: 'AST-0002', asset_name: 'Toyota Hilux 2.4', category: 'Vehicle', location: 'Site A', status: 'ACTIVE' },
  { id: 3, asset_code: 'AST-0003', asset_name: 'Forklift FL-12', category: 'Heavy Equipment', location: 'Warehouse North', status: 'MAINTENANCE' },
  { id: 4, asset_code: 'AST-0004', asset_name: 'Epson EB-L210SW', category: 'Projector', location: 'Training Room', status: 'ACTIVE' },
  { id: 5, asset_code: 'AST-0005', asset_name: 'CCTV Dome Lobby A', category: 'Security Device', location: 'Main Lobby', status: 'ACTIVE' },
  { id: 6, asset_code: 'AST-0006', asset_name: 'HP LaserJet M507', category: 'Printer', location: 'Finance Office', status: 'MAINTENANCE' },
  { id: 7, asset_code: 'AST-0007', asset_name: 'Motorola Scanner MC33', category: 'Scanner', location: 'Warehouse South', status: 'ACTIVE' },
  { id: 8, asset_code: 'AST-0008', asset_name: 'Cisco Catalyst 9300', category: 'Network Device', location: 'Data Center', status: 'RETIRED' },
]

const endpoints: EndpointReference[] = [
  { method: 'GET', path: '/api/v1/assets', note: 'Endpoint utama untuk list asset dengan search dan pagination.' },
  { method: 'GET', path: '/api/v1/asset-categories', note: 'Filter category dan sumber dynamic attribute flow.' },
  { method: 'GET', path: '/api/v1/asset-classes', note: 'Filter class dan referensi finansial/reference.' },
  { method: 'GET', path: '/api/v1/asset-locations', note: 'Filter lokasi dan pemetaan transfer/assignment.' },
  { method: 'GET', path: '/api/v1/assets/{asset_id}', note: 'Sumber asset detail dan seluruh tab lanjutannya.' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <DataTable
        title="Asset Registry Table"
        description="Tabel baku dengan search dan pagination yang siap dipakai lintas modul."
        :rows="assetRows"
        :columns="assetColumns"
        search-placeholder="Cari asset code, asset name, category, atau location..."
        :search-keys="['asset_code', 'asset_name', 'category', 'location']"
      />

      <div class="space-y-6">
        <SectionCard title="Recommended Workflow" description="Diambil dari dokumen functional blueprint.">
          <ol class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li>1. Pilih category dan muat attribute definitions.</li>
            <li>2. Isi data utama asset dan reference finansial.</li>
            <li>3. Simpan asset utama lalu simpan attribute values.</li>
            <li>4. Lanjutkan command endpoint untuk ownership, assignment, status, dan location history.</li>
          </ol>
        </SectionCard>

        <ApiEndpointList title="Registry API Map" :endpoints="endpoints" />
      </div>
    </section>
  </div>
</template>
