<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

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

const leaseExposureOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#0ea5e9'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '44%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } },
  },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
}

const leaseExposureSeries = [{ name: 'Spend (jt)', data: [182, 176, 171, 168, 165, 160] }]
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
        :actions="[
          { label: 'Create New', to: '/leases/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/leases/${row.id}/edit`,
          deleteTitle: 'Delete Lease Contract',
          resolveRowLabel: (row) => String(row.contract ?? row.id),
          deleteMessage: (row) => `Kontrak ${String(row.contract ?? row.id)} akan dihapus dari daftar lease. Pastikan dampak ke vendor dan histori payment sudah dicek.`,
        }"
        search-placeholder="Cari kontrak, vendor, atau periode..."
        :search-keys="['contract', 'vendor', 'period']"
      />

      <div class="space-y-6">
        <SectionCard title="Lease Cost Projection" description="Estimasi beban kontrak bulanan untuk semester aktif.">
          <BaseChart type="bar" :height="300" :options="leaseExposureOptions" :series="leaseExposureSeries" />
        </SectionCard>
      </div>
    </section>
  </div>
</template>
