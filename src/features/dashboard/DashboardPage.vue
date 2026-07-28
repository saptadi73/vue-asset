<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { RouterLink } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  {
    title: 'Active Assets',
    value: '4,982',
    detail: '3,450 running normal across active locations.',
    icon: 'Boxes',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Abnormal Status',
    value: '214',
    detail: 'Need review on maintenance, transfer, or retirement.',
    icon: 'TriangleAlert',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Open Transfers',
    value: '26',
    detail: '9 waiting approval and 6 pending completion.',
    icon: 'ArrowRightLeft',
    tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
  },
  {
    title: 'Active Stocktakes',
    value: '7',
    detail: '2 sessions still waiting approval after recount.',
    icon: 'QrCode',
    tone: 'bg-cyan-500/15 text-cyan-700 ring-cyan-400/20 dark:text-cyan-200',
  },
  {
    title: 'Open Requests',
    value: '43',
    detail: '12 are already overdue against response target.',
    icon: 'ClipboardList',
    tone: 'bg-orange-500/15 text-orange-700 ring-orange-400/20 dark:text-orange-200',
  },
  {
    title: 'Active Work Orders',
    value: '18',
    detail: '5 orders are nearing planned end window.',
    icon: 'Wrench',
    tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
  },
  {
    title: 'Unverified Assets',
    value: '41',
    detail: '7 assets are above the 90-day aging bucket.',
    icon: 'ShieldAlert',
    tone: 'bg-red-500/15 text-red-700 ring-red-400/20 dark:text-red-200',
  },
  {
    title: 'Expiry Watch',
    value: '19',
    detail: 'Contracts and warranties ending within 90 days.',
    icon: 'FileWarning',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const alertItems = [
  {
    title: 'Overdue Requests',
    value: '12',
    note: 'Perlu triage dan assignment lebih cepat hari ini.',
    icon: 'AlarmClock',
    to: '/maintenance',
    tone: 'border-rose-200 bg-rose-50/85 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100',
    chipTone: 'bg-rose-600 text-white dark:bg-rose-500',
  },
  {
    title: 'Overdue Work Orders',
    value: '5',
    note: 'Dominan pada corrective dan breakdown execution.',
    icon: 'Wrench',
    to: '/maintenance',
    tone: 'border-amber-200 bg-amber-50/85 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100',
    chipTone: 'bg-amber-500 text-slate-950 dark:bg-amber-400',
  },
  {
    title: 'Schedule Instability',
    value: '9',
    note: 'Ada reschedule berulang yang perlu review planner.',
    icon: 'CalendarClock',
    to: '/reports',
    tone: 'border-violet-200 bg-violet-50/85 text-violet-900 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-100',
    chipTone: 'bg-violet-600 text-white dark:bg-violet-500',
  },
  {
    title: 'Expiring Entitlements',
    value: '19',
    note: 'Warranty dan maintenance coverage mendekati akhir.',
    icon: 'ShieldCheck',
    to: '/leases',
    tone: 'border-emerald-200 bg-emerald-50/85 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100',
    chipTone: 'bg-emerald-600 text-white dark:bg-emerald-500',
  },
]

const verificationColumns: DataTableColumn[] = [
  { key: 'asset', label: 'Asset' },
  { key: 'location', label: 'Current Location' },
  { key: 'days', label: 'Days' },
  {
    key: 'priority',
    label: 'Priority',
    type: 'badge',
    toneMap: {
      Critical: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      High: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      Medium: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
    },
  },
]

const verificationRows = [
  { id: 1, asset: 'Forklift FL-12', location: 'Warehouse North', days: '96', priority: 'Critical' },
  { id: 2, asset: 'Toyota Hilux 2.4', location: 'Site A', days: '74', priority: 'High' },
  { id: 3, asset: 'Dell Latitude 7440', location: 'HQ - IT Room', days: '61', priority: 'High' },
  { id: 4, asset: 'CCTV Dome Lobby A', location: 'Main Lobby', days: '42', priority: 'Medium' },
  { id: 5, asset: 'Epson EB-L210SW', location: 'Training Room', days: '39', priority: 'Medium' },
]

const backlogColumns: DataTableColumn[] = [
  { key: 'reference', label: 'Reference' },
  { key: 'queue', label: 'Queue' },
  { key: 'owner', label: 'Owner' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      OVERDUE: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      OPEN: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      REVIEW: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
    },
  },
]

