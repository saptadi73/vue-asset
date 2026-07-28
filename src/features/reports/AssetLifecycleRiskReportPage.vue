<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  { title: 'High Risk Assets', value: '14', detail: 'Aset dengan risk score dan replacement pressure tertinggi.', icon: 'ShieldAlert', tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200' },
  { title: 'Replace Soon', value: '9', detail: 'Mendekati expected replacement date atau support end.', icon: 'RefreshCw', tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200' },
  { title: 'Low Remaining Life', value: '11', detail: 'Asset dengan sisa useful life paling pendek.', icon: 'Hourglass', tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200' },
  { title: 'Review Candidates', value: '18', detail: 'Layak dibuka lifecycle review detail atau support end watchlist.', icon: 'FileSearch', tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200' },
]

const riskOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#ef4444', '#f59e0b', '#22c55e'],
  plotOptions: { bar: { borderRadius: 8, horizontal: true } },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
  xaxis: { categories: ['Forklift FL-12', 'Cisco Catalyst 9300', 'Toyota Hilux 2.4', 'Epson EB-L210SW', 'HP LaserJet M507'], labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } } },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
}

const riskSeries = [{ name: 'Risk Score', data: [92, 88, 79, 58, 61] }]

const rows = [
  { id: 1, asset: 'Forklift FL-12', recommendation: 'REPLACE', useful_life: '5 months', support_end: '09 Aug 2026', priority: 'HIGH' },
  { id: 2, asset: 'Cisco Catalyst 9300', recommendation: 'REVIEW', useful_life: '7 months', support_end: '31 Oct 2026', priority: 'HIGH' },
  { id: 3, asset: 'Toyota Hilux 2.4', recommendation: 'MAINTAIN', useful_life: '12 months', support_end: '14 Aug 2026', priority: 'MEDIUM' },
  { id: 4, asset: 'HP LaserJet M507', recommendation: 'REVIEW', useful_life: '9 months', support_end: '20 Nov 2026', priority: 'MEDIUM' },
]

const columns: DataTableColumn[] = [
  { key: 'asset', label: 'Asset' },
  { key: 'recommendation', label: 'Recommendation' },
  { key: 'useful_life', label: 'Remaining Life' },
  { key: 'support_end', label: 'Support End' },
  {
    key: 'priority',
    label: 'Priority',
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

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard title="Risk Attention List" description="Skor risiko kasar untuk kandidat replacement dan lifecycle review.">
        <BaseChart type="bar" :height="320" :options="riskOptions" :series="riskSeries" />
      </SectionCard>

      <SectionCard title="Build Strategy" description="Panduan implementasi frontend sesuai blueprint.">
        <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <p>Gunakan `GET /api/v1/assets` untuk screening awal kandidat risk dan replacement.</p>
          <p>Lifecycle review yang lebih detail sebaiknya dibuka saat user drilldown ke `GET /api/v1/assets/{asset_id}/lifecycle-reviews`.</p>
          <p>Report ini cocok menampilkan support end, replacement priority, dan remaining useful life dalam satu layar.</p>
        </div>
      </SectionCard>
    </section>

    <DataTable
      title="Replacement Recommendation Table"
      description="Daftar kandidat review lifecycle dan rekomendasi replace yang paling perlu perhatian."
      :rows="rows"
      :columns="columns"
      search-placeholder="Cari asset atau recommendation..."
      :search-keys="['asset', 'recommendation', 'priority']"
      :page-size="4"
    />
  </div>
</template>
