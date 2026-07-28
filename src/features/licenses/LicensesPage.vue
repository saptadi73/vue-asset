<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import { getCrudConfig } from '@/config/crud'
import { deleteCrudRecord } from '@/services/crud'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const crudConfig = getCrudConfig('licenses')!

const metrics: MetricCardItem[] = [
  {
    title: 'Active Licenses',
    value: '37',
    detail: 'Lisensi aktif dengan seat usage yang masih dipantau.',
    icon: 'KeyRound',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Expiring Soon',
    value: '6',
    detail: 'Perlu pembaruan sebelum expiry date mendekat.',
    icon: 'AlarmClock',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Unused Seats',
    value: '49',
    detail: 'Peluang optimasi lisensi dan redistribusi assignment.',
    icon: 'UsersRound',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'product', label: 'Product' },
  { key: 'license_key', label: 'License Key' },
  { key: 'seats', label: 'Seat Usage' },
  { key: 'expires_at', label: 'Expires At' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      ACTIVE: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      WARNING: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      EXPIRED: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
    },
  },
]

const rows = [
  { id: 1, product: 'Microsoft 365 E3', license_key: 'M365-E3-09A2', seats: '188 / 220', expires_at: '31 Dec 2026', status: 'ACTIVE' },
  { id: 2, product: 'Adobe Creative Cloud', license_key: 'ADBE-CR-8842', seats: '24 / 30', expires_at: '18 Aug 2026', status: 'WARNING' },
  { id: 3, product: 'AutoCAD LT', license_key: 'ACLT-55R7', seats: '14 / 15', expires_at: '21 Jul 2026', status: 'EXPIRED' },
  { id: 4, product: 'Zoom Workplace', license_key: 'ZOOM-BIZ-2201', seats: '72 / 110', expires_at: '03 Nov 2026', status: 'ACTIVE' },
]

const licenseSeatOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Used Seats', 'Available Seats', 'Expired Allocation'],
  colors: ['#0ea5e9', '#22c55e', '#f97316'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const licenseSeatSeries = [298, 86, 14]

const handleDeleteLicense = async (row: Record<string, unknown>) => {
  await deleteCrudRecord(crudConfig, String(row.id))
}
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <DataTable
        title="Software Licenses"
        description="Daftar lisensi software beserta seat usage dan expiry monitoring."
        :rows="rows"
        :columns="columns"
        :actions="[
          { label: 'Create New', to: '/licenses/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/licenses/${row.id}/edit`,
          deleteTitle: 'Delete License',
          resolveRowLabel: (row) => String(row.license_key ?? row.product ?? row.id),
          deleteMessage: (row) => `Lisensi ${String(row.product ?? row.license_key ?? row.id)} akan dihapus dari daftar. Pastikan seat dan histori renewal tidak lagi dibutuhkan.`,
          onDelete: handleDeleteLicense,
        }"
        search-placeholder="Cari product, license key, atau status..."
        :search-keys="['product', 'license_key', 'status']"
      />

      <div class="space-y-6">
        <SectionCard title="Seat Allocation Mix" description="Kapasitas lisensi dipetakan untuk membantu redistribusi seat.">
          <BaseChart type="donut" :height="320" :options="licenseSeatOptions" :series="licenseSeatSeries" />
        </SectionCard>
      </div>
    </section>
  </div>
</template>
