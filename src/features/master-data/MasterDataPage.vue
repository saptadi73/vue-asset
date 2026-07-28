<script setup lang="ts">
import ApiEndpointList from '@/components/ApiEndpointList.vue'
import CrudActionPanel from '@/components/CrudActionPanel.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, EndpointReference, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  {
    title: 'Categories',
    value: '18',
    detail: 'Master category yang mengendalikan dynamic attributes.',
    icon: 'FolderTree',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Classes',
    value: '42',
    detail: 'Master asset class dan umur manfaat default.',
    icon: 'Layers3',
    tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
  },
  {
    title: 'Locations',
    value: '61',
    detail: 'Master lokasi untuk transfer, assignment, dan stocktake.',
    icon: 'MapPinned',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'type', label: 'Master Type' },
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  {
    key: 'active',
    label: 'Active',
    type: 'badge',
    toneMap: {
      Yes: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      No: 'bg-slate-300/70 text-slate-700 ring-slate-300/50 dark:bg-slate-800 dark:text-slate-200',
    },
  },
]

const rows = [
  { id: 1, type: 'Asset Category', code: 'LAPTOP', name: 'Laptop', active: 'Yes' },
  { id: 2, type: 'Asset Class', code: 'IT-4Y', name: 'IT Equipment - 4 Years', active: 'Yes' },
  { id: 3, type: 'Location', code: 'HQ-WH', name: 'HQ Warehouse', active: 'Yes' },
  { id: 4, type: 'Business Partner', code: 'BP-001', name: 'PT Vendor Mesin', active: 'Yes' },
  { id: 5, type: 'Asset Category', code: 'PRNTER', name: 'Printer', active: 'No' },
]

const endpoints: EndpointReference[] = [
  { method: 'GET', path: '/api/v1/asset-categories', note: 'Master category untuk filter dan form asset.' },
  { method: 'GET', path: '/api/v1/asset-classes', note: 'Master class untuk konfigurasi financial/reference.' },
  { method: 'GET', path: '/api/v1/asset-locations', note: 'Master lokasi untuk navigasi asset dan transfer.' },
  { method: 'GET', path: '/api/v1/business-partners', note: 'Master vendor/supplier untuk ownership dan maintenance.' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <DataTable
        title="Master Data Overview"
        description="Tabel referensi utama yang mendukung seluruh modul transaksi."
        :rows="rows"
        :columns="columns"
        search-placeholder="Cari type, code, atau name..."
        :search-keys="['type', 'code', 'name']"
      />

      <div class="space-y-6">
        <CrudActionPanel
          title="Master Data CRUD"
          description="Kelola category, class, location, atau partner lewat form generik."
          create-to="/master-data/new"
          edit-to="/master-data/seed-master/edit"
          delete-to="/master-data/seed-master/delete"
        />
        <SectionCard title="Why It Matters" description="Master data dibuat tetap ringkas tetapi kuat.">
          <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>Modul master data akan menjadi sumber dropdown, filter, dan validasi untuk feature transactional.</p>
            <p>Pemisahan ini membantu menu tetap pendek dan mudah dipahami walau domain bisnisnya cukup luas.</p>
          </div>
        </SectionCard>

        <ApiEndpointList title="Master Data API Map" :endpoints="endpoints" />
      </div>
    </section>
  </div>
</template>
