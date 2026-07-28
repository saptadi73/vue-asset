<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  {
    title: 'Unverified Assets',
    value: '41',
    detail: 'Daftar asset yang belum diverifikasi oleh stocktake atau audit.',
    icon: 'ShieldAlert',
    tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
  },
  {
    title: 'Reliability Reports',
    value: '12',
    detail: 'Rangkuman reliability dan failure analysis per periode.',
    icon: 'ChartLine',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Cost Views',
    value: '7',
    detail: 'Laporan cost maintenance dan replacement planning.',
    icon: 'BadgeDollarSign',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'location', label: 'Location' },
  { key: 'last_verified', label: 'Last Verified' },
  {
    key: 'risk',
    label: 'Risk',
    type: 'badge',
    toneMap: {
      HIGH: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      MEDIUM: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      LOW: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
]

const rows = [
  { id: 1, asset_code: 'AST-0108', asset_name: 'Forklift FL-12', location: 'Warehouse North', last_verified: '11 Jun 2026', risk: 'HIGH' },
  { id: 2, asset_code: 'AST-0219', asset_name: 'Projector PX-77', location: 'Meeting Room 5', last_verified: '23 Jun 2026', risk: 'MEDIUM' },
  { id: 3, asset_code: 'AST-0342', asset_name: 'Scanner WH-09', location: 'Warehouse South', last_verified: '18 Jun 2026', risk: 'HIGH' },
  { id: 4, asset_code: 'AST-0491', asset_name: 'iPad Retail Demo', location: 'Branch West', last_verified: '27 Jul 2026', risk: 'LOW' },
]

const riskMixOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['High Risk', 'Medium Risk', 'Low Risk'],
  colors: ['#ef4444', '#f59e0b', '#22c55e'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const riskMixSeries = [18, 15, 8]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <DataTable
        title="Unverified Assets Report"
        description="Daftar asset berisiko yang belum diverifikasi."
        :rows="rows"
        :columns="columns"
        search-placeholder="Cari asset code, name, atau location..."
        :search-keys="['asset_code', 'asset_name', 'location']"
      />

      <div class="space-y-6">
        <SectionCard title="Report Intent" description="Pengelompokan report berdasarkan dokumen backend.">
          <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>Report difokuskan pada exception dan keputusan operasional, bukan hanya daftar statis.</p>
            <p>Modul ini cocok untuk ekspor, filter lanjutan, dan drilldown ke halaman transaksi asli.</p>
          </div>
        </SectionCard>

        <SectionCard title="Risk Composition" description="Pemetaan cepat intensitas risiko dari laporan exception aktif.">
          <BaseChart type="donut" :height="320" :options="riskMixOptions" :series="riskMixSeries" />
        </SectionCard>
      </div>
    </section>
  </div>
</template>
