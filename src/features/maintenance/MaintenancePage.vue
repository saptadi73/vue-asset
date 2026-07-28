<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import StateFlowPanel from '@/components/StateFlowPanel.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  {
    title: 'Backlog',
    value: '73',
    detail: 'Total maintenance backlog yang perlu dibereskan.',
    icon: 'ListTodo',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'SLA Compliance',
    value: '94.2%',
    detail: 'Kepatuhan SLA dari laporan maintenance dashboard.',
    icon: 'ShieldCheck',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
  {
    title: 'Downtime Hours',
    value: '126 h',
    detail: 'Akumulasi downtime untuk periode monitoring aktif.',
    icon: 'Clock3',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Critical Failures',
    value: '8',
    detail: 'Asset dengan failure pattern yang perlu tindakan prioritas.',
    icon: 'TriangleAlert',
    tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
  },
]

const trendOptions: ApexOptions = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'inherit',
    background: 'transparent',
  },
  colors: ['#f59e0b', '#14b8a6'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    labels: {
      style: {
        colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'],
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
  grid: {
    borderColor: 'rgba(148, 163, 184, 0.18)',
    strokeDashArray: 5,
  },
}

const trendSeries = [
  { name: 'Open Requests', data: [18, 24, 16, 21] },
  { name: 'Completed Work Orders', data: [12, 17, 19, 23] },
]

const requestColumns: DataTableColumn[] = [
  { key: 'request_no', label: 'Request No.' },
  { key: 'asset', label: 'Asset' },
  {
    key: 'priority',
    label: 'Priority',
    type: 'badge',
    toneMap: {
      HIGH: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      MEDIUM: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      LOW: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      OPEN: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
      ASSIGNED: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
      COMPLETED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
]

const requestRows = [
  { id: 1, request_no: 'MR-2026-121', asset: 'Forklift FL-12', priority: 'HIGH', status: 'OPEN' },
  { id: 2, request_no: 'MR-2026-122', asset: 'Printer HQ-02', priority: 'MEDIUM', status: 'ASSIGNED' },
  { id: 3, request_no: 'MR-2026-123', asset: 'CCTV Lobby A', priority: 'HIGH', status: 'OPEN' },
  { id: 4, request_no: 'MR-2026-124', asset: 'Generator G-4', priority: 'LOW', status: 'COMPLETED' },
  { id: 5, request_no: 'MR-2026-125', asset: 'AC Floor 3 East', priority: 'MEDIUM', status: 'ASSIGNED' },
]

const priorityMixOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['High', 'Medium', 'Low'],
  colors: ['#ef4444', '#f59e0b', '#22c55e'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const priorityMixSeries = [8, 23, 42]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <SectionCard title="Maintenance Trend" description="Backlog, request flow, dan completion pattern.">
        <BaseChart type="line" :height="300" :options="trendOptions" :series="trendSeries" />
      </SectionCard>

      <div class="space-y-6">
        <SectionCard title="Backlog Priority Mix" description="Distribusi backlog untuk membantu prioritas dispatch dan vendor routing.">
          <BaseChart type="donut" :height="320" :options="priorityMixOptions" :series="priorityMixSeries" />
        </SectionCard>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <DataTable
        title="Open Maintenance Requests"
        description="Request prioritas tinggi dan menengah untuk ditindaklanjuti."
        :rows="requestRows"
        :columns="requestColumns"
        :actions="[
          { label: 'Create New', to: '/maintenance/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/maintenance/${row.id}/edit`,
          deleteTitle: 'Delete Maintenance Request',
          resolveRowLabel: (row) => String(row.request_no ?? row.asset ?? row.id),
          deleteMessage: (row) => `Request ${String(row.request_no ?? row.id)} untuk ${String(row.asset ?? 'asset terkait')} akan dihapus dari backlog tampilan ini.`,
        }"
        search-placeholder="Cari request number, asset, priority, atau status..."
        :search-keys="['request_no', 'asset', 'priority', 'status']"
      />

      <div class="space-y-6">
        <StateFlowPanel
          title="Next State Actions"
          description="Percepatan perubahan state untuk request atau work order yang sedang berjalan."
          :items="[
            {
              label: 'Move to Assigned',
              detail: 'Pakai saat request sudah diterima dan siap ditugaskan ke tim.',
              to: '/maintenance/seed-maintenance/edit',
              icon: 'UserCheck',
              tone: 'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
            },
            {
              label: 'Move to In Progress',
              detail: 'Gunakan ketika teknisi mulai menangani tiket di lapangan.',
              to: '/maintenance/seed-maintenance/edit',
              icon: 'Wrench',
              tone: 'border-violet-200 bg-violet-50/70 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200',
            },
            {
              label: 'Move to Completed',
              detail: 'Tutup request setelah eksekusi selesai dan hasil diverifikasi.',
              to: '/maintenance/seed-maintenance/edit',
              icon: 'CircleCheckBig',
              tone: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
            },
          ]"
        />

        <SectionCard title="Dispatch Notes" description="Panduan singkat sebelum memindahkan state request.">
          <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>Pastikan prioritas dan assignment team sudah sesuai sebelum request dipindahkan ke tahap berikutnya.</p>
            <p>Untuk work order vendor, validasi dukungan kontrak dan kebutuhan spare part sebelum status dijalankan.</p>
            <p>Pola tombol next state ini bisa kita sambungkan ke action endpoint spesifik setelah backend final.</p>
          </div>
        </SectionCard>
      </div>
    </section>
  </div>
</template>
