<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  { title: 'Unverified Assets', value: '41', detail: 'Aset yang belum diverifikasi pada window audit aktif.', icon: 'ShieldAlert', tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200' },
  { title: 'Discrepancies', value: '13', detail: 'Mismatch lokasi yang masih butuh investigasi.', icon: 'MapPinned', tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200' },
  { title: 'Missing Assets', value: '5', detail: 'Item yang tidak muncul pada sesi stocktake yang selesai.', icon: 'SearchX', tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200' },
  { title: 'Active Sessions', value: '7', detail: 'Stocktake aktif dan pending approval pada lokasi operasional.', icon: 'QrCode', tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200' },
]

const agingOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['> 30 Days', '> 60 Days', '> 90 Days'],
  colors: ['#38bdf8', '#f59e0b', '#ef4444'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const agingSeries = [41, 18, 7]

const discrepancyRows = [
  { id: 1, asset: 'Toyota Hilux 2.4', expected: 'Site A', observed: 'HQ Yard', resolution: 'UNRESOLVED' },
  { id: 2, asset: 'Dell Latitude 7440', expected: 'HQ - IT Room', observed: 'Finance Office', resolution: 'REVIEW' },
  { id: 3, asset: 'Motorola Scanner MC33', expected: 'Warehouse South', observed: 'Warehouse North', resolution: 'UNRESOLVED' },
]

const missingRows = [
  { id: 1, asset: 'AST-0009 / iPad Demo', session: 'STK-BRANCHWEST-JUL', location: 'Branch West', result: 'MISSING', resolution: 'UNRESOLVED' },
  { id: 2, asset: 'AST-0023 / Switch Spare', session: 'STK-DATACENTER-JUL', location: 'Data Center', result: 'MISSING', resolution: 'REVIEW' },
  { id: 3, asset: 'AST-0114 / CCTV Portable', session: 'STK-SITEA-JUL', location: 'Site A', result: 'MISSING', resolution: 'UNRESOLVED' },
]

const discrepancyColumns: DataTableColumn[] = [
  { key: 'asset', label: 'Asset' },
  { key: 'expected', label: 'Expected' },
  { key: 'observed', label: 'Observed' },
  { key: 'resolution', label: 'Resolution' },
]

const missingColumns: DataTableColumn[] = [
  { key: 'asset', label: 'Asset' },
  { key: 'session', label: 'Stocktake Session' },
  { key: 'location', label: 'Location' },
  { key: 'result', label: 'Result' },
  { key: 'resolution', label: 'Resolution' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <DataTable
        title="Location Discrepancy Table"
        description="Mismatch lokasi yang paling perlu follow-up dari tim tracking dan asset control."
        :rows="discrepancyRows"
        :columns="discrepancyColumns"
        search-placeholder="Cari asset atau lokasi..."
        :search-keys="['asset', 'expected', 'observed', 'resolution']"
        :page-size="3"
      />

      <SectionCard title="Verification Aging" description="Bucket aging untuk membantu prioritas scan dan recount.">
        <BaseChart type="donut" :height="300" :options="agingOptions" :series="agingSeries" />
      </SectionCard>
    </section>

    <DataTable
      title="Missing Asset Table"
      description="Item missing yang muncul dari sesi stocktake dan perlu penelusuran lebih lanjut."
      :rows="missingRows"
      :columns="missingColumns"
      search-placeholder="Cari asset, session, atau location..."
      :search-keys="['asset', 'session', 'location', 'result', 'resolution']"
      :page-size="3"
    />
  </div>
</template>
