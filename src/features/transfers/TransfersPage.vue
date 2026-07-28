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
    title: 'Transfer in Progress',
    value: '26',
    detail: 'Transfer dengan status draft, submitted, atau approved.',
    icon: 'ArrowRightLeft',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Pending Approval',
    value: '9',
    detail: 'Perlu persetujuan agar asset bisa diterima dan diselesaikan.',
    icon: 'Stamp',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Completed Today',
    value: '12',
    detail: 'Transfer selesai dan sudah tercatat pada histori lokasi.',
    icon: 'BadgeCheck',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'number', label: 'Transfer No.' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'purpose', label: 'Purpose' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      DRAFT: 'bg-slate-300/70 text-slate-700 ring-slate-300/50 dark:bg-slate-800 dark:text-slate-200',
      SUBMITTED: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
      APPROVED: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
      COMPLETED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
]

const rows = [
  { id: 1, number: 'TRF-2026-071', from: 'HQ Warehouse', to: 'Site A', purpose: 'Operational allocation', status: 'SUBMITTED' },
  { id: 2, number: 'TRF-2026-072', from: 'Main Office', to: 'Training Center', purpose: 'Room refresh', status: 'APPROVED' },
  { id: 3, number: 'TRF-2026-073', from: 'Site B', to: 'Service Center', purpose: 'Repair routing', status: 'DRAFT' },
  { id: 4, number: 'TRF-2026-074', from: 'HQ Warehouse', to: 'Branch West', purpose: 'New opening', status: 'COMPLETED' },
  { id: 5, number: 'TRF-2026-075', from: 'Branch North', to: 'HQ Warehouse', purpose: 'Asset return', status: 'SUBMITTED' },
  { id: 6, number: 'TRF-2026-076', from: 'Branch East', to: 'Site C', purpose: 'Short term relocation', status: 'APPROVED' },
]

const transferMixOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Draft', 'Submitted', 'Approved', 'Completed'],
  colors: ['#94a3b8', '#38bdf8', '#8b5cf6', '#22c55e'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const transferMixSeries = [6, 9, 5, 12]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <DataTable
        title="Transfer Queue"
        description="Monitoring perpindahan asset dari draft sampai complete."
        :rows="rows"
        :columns="columns"
        :actions="[
          { label: 'Create New', to: '/transfers/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/transfers/${row.id}/edit`,
          deleteTitle: 'Delete Transfer',
          resolveRowLabel: (row) => String(row.number ?? row.id),
          deleteMessage: (row) => `Transfer ${String(row.number ?? row.id)} akan dihapus dari queue. Pastikan draft atau histori ini memang aman untuk dihapus.`,
        }"
        search-placeholder="Cari nomor transfer, lokasi, atau purpose..."
        :search-keys="['number', 'from', 'to', 'purpose']"
      />

      <div class="space-y-6">
        <StateFlowPanel
          title="Next State Actions"
          description="Aksi cepat untuk mendorong status transfer ke tahap berikutnya."
          :items="[
            {
              label: 'Move to Submitted',
              detail: 'Gunakan saat draft transfer siap diajukan untuk approval.',
              to: '/transfers/seed-transfer/workflow/submit',
              icon: 'Send',
              tone: 'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
            },
            {
              label: 'Move to Approved',
              detail: 'Tandai transfer lolos verifikasi dan siap dijalankan.',
              to: '/transfers/seed-transfer/workflow/approve',
              icon: 'BadgeCheck',
              tone: 'border-violet-200 bg-violet-50/70 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200',
            },
            {
              label: 'Move to Completed',
              detail: 'Tutup proses transfer setelah asset diterima dan tercatat.',
              to: '/transfers/seed-transfer/workflow/complete',
              icon: 'PackageCheck',
              tone: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
            },
          ]"
        />
        <SectionCard title="Transfer Stage Mix" description="Komposisi transfer berdasarkan tahapan kerja saat ini.">
          <BaseChart type="donut" :height="320" :options="transferMixOptions" :series="transferMixSeries" />
        </SectionCard>
      </div>
    </section>
  </div>
</template>
