<script setup lang="ts">
import ApiEndpointList from '@/components/ApiEndpointList.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import type { DataTableColumn, EndpointReference, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  {
    title: 'Active Contracts',
    value: '14',
    detail: 'Kontrak lease aktif dengan payment berjalan.',
    icon: 'FileClock',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Due This Month',
    value: '4',
    detail: 'Kontrak butuh review renewal atau closeout.',
    icon: 'CalendarClock',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Monthly Spend',
    value: 'Rp182 jt',
    detail: 'Ringkasan biaya lease bulanan untuk quick financial pulse.',
    icon: 'WalletCards',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'contract', label: 'Contract' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'period', label: 'Period' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      ACTIVE: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      REVIEW: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      CLOSED: 'bg-slate-300/70 text-slate-700 ring-slate-300/50 dark:bg-slate-800 dark:text-slate-200',
    },
  },
  { key: 'payment', label: 'Payment' },
]

const rows = [
  { id: 1, contract: 'LS-2026-001', vendor: 'PT Sarana Mobilitas', period: '01 Jul 2026 - 31 Dec 2026', status: 'ACTIVE', payment: 'Rp42 jt' },
  { id: 2, contract: 'LS-2026-002', vendor: 'PT Solusi Office', period: '01 Jan 2026 - 31 Jul 2026', status: 'REVIEW', payment: 'Rp18 jt' },
  { id: 3, contract: 'LS-2026-003', vendor: 'PT Rental Teknologi', period: '01 Mar 2026 - 28 Feb 2027', status: 'ACTIVE', payment: 'Rp56 jt' },
  { id: 4, contract: 'LS-2026-004', vendor: 'PT Logistic Equip', period: '01 Apr 2025 - 31 Mar 2026', status: 'CLOSED', payment: 'Rp23 jt' },
]

const endpoints: EndpointReference[] = [
  { method: 'GET', path: '/api/v1/lease-contracts', note: 'List kontrak lease untuk monitoring status aktif.' },
  { method: 'GET', path: '/api/v1/lease-contracts/{lease_contract_id}', note: 'Header kontrak, item asset, dan payment.' },
  { method: 'POST', path: '/api/v1/lease-contracts', note: 'Membuat kontrak lease baru.' },
  { method: 'GET', path: '/api/v1/lease-contracts/{lease_contract_id}/payments', note: 'Riwayat payment periodik.' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <DataTable
        title="Lease Contracts"
        description="Monitoring kontrak aktif, due date, dan ringkasan payment."
        :rows="rows"
        :columns="columns"
        search-placeholder="Cari kontrak, vendor, atau periode..."
        :search-keys="['contract', 'vendor', 'period']"
      />

      <ApiEndpointList title="Lease API Map" :endpoints="endpoints" />
    </section>
  </div>
</template>