const backlogRows = [
  { id: 1, reference: 'MR-2026-126', queue: 'Request Triage', owner: 'Mechanical Team A', status: 'OVERDUE' },
  { id: 2, reference: 'WO-2026-044', queue: 'Execution', owner: 'Facilities Core', status: 'OPEN' },
  { id: 3, reference: 'SCH-2026-088', queue: 'Reschedule Review', owner: 'Planner Central', status: 'REVIEW' },
  { id: 4, reference: 'WO-2026-049', queue: 'Vendor Follow-up', owner: 'Infra Support', status: 'OVERDUE' },
  { id: 5, reference: 'MR-2026-131', queue: 'Approval', owner: 'Fleet Operations', status: 'OPEN' },
]

const statusDistributionOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#0ea5e9', '#f59e0b', '#f97316', '#64748b'],
  plotOptions: { bar: { borderRadius: 7, columnWidth: '48%' } },
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.16)' },
  legend: { show: false },
  xaxis: {
    categories: ['Active', 'Maintenance', 'Transfer', 'Retired'],
    labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } },
  },
  yaxis: {
    labels: { style: { colors: ['#94a3b8'] } },
  },
}

const statusDistributionSeries = [{ name: 'Assets', data: [3450, 622, 410, 200] }]

const maintenancePulseOptions: ApexOptions = {
  chart: { type: 'line', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#f97316', '#0ea5e9'],
  stroke: { curve: 'smooth', width: 3 },
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.16)', strokeDashArray: 5 },
  legend: { position: 'top', labels: { colors: '#94a3b8' } },
  xaxis: {
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } },
  },
  yaxis: {
    labels: { style: { colors: ['#94a3b8'] } },
  },
}

const maintenancePulseSeries = [
  { name: 'Open Requests', data: [34, 39, 37, 43] },
  { name: 'Open Work Orders', data: [14, 16, 17, 18] },
]

const verificationAgingOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['> 30 Days', '> 60 Days', '> 90 Days'],
  colors: ['#38bdf8', '#f59e0b', '#ef4444'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const verificationAgingSeries = [41, 18, 7]

const costSplitOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Parts', 'Labor', 'Vendor'],
  colors: ['#0ea5e9', '#22c55e', '#f97316'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const costSplitSeries = [38, 29, 33]

const expiryRows = [
  { id: 1, title: 'MC-2026-002', type: 'Maintenance Contract', due: '14 Aug 2026', owner: 'Fleet Operations' },
  { id: 2, title: 'Warranty Dell Latitude Batch 3', type: 'Warranty', due: '19 Aug 2026', owner: 'IT Operations' },
  { id: 3, title: 'MC-2026-014', type: 'Vendor Coverage', due: '09 Aug 2026', owner: 'Warehouse Ops' },
  { id: 4, title: 'Scanner Support Plan', type: 'Support Entitlement', due: '27 Sep 2026', owner: 'Warehouse Systems' },
]

const drilldownLinks = [
  { label: 'Asset Registry', to: '/asset-registry', icon: 'Boxes' },
  { label: 'Maintenance Queue', to: '/maintenance', icon: 'Wrench' },
  { label: 'Tracking & Stocktake', to: '/tracking', icon: 'QrCode' },
  { label: 'Reports', to: '/reports', icon: 'BarChart3' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-4 xl:grid-cols-4">
      <RouterLink
        v-for="item in alertItems"
        :key="item.title"
        :to="item.to"
        class="rounded-[26px] border p-5 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5"
        :class="item.tone"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/65 bg-white/80 dark:border-white/10 dark:bg-slate-950/30">
              <BaseIcon :name="item.icon" :size="18" />
            </span>
            <div>
              <p class="text-sm font-semibold">{{ item.title }}</p>
              <p class="mt-1 text-sm leading-6 opacity-90">{{ item.note }}</p>
            </div>
          </div>
          <span :class="['rounded-full px-3 py-1 text-xs font-semibold', item.chipTone]">{{ item.value }}</span>
        </div>
      </RouterLink>
    </section>

    <section class="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
      <DataTable
        title="Verification Attention"
        description="Aset yang terlalu lama belum diverifikasi dan paling layak ditindaklanjuti lebih dulu."
        :rows="verificationRows"
        :columns="verificationColumns"
        :actions="[{ label: 'Open Tracking', to: '/tracking', icon: 'ArrowRight', tone: 'primary' }]"
        search-placeholder="Cari asset atau lokasi..."
        :search-keys="['asset', 'location', 'priority']"
        :page-size="5"
      />

      <SectionCard title="Entitlement Watchlist" description="Kontrak, warranty, atau support coverage yang paling dekat ke tanggal akhir.">
        <div class="space-y-3">
          <RouterLink
            v-for="item in expiryRows"
            :key="item.id"
            to="/leases"
            class="flex items-start justify-between gap-4 rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-4 transition hover:border-emerald-300 hover:bg-white dark:border-white/10 dark:bg-slate-950/40"
          >
            <div>
              <p class="text-sm font-semibold text-slate-950 dark:text-white">{{ item.title }}</p>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ item.type }}</p>
              <p class="mt-2 text-xs font-medium tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">{{ item.owner }}</p>
            </div>
            <span class="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-300/40 dark:text-emerald-200 dark:ring-emerald-500/20">
              {{ item.due }}
            </span>
          </RouterLink>
        </div>
      </SectionCard>
    </section>

    <section class="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
      <DataTable
        title="Operational Backlog Queue"
        description="Request, work order, dan schedule yang perlu perhatian supervisor dalam waktu dekat."
        :rows="backlogRows"
        :columns="backlogColumns"
        :actions="[{ label: 'Open Maintenance', to: '/maintenance', icon: 'ArrowRight', tone: 'primary' }]"
        search-placeholder="Cari reference, owner, atau queue..."
        :search-keys="['reference', 'queue', 'owner', 'status']"
        :page-size="5"
      />

      <SectionCard title="Quick Drilldown" description="Akses cepat ke domain operasional utama dari landing dashboard.">
        <div class="grid gap-3">
          <RouterLink
            v-for="item in drilldownLinks"
            :key="item.label"
            :to="item.to"
            class="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
          >
            <span class="inline-flex items-center gap-3">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                <BaseIcon :name="item.icon" :size="16" />
              </span>
              {{ item.label }}
            </span>
            <BaseIcon name="ArrowRight" :size="16" class="text-slate-400 dark:text-slate-500" />
          </RouterLink>
        </div>
      </SectionCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-2 2xl:grid-cols-4">
      <SectionCard title="Asset Status Distribution" description="Split cepat kondisi status asset dari registry operasional.">
        <BaseChart type="bar" :height="280" :options="statusDistributionOptions" :series="statusDistributionSeries" />
      </SectionCard>

      <SectionCard title="Maintenance Pulse" description="Perbandingan request terbuka dan work order aktif per minggu.">
        <BaseChart type="line" :height="280" :options="maintenancePulseOptions" :series="maintenancePulseSeries" />
      </SectionCard>

      <SectionCard title="Verification Aging" description="Bucket aging untuk unverified assets agar prioritas scan lebih jelas.">
        <BaseChart type="donut" :height="280" :options="verificationAgingOptions" :series="verificationAgingSeries" />
      </SectionCard>

      <SectionCard title="Maintenance Cost Split" description="Komposisi cepat biaya labor, parts, dan vendor dari work order aktif.">
        <BaseChart type="donut" :height="280" :options="costSplitOptions" :series="costSplitSeries" />
      </SectionCard>
    </section>
  </div>
</template>
