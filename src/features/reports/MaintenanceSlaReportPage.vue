<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  { title: 'Response SLA', value: '94.2%', detail: 'Masih dalam target.', icon: 'TimerReset', tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200' },
  { title: 'Resolution SLA', value: '88.6%', detail: 'Selesai dalam target.', icon: 'ShieldCheck', tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200' },
  { title: 'Response Breach', value: '12', detail: 'Melewati batas response.', icon: 'TriangleAlert', tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200' },
  { title: 'Resolution Breach', value: '7', detail: 'Melewati batas penyelesaian.', icon: 'OctagonAlert', tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200' },
]

const complianceOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#0ea5e9', '#22c55e'],
  plotOptions: { bar: { borderRadius: 8, columnWidth: '44%' } },
  dataLabels: { enabled: false },
  legend: { position: 'top', labels: { colors: '#94a3b8' } },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
  xaxis: { categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } } },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } }, max: 100 },
}

const complianceSeries = [
  { name: 'Response SLA %', data: [92, 95, 94, 96] },
  { name: 'Resolution SLA %', data: [86, 87, 89, 89] },
]

const breachRows = [
  { id: 1, reference: 'MR-2026-126', asset: 'Forklift FL-12', sla_type: 'RESPONSE', overdue: '2h 14m', owner: 'Mechanical Team A' },
  { id: 2, reference: 'WO-2026-049', asset: 'Toyota Hilux 2.4', sla_type: 'RESOLUTION', overdue: '6h 42m', owner: 'Fleet Operations' },
  { id: 3, reference: 'MR-2026-131', asset: 'CCTV Dome Lobby A', sla_type: 'RESPONSE', overdue: '1h 07m', owner: 'Infra Support' },
  { id: 4, reference: 'WO-2026-060', asset: 'AC Floor 3 East', sla_type: 'RESOLUTION', overdue: '3h 10m', owner: 'HVAC Team' },
]

const breachColumns: DataTableColumn[] = [
  { key: 'reference', label: 'Reference' },
  { key: 'asset', label: 'Asset' },
  { key: 'sla_type', label: 'SLA Type' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'owner', label: 'Owner' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <SectionCard title="SLA Compliance Trend" description="Perbandingan response dan resolution compliance per minggu.">
        <BaseChart type="bar" :height="320" :options="complianceOptions" :series="complianceSeries" />
      </SectionCard>

      <SectionCard title="Period Filter Guidance" description="Filter utama yang disarankan untuk report SLA.">
        <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <p>Gunakan `date_from` dan `date_to` sebagai filter utama compliance board.</p>
          <p>Tambahkan badge breach untuk item yang melewati response atau resolution target.</p>
          <p>Drilldown idealnya mengarah ke request list atau work order list dengan status breach.</p>
        </div>
      </SectionCard>
    </section>

    <DataTable
      title="Breach Summary"
      description="Daftar item breach yang paling layak diprioritaskan untuk audit SLA."
      :rows="breachRows"
      :columns="breachColumns"
      search-placeholder="Cari reference, asset, atau owner..."
      :search-keys="['reference', 'asset', 'sla_type', 'owner']"
      :page-size="4"
    />
  </div>
</template>
