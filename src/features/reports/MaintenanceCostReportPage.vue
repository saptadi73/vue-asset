<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  { title: 'Total Actual Cost', value: 'Rp428 jt', detail: 'Akumulasi labor, part, dan vendor pada periode aktif.', icon: 'BadgeDollarSign', tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200' },
  { title: 'Part Cost', value: 'Rp163 jt', detail: 'Komponen dan spare parts yang sudah dikonsumsi work order.', icon: 'Package', tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200' },
  { title: 'Labor Cost', value: 'Rp124 jt', detail: 'Biaya teknisi internal dan tenaga kerja support.', icon: 'Users', tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200' },
  { title: 'Vendor Cost', value: 'Rp141 jt', detail: 'Biaya pihak ketiga untuk field service dan specialist work.', icon: 'BriefcaseBusiness', tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200' },
]

const costRows = [
  { id: 1, work_order: 'WO-2026-044', asset: 'Forklift FL-12', maintenance_type: 'CORRECTIVE', parts: 'Rp38.000.000', labor: 'Rp12.000.000', vendor: 'Rp26.000.000', total: 'Rp76.000.000' },
  { id: 2, work_order: 'WO-2026-049', asset: 'Toyota Hilux 2.4', maintenance_type: 'PREVENTIVE', parts: 'Rp9.500.000', labor: 'Rp6.500.000', vendor: 'Rp18.000.000', total: 'Rp34.000.000' },
  { id: 3, work_order: 'WO-2026-053', asset: 'Cisco Catalyst 9300', maintenance_type: 'BREAKDOWN', parts: 'Rp52.000.000', labor: 'Rp18.000.000', vendor: 'Rp41.000.000', total: 'Rp111.000.000' },
  { id: 4, work_order: 'WO-2026-060', asset: 'Dell Latitude 7440 Batch', maintenance_type: 'PREDICTIVE', parts: 'Rp14.000.000', labor: 'Rp9.000.000', vendor: 'Rp0', total: 'Rp23.000.000' },
  { id: 5, work_order: 'WO-2026-064', asset: 'AC Floor 3 East', maintenance_type: 'CORRECTIVE', parts: 'Rp21.000.000', labor: 'Rp15.000.000', vendor: 'Rp29.000.000', total: 'Rp65.000.000' },
]

const costColumns: DataTableColumn[] = [
  { key: 'work_order', label: 'Work Order' },
  { key: 'asset', label: 'Asset' },
  { key: 'maintenance_type', label: 'Type' },
  { key: 'parts', label: 'Part Cost' },
  { key: 'labor', label: 'Labor Cost' },
  { key: 'vendor', label: 'Vendor Cost' },
  { key: 'total', label: 'Total' },
]

const splitOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Parts', 'Labor', 'Vendor'],
  colors: ['#0ea5e9', '#8b5cf6', '#f59e0b'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const splitSeries = [163, 124, 141]

const typeOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#22c55e', '#f97316', '#ef4444', '#38bdf8'],
  plotOptions: { bar: { borderRadius: 7, columnWidth: '52%' } },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
  xaxis: { categories: ['Preventive', 'Corrective', 'Breakdown', 'Predictive'], labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } } },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
}

const typeSeries = [{ name: 'Cost (jt)', data: [88, 146, 131, 63] }]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <SectionCard title="Suggested Filters" description="Filter yang direkomendasikan oleh implementasi plan untuk cost report.">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm dark:border-white/10 dark:bg-slate-950/40">
            <p class="font-semibold text-slate-900 dark:text-white">Date Range</p>
            <p class="mt-2 text-slate-500 dark:text-slate-400">`date_from` / `date_to` untuk periode laporan.</p>
          </div>
          <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm dark:border-white/10 dark:bg-slate-950/40">
            <p class="font-semibold text-slate-900 dark:text-white">Asset Lookup</p>
            <p class="mt-2 text-slate-500 dark:text-slate-400">`asset_id` untuk fokus ke aset mahal tertentu.</p>
          </div>
          <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm dark:border-white/10 dark:bg-slate-950/40">
            <p class="font-semibold text-slate-900 dark:text-white">Maintenance Type</p>
            <p class="mt-2 text-slate-500 dark:text-slate-400">`maintenance_type` untuk preventive/corrective/breakdown/predictive.</p>
          </div>
          <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm dark:border-white/10 dark:bg-slate-950/40">
            <p class="font-semibold text-slate-900 dark:text-white">Sort & Order</p>
            <p class="mt-2 text-slate-500 dark:text-slate-400">Urutkan top expensive work orders dengan `sort` dan `order`.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Cost Split" description="Komposisi aktual part, labor, dan vendor cost.">
        <BaseChart type="donut" :height="300" :options="splitOptions" :series="splitSeries" />
      </SectionCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <DataTable
        title="Maintenance Cost Table"
        description="Sortable cost table untuk work order dengan beban biaya tertinggi."
        :rows="costRows"
        :columns="costColumns"
        search-placeholder="Cari work order, asset, atau type..."
        :search-keys="['work_order', 'asset', 'maintenance_type']"
        :page-size="5"
      />

      <SectionCard title="Cost by Maintenance Type" description="Perbandingan kasar biaya berdasarkan jenis maintenance.">
        <BaseChart type="bar" :height="320" :options="typeOptions" :series="typeSeries" />
      </SectionCard>
    </section>
  </div>
</template>
