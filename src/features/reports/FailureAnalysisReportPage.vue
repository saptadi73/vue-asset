<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  { title: 'Failure Count', value: '28', detail: 'Total failure aktif.', icon: 'Bug', tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200' },
  { title: 'Repeat Failure', value: '9', detail: 'Kasus berulang.', icon: 'RefreshCcw', tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200' },
  { title: 'Top Root Cause', value: 'Bearing Wear', detail: 'Root cause paling dominan.', icon: 'SearchCode', tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200' },
  { title: 'Highest Downtime', value: '41 h', detail: 'Downtime tertinggi.', icon: 'ClockAlert', tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200' },
]

const modeOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#ef4444'],
  plotOptions: { bar: { borderRadius: 8, horizontal: true } },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
  xaxis: { categories: ['Bearing Failure', 'Power Loss', 'Cooling Issue', 'Sensor Drift', 'Network Instability'], labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } } },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
}

const modeSeries = [{ name: 'Cases', data: [9, 6, 5, 4, 4] }]

const causeOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#8b5cf6'],
  plotOptions: { bar: { borderRadius: 8, horizontal: true } },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
  xaxis: { categories: ['Wear & Tear', 'Improper Load', 'Poor Cooling', 'Human Error', 'Vendor Delay'], labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } } },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
}

const causeSeries = [{ name: 'Cases', data: [11, 6, 4, 4, 3] }]

const failedRows = [
  { id: 1, asset: 'Forklift FL-12', failures: '6', downtime: '18 h', severity: 'HIGH' },
  { id: 2, asset: 'Cisco Catalyst 9300', failures: '4', downtime: '41 h', severity: 'HIGH' },
  { id: 3, asset: 'AC Floor 3 East', failures: '4', downtime: '13 h', severity: 'MEDIUM' },
  { id: 4, asset: 'Toyota Hilux 2.4', failures: '3', downtime: '9 h', severity: 'MEDIUM' },
]

const failedColumns: DataTableColumn[] = [
  { key: 'asset', label: 'Asset' },
  { key: 'failures', label: 'Failure Count' },
  { key: 'downtime', label: 'Downtime' },
  {
    key: 'severity',
    label: 'Severity',
    type: 'badge',
    toneMap: {
      HIGH: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      MEDIUM: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
    },
  },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <SectionCard title="Failure Mode Buckets" description="Distribusi mode failure yang paling dominan.">
        <BaseChart type="bar" :height="300" :options="modeOptions" :series="modeSeries" />
      </SectionCard>
      <SectionCard title="Root Cause Buckets" description="Distribusi RCA yang paling sering muncul.">
        <BaseChart type="bar" :height="300" :options="causeOptions" :series="causeSeries" />
      </SectionCard>
    </section>

    <DataTable
      title="Top Failed Assets"
      description="Asset dengan failure count dan downtime tertinggi."
      :rows="failedRows"
      :columns="failedColumns"
      search-placeholder="Cari asset..."
      :search-keys="['asset', 'severity']"
      :page-size="4"
    />
  </div>
</template>
