<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  {
    title: 'Active Assets',
    value: '1,284',
    detail: 'Selaras dengan rekomendasi widget total asset aktif di blueprint dashboard.',
    icon: 'Boxes',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Open Transfers',
    value: '26',
    detail: 'Transfer yang masih menunggu submit, approve, atau complete.',
    icon: 'ArrowRightLeft',
    tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
  },
  {
    title: 'Open Requests',
    value: '18',
    detail: 'Maintenance request terbuka dan perlu triase cepat.',
    icon: 'ClipboardList',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Unverified Assets',
    value: '41',
    detail: 'Asset belum diverifikasi dan cocok untuk quick action dari dashboard.',
    icon: 'ShieldAlert',
    tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
  },
]

const trendOptions: ApexOptions = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'inherit',
    background: 'transparent',
  },
  colors: ['#0ea5e9', '#f97316'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: 'rgba(148, 163, 184, 0.18)',
    strokeDashArray: 5,
  },
  legend: {
    position: 'top',
    labels: {
      colors: '#94a3b8',
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    labels: {
      style: {
        colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'],
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: ['#94a3b8'],
      },
    },
  },
}

const trendSeries = [
  {
    name: 'Asset Added',
    data: [32, 45, 38, 51, 62, 67, 72],
  },
  {
    name: 'Maintenance Tickets',
    data: [12, 18, 16, 21, 20, 25, 19],
  },
]

const attentionColumns: DataTableColumn[] = [
  { key: 'asset', label: 'Asset' },
  { key: 'issue', label: 'Issue' },
  {
    key: 'priority',
    label: 'Priority',
    type: 'badge',
    toneMap: {
      High: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      Medium: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      Low: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
  { key: 'owner', label: 'Owner' },
]

const attentionRows = [
  { id: 1, asset: 'Forklift FL-12', issue: 'Belum diverifikasi stocktake', priority: 'High', owner: 'Warehouse' },
  { id: 2, asset: 'Dell Precision 5480', issue: 'Transfer belum diselesaikan', priority: 'Medium', owner: 'IT Ops' },
  { id: 3, asset: 'CCTV Lobby A', issue: 'Request maintenance menunggu assign', priority: 'High', owner: 'Facilities' },
  { id: 4, asset: 'Projector PX-77', issue: 'Warranty claim perlu follow-up', priority: 'Low', owner: 'Admin GA' },
  { id: 5, asset: 'Printer HQ-02', issue: 'Downtime berulang minggu ini', priority: 'Medium', owner: 'Office Ops' },
  { id: 6, asset: 'Scanner WH-09', issue: 'Komponen pengganti belum terpasang', priority: 'High', owner: 'Warehouse' },
]

const operationalMixOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Healthy', 'Need Review', 'Transfer Queue', 'Maintenance'],
  colors: ['#22c55e', '#f59e0b', '#38bdf8', '#f97316'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const operationalMixSeries = [62, 14, 11, 13]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
      <SectionCard
        title="Operational Trend"
        description="Grafik cepat untuk pertumbuhan asset dan intensitas maintenance."
      >
        <BaseChart type="line" :height="320" :options="trendOptions" :series="trendSeries" />
      </SectionCard>

      <SectionCard title="Quick Notes" description="Arah implementasi dari blueprint backend.">
        <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <p>Dashboard diarahkan sebagai landing page setelah login dengan fokus ke item yang perlu tindakan cepat.</p>
          <p>Card summary, chart trend, dan tabel perhatian sengaja dipisah agar mudah dihubungkan ke service backend per modul.</p>
          <p>Table yang dipakai di bawah mengikuti kontrak `search`, `page`, dan `page_size` dari dokumen API.</p>
        </div>
      </SectionCard>
    </section>

    <section class="grid gap-6 2xl:grid-cols-[1.4fr_1fr]">
      <DataTable
        title="Needs Attention"
        description="Ringkasan item yang butuh follow-up dari beberapa modul operasional."
        :rows="attentionRows"
        :columns="attentionColumns"
        search-placeholder="Cari asset, issue, atau owner..."
        :search-keys="['asset', 'issue', 'owner']"
      />

      <SectionCard title="Operational Mix" description="Komposisi cepat area operasional yang paling banyak menyita perhatian.">
        <BaseChart type="donut" :height="320" :options="operationalMixOptions" :series="operationalMixSeries" />
      </SectionCard>
    </section>
  </div>
</template>
