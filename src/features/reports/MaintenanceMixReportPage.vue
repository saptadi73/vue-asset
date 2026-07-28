<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  { title: 'Preventive Share', value: '34%', detail: 'Proporsi preventive work order pada mix aktif.', icon: 'ShieldPlus', tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200' },
  { title: 'Corrective Share', value: '29%', detail: 'Corrective work order yang paling sering mengisi backlog.', icon: 'Wrench', tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200' },
  { title: 'Breakdown Share', value: '21%', detail: 'Porsi breakdown yang layak diawasi untuk reliability.', icon: 'TriangleAlert', tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200' },
  { title: 'Vendor Execution', value: '38%', detail: 'Bagian pekerjaan yang masih banyak bergantung ke vendor.', icon: 'BriefcaseBusiness', tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200' },
]

const mixOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Preventive', 'Corrective', 'Breakdown', 'Predictive'],
  colors: ['#22c55e', '#f59e0b', '#ef4444', '#38bdf8'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const mixSeries = [34, 29, 21, 16]

const executionOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#0ea5e9', '#8b5cf6', '#22c55e'],
  plotOptions: { bar: { borderRadius: 8, columnWidth: '52%' } },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
  xaxis: { categories: ['Internal', 'Vendor', 'Hybrid'], labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8'] } } },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
}

const executionSeries = [{ name: 'Work Orders', data: [28, 19, 11] }]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <SectionCard title="Maintenance Type Mix" description="Proporsi preventive, corrective, breakdown, dan predictive.">
        <BaseChart type="donut" :height="320" :options="mixOptions" :series="mixSeries" />
      </SectionCard>

      <SectionCard title="Execution Mode Mix" description="Porsi internal, vendor, dan hybrid execution pada workload aktif.">
        <BaseChart type="bar" :height="320" :options="executionOptions" :series="executionSeries" />
      </SectionCard>
    </section>

    <SectionCard title="Implementation Note" description="Quick win report yang disarankan katalog frontend tanpa perlu endpoint agregat baru.">
      <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <p>Bangun dari kombinasi `GET /api/v1/maintenance/work-orders` dan `GET /api/v1/maintenance/requests`.</p>
        <p>Tonjolkan preventive vs corrective vs breakdown vs predictive mix, lalu bandingkan execution internal dengan vendor.</p>
        <p>Report ini cocok dipakai untuk melihat apakah organisasi terlalu reaktif atau sudah cukup sehat di preventive planning.</p>
      </div>
    </SectionCard>
  </div>
</template>
