<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  {
    title: 'Open Stocktakes',
    value: '3',
    detail: 'Sesi stocktake aktif atau belum disetujui.',
    icon: 'ScanSearch',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Unmatched Scans',
    value: '17',
    detail: 'Scan yang perlu dipetakan ulang atau diverifikasi manual.',
    icon: 'ScanLine',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Coverage',
    value: '92%',
    detail: 'Perbandingan asset terverifikasi terhadap target sesi aktif.',
    icon: 'Radar',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'session', label: 'Session' },
  { key: 'location', label: 'Location' },
  { key: 'window', label: 'Window' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      ACTIVE: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
      PENDING_APPROVAL: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      COMPLETED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
  { key: 'verified', label: 'Verified' },
]

const rows = [
  { id: 1, session: 'STK-HQ-JUL', location: 'HQ Warehouse', window: '27 Jul - 31 Jul 2026', status: 'ACTIVE', verified: '312 / 340' },
  { id: 2, session: 'STK-SITEA-JUL', location: 'Site A', window: '25 Jul - 29 Jul 2026', status: 'PENDING_APPROVAL', verified: '141 / 156' },
  { id: 3, session: 'STK-BRANCHW-JUL', location: 'Branch West', window: '20 Jul - 24 Jul 2026', status: 'COMPLETED', verified: '98 / 98' },
]

const verificationMixOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Verified', 'Pending', 'Unmatched'],
  colors: ['#22c55e', '#f59e0b', '#ef4444'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const verificationMixSeries = [551, 44, 17]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <DataTable
        title="Stocktake Sessions"
        description="Sesi stocktake dengan indikator progres verifikasi."
        :rows="rows"
        :columns="columns"
        :actions="[
          { label: 'Create New', to: '/tracking/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/tracking/${row.id}/edit`,
          deleteTitle: 'Delete Stocktake Session',
          resolveRowLabel: (row) => String(row.session ?? row.id),
          deleteMessage: (row) => `Sesi ${String(row.session ?? row.id)} akan dihapus dari daftar stocktake. Pastikan progress verifikasi sudah tidak diperlukan.`,
        }"
        search-placeholder="Cari session, location, atau status..."
        :search-keys="['session', 'location', 'status']"
      />

      <div class="space-y-6">
        <SectionCard title="Verification Mix" description="Perbandingan progress verifikasi lintas sesi stocktake aktif.">
          <BaseChart type="donut" :height="320" :options="verificationMixOptions" :series="verificationMixSeries" />
        </SectionCard>
      </div>
    </section>
  </div>
</template>
