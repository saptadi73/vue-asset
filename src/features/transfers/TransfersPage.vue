<script setup lang="ts">
import ApiEndpointList from '@/components/ApiEndpointList.vue'
import CrudActionPanel from '@/components/CrudActionPanel.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import type { DataTableColumn, EndpointReference, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  {
    title: 'Transfer in Progress',
    value: '26',
    detail: 'Transfer dengan status draft, submitted, atau approved.',
    icon: 'ArrowRightLeft',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Pending Approval',
    value: '9',
    detail: 'Perlu persetujuan agar asset bisa diterima dan diselesaikan.',
    icon: 'Stamp',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Completed Today',
    value: '12',
    detail: 'Transfer selesai dan sudah tercatat pada histori lokasi.',
    icon: 'BadgeCheck',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'number', label: 'Transfer No.' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'purpose', label: 'Purpose' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      DRAFT: 'bg-slate-300/70 text-slate-700 ring-slate-300/50 dark:bg-slate-800 dark:text-slate-200',
      SUBMITTED: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
      APPROVED: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
      COMPLETED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
]

const rows = [
  { id: 1, number: 'TRF-2026-071', from: 'HQ Warehouse', to: 'Site A', purpose: 'Operational allocation', status: 'SUBMITTED' },
  { id: 2, number: 'TRF-2026-072', from: 'Main Office', to: 'Training Center', purpose: 'Room refresh', status: 'APPROVED' },
  { id: 3, number: 'TRF-2026-073', from: 'Site B', to: 'Service Center', purpose: 'Repair routing', status: 'DRAFT' },
  { id: 4, number: 'TRF-2026-074', from: 'HQ Warehouse', to: 'Branch West', purpose: 'New opening', status: 'COMPLETED' },
  { id: 5, number: 'TRF-2026-075', from: 'Branch North', to: 'HQ Warehouse', purpose: 'Asset return', status: 'SUBMITTED' },
  { id: 6, number: 'TRF-2026-076', from: 'Branch East', to: 'Site C', purpose: 'Short term relocation', status: 'APPROVED' },
]

const endpoints: EndpointReference[] = [
  { method: 'GET', path: '/api/v1/asset-transfers', note: 'List utama transfer dan status monitoring.' },
  { method: 'GET', path: '/api/v1/asset-transfers/{asset_transfer_id}', note: 'Detail transfer, item asset, dan histori approval sederhana.' },
  { method: 'POST', path: '/api/v1/asset-transfers/{asset_transfer_id}/submit', note: 'Trigger perubahan status dari draft ke submitted.' },
  { method: 'POST', path: '/api/v1/asset-transfers/{asset_transfer_id}/approve', note: 'Approval transfer sebelum completion.' },
  { method: 'POST', path: '/api/v1/asset-transfers/{asset_transfer_id}/complete', note: 'Menyelesaikan transfer dan update histori lokasi.' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <DataTable
        title="Transfer Queue"
        description="Monitoring perpindahan asset dari draft sampai complete."
        :rows="rows"
        :columns="columns"
        search-placeholder="Cari nomor transfer, lokasi, atau purpose..."
        :search-keys="['number', 'from', 'to', 'purpose']"
      />

      <div class="space-y-6">
        <CrudActionPanel
          title="Transfer CRUD"
          description="Kelola draft transfer dengan halaman aksi yang terpisah."
          create-to="/transfers/new"
          edit-to="/transfers/seed-transfer/edit"
          delete-to="/transfers/seed-transfer/delete"
        />
        <ApiEndpointList title="Transfer API Map" :endpoints="endpoints" />
      </div>
    </section>
  </div>
</template>
