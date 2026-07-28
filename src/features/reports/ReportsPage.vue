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
    title: 'Report Catalog',
    value: '14',
    detail: 'Prioritas report lintas maintenance, tracking, cost, dan lifecycle.',
    icon: 'LayoutPanelTop',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Tier 1 Ready',
    value: '5',
    detail: 'Dashboard dan report yang paling bernilai untuk sprint awal.',
    icon: 'Rocket',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
  {
    title: 'Frontend-Derived',
    value: '8',
    detail: 'Bisa dibangun dari penggabungan endpoint yang sudah tersedia.',
    icon: 'Layers3',
    tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
  },
  {
    title: 'Need Attention',
    value: '4',
    detail: 'Area report yang paling cepat memberi nilai keputusan operasional.',
    icon: 'TriangleAlert',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
]

const reportGroups = [
  {
    title: 'Operational Dashboard',
    note: 'Landing page eksekutif untuk KPI, alert strip, backlog, unverified assets, dan entitlement warning.',
    items: [
      { label: 'Executive Dashboard', path: '/dashboard', tier: 'Tier 1', status: 'ready' },
      { label: 'Maintenance Dashboard', path: '/maintenance', tier: 'Tier 1', status: 'ready' },
      { label: 'Tracking Verification Dashboard', path: '/reports/tracking-verification', tier: 'Tier 1', status: 'ready' },
    ],
  },
  {
    title: 'Cost & SLA Governance',
    note: 'Report untuk compliance SLA, cost composition, backlog breach, dan entitlement expiry.',
    items: [
      { label: 'Maintenance Cost Report', path: '/reports/maintenance-cost', tier: 'Tier 2', status: 'priority' },
      { label: 'Maintenance SLA Report', path: '/reports/maintenance-sla', tier: 'Tier 2', status: 'priority' },
      { label: 'Entitlement Expiry Dashboard', path: '/reports/entitlement-expiry', tier: 'Tier 2', status: 'priority' },
    ],
  },
  {
    title: 'Reliability & Failure',
    note: 'Fokus ke MTBF, MTTR, downtime, root cause bucket, dan top failed assets.',
    items: [
      { label: 'Failure Analysis Report', path: '/reports/failure-analysis', tier: 'Tier 2', status: 'priority' },
      { label: 'Maintenance Reliability Report', path: '/reports', tier: 'Tier 1', status: 'derived' },
      { label: 'Maintenance Mix Dashboard', path: '/reports/maintenance-mix', tier: 'Tier 3', status: 'derived' },
    ],
  },
  {
    title: 'Lifecycle & Verification',
    note: 'Menyorot risk score asset, support end, schedule instability, discrepancy, dan verification aging.',
    items: [
      { label: 'Asset Lifecycle Risk Report', path: '/reports/asset-lifecycle-risk', tier: 'Tier 3', status: 'derived' },
      { label: 'Schedule Stability Report', path: '/reports/schedule-stability', tier: 'Tier 3', status: 'derived' },
      { label: 'Stocktake Discrepancy Report', path: '/reports', tier: 'Tier 1', status: 'ready' },
    ],
  },
]

const launchCards = [
  {
    title: 'Maintenance Cost',
    note: 'Total labor, parts, vendor cost, plus top expensive work orders.',
    icon: 'BadgeDollarSign',
    tone: 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10',
  },
  {
    title: 'Maintenance SLA',
    note: 'Response vs resolution compliance dan breach count per period.',
    icon: 'ShieldCheck',
    tone: 'border-sky-200 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/10',
  },
  {
    title: 'Failure Analysis',
    note: 'Bucket failure mode, root cause, repeat failure, dan top failed assets.',
    icon: 'Bug',
    tone: 'border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10',
  },
  {
    title: 'Entitlement Expiry',
    note: 'Kontrak, warranty, dan support end yang mendekati batas waktu.',
    icon: 'ShieldAlert',
    tone: 'border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10',
  },
  {
    title: 'Schedule Stability',
    note: 'Audit reschedule, postponed schedules, dan source trigger paling tidak stabil.',
    icon: 'CalendarSync',
    tone: 'border-violet-200 bg-violet-50/80 dark:border-violet-500/20 dark:bg-violet-500/10',
  },
  {
    title: 'Lifecycle Risk',
    note: 'Replacement recommendation, remaining life, dan support end watchlist.',
    icon: 'ShieldQuestion',
    tone: 'border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10',
  },
  {
    title: 'Maintenance Mix',
    note: 'Preventive vs corrective vs breakdown plus internal/vendor execution mix.',
    icon: 'PieChart',
    tone: 'border-sky-200 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/10',
  },
  {
    title: 'Tracking Verification',
    note: 'Verification KPI, discrepancy table, missing assets, dan aging bucket scan.',
    icon: 'ScanSearch',
    tone: 'border-cyan-200 bg-cyan-50/80 dark:border-cyan-500/20 dark:bg-cyan-500/10',
  },
]

const unverifiedColumns: DataTableColumn[] = [
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'location', label: 'Current Location' },
  { key: 'last_verified', label: 'Last Verified' },
  {
    key: 'risk',
    label: 'Risk',
    type: 'badge',
    toneMap: {
      HIGH: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      MEDIUM: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      LOW: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
]

const unverifiedRows = [
  { id: 1, asset_code: 'AST-0108', asset_name: 'Forklift FL-12', location: 'Warehouse North', last_verified: '11 Jun 2026', risk: 'HIGH' },
  { id: 2, asset_code: 'AST-0219', asset_name: 'Projector PX-77', location: 'Meeting Room 5', last_verified: '23 Jun 2026', risk: 'MEDIUM' },
  { id: 3, asset_code: 'AST-0342', asset_name: 'Scanner WH-09', location: 'Warehouse South', last_verified: '18 Jun 2026', risk: 'HIGH' },
  { id: 4, asset_code: 'AST-0491', asset_name: 'iPad Retail Demo', location: 'Branch West', last_verified: '27 Jul 2026', risk: 'LOW' },
  { id: 5, asset_code: 'AST-0822', asset_name: 'Cisco Catalyst 9300', location: 'Data Center', last_verified: '02 Jun 2026', risk: 'HIGH' },
]

const discrepancyColumns: DataTableColumn[] = [
  { key: 'asset', label: 'Asset' },
  { key: 'expected', label: 'Expected' },
  { key: 'observed', label: 'Observed' },
  {
    key: 'resolution',
    label: 'Resolution',
    type: 'badge',
    toneMap: {
      UNRESOLVED: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      REVIEW: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      RESOLVED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
]

const discrepancyRows = [
  { id: 1, asset: 'Toyota Hilux 2.4', expected: 'Site A', observed: 'HQ Yard', resolution: 'UNRESOLVED' },
  { id: 2, asset: 'Dell Latitude 7440', expected: 'HQ - IT Room', observed: 'Finance Office', resolution: 'REVIEW' },
  { id: 3, asset: 'CCTV Dome Lobby A', expected: 'Main Lobby', observed: 'Main Lobby', resolution: 'RESOLVED' },
  { id: 4, asset: 'Motorola Scanner MC33', expected: 'Warehouse South', observed: 'Warehouse North', resolution: 'UNRESOLVED' },
]

const reportCoverageOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#0ea5e9', '#22c55e', '#f97316'],
  plotOptions: { bar: { horizontal: true, borderRadius: 7 } },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
  xaxis: {
    categories: ['Operational', 'Cost & SLA', 'Reliability', 'Lifecycle', 'Verification'],
    labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } },
  },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
}

const reportCoverageSeries = [
  { name: 'Ready', data: [3, 2, 1, 1, 3] },
]

const buildMixOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Langsung Jadi', 'Frontend-Derived', 'Backend-Later'],
  colors: ['#22c55e', '#8b5cf6', '#f97316'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const buildMixSeries = [7, 8, 4]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard title="Report Groups" description="Kelompok report yang disusun dari blueprint, implementation plan, dan catalog frontend.">
        <div class="grid gap-5 xl:grid-cols-2">
          <div
            v-for="group in reportGroups"
            :key="group.title"
            class="flex min-h-[320px] flex-col rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.34)] dark:border-white/10 dark:bg-slate-950/40"
          >
            <div class="border-b border-slate-200/80 pb-4 dark:border-white/10">
              <h3 class="text-base font-semibold text-slate-950 dark:text-white">{{ group.title }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ group.note }}</p>
            </div>

            <div class="mt-4 space-y-3">
              <RouterLink
                v-for="item in group.items"
                :key="item.label"
                :to="item.path"
                class="flex items-start justify-between gap-3 rounded-[20px] border border-slate-200/80 bg-white/90 px-4 py-3.5 text-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white dark:border-white/10 dark:bg-slate-900/70"
              >
                <span class="pr-3 font-medium leading-6 text-slate-700 dark:text-slate-200">{{ item.label }}</span>
                <span class="inline-flex shrink-0 items-center gap-2">
                  <span class="rounded-full bg-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{{ item.tier }}</span>
                  <span
                    class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    :class="
                      item.status === 'ready'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'
                        : item.status === 'priority'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-200'
                          : 'bg-violet-500/15 text-violet-700 dark:text-violet-200'
                    "
                  >
                    {{ item.status }}
                  </span>
                </span>
              </RouterLink>
            </div>
          </div>
        </div>
      </SectionCard>

      <div class="space-y-6">
        <SectionCard title="Coverage by Domain" description="Pemetaan cepat area report yang paling kaya untuk frontend saat ini.">
          <BaseChart type="bar" :height="300" :options="reportCoverageOptions" :series="reportCoverageSeries" />
        </SectionCard>

        <SectionCard title="Build Strategy Mix" description="Komposisi report yang sudah langsung jadi, perlu agregasi frontend, atau lebih baik pindah ke backend nanti.">
          <BaseChart type="donut" :height="300" :options="buildMixOptions" :series="buildMixSeries" />
        </SectionCard>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2 2xl:grid-cols-4">
      <div
        v-for="item in launchCards"
        :key="item.title"
        class="flex min-h-[280px] flex-col rounded-[26px] border p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)]"
        :class="item.tone"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-base font-semibold text-slate-950 dark:text-white">{{ item.title }}</p>
            <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ item.note }}</p>
          </div>
          <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-700 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-100">
            <BaseIcon :name="item.icon" :size="18" />
          </span>
        </div>

        <div class="mt-5 space-y-2">
          <p class="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Operational Focus</p>
          <p class="line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ item.note }}</p>
        </div>

        <RouterLink
          :to="
            item.title === 'Maintenance Cost'
              ? '/reports/maintenance-cost'
              : item.title === 'Maintenance SLA'
                ? '/reports/maintenance-sla'
                : item.title === 'Failure Analysis'
                  ? '/reports/failure-analysis'
                  : item.title === 'Entitlement Expiry'
                    ? '/reports/entitlement-expiry'
                    : item.title === 'Schedule Stability'
                      ? '/reports/schedule-stability'
                      : item.title === 'Lifecycle Risk'
                        ? '/reports/asset-lifecycle-risk'
                        : item.title === 'Maintenance Mix'
                          ? '/reports/maintenance-mix'
                          : '/reports/tracking-verification'
          "
          class="mt-auto inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          Open Report
        </RouterLink>
      </div>
    </section>

    <section class="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
      <DataTable
        title="Unverified Assets Preview"
        description="Preview report verifikasi yang paling cepat memberi dampak operasional."
        :rows="unverifiedRows"
        :columns="unverifiedColumns"
        :actions="[{ label: 'Open Tracking', to: '/tracking', icon: 'ArrowRight', tone: 'primary' }]"
        search-placeholder="Cari asset code, name, atau location..."
        :search-keys="['asset_code', 'asset_name', 'location']"
        :page-size="5"
      />

      <DataTable
        title="Location Discrepancy Preview"
        description="Mismatch lokasi yang cocok dijadikan report exception dan investigasi cepat."
        :rows="discrepancyRows"
        :columns="discrepancyColumns"
        :actions="[{ label: 'Open Reports Hub', to: '/reports', icon: 'ArrowRight', tone: 'primary' }]"
        search-placeholder="Cari asset atau lokasi..."
        :search-keys="['asset', 'expected', 'observed', 'resolution']"
        :page-size="4"
      />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <SectionCard title="Recommended Implementation Sequence" description="Urutan halaman report yang paling efektif untuk memperkaya aplikasi tanpa menunggu endpoint baru.">
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Sprint A</p>
            <div class="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <p>Executive Dashboard</p>
              <p>Maintenance Dashboard</p>
              <p>Tracking Verification Dashboard</p>
            </div>
          </div>
          <div class="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Sprint B</p>
            <div class="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <p>Maintenance Cost Report</p>
              <p>Maintenance SLA Report</p>
              <p>Failure Analysis Report</p>
            </div>
          </div>
          <div class="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Sprint C</p>
            <div class="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <p>Entitlement Expiry Dashboard</p>
              <p>Schedule Stability Report</p>
              <p>Lifecycle Risk Dashboard</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Frontend Rules" description="Pola implementasi report agar dashboard dan halaman analitik terasa solid sejak awal.">
        <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <p>Gunakan satu query per widget besar agar error tidak menjatuhkan seluruh halaman.</p>
          <p>Widget gagal harus tetap menampilkan shell dan tombol retry, bukan blank page.</p>
          <p>Detail historis seperti schedule events atau lifecycle review sebaiknya lazy load saat user drilldown.</p>
          <p>Filter dan struktur tabel tetap tampil walau data kosong, supaya halaman tidak terasa setengah jadi.</p>
        </div>
      </SectionCard>
    </section>
  </div>
</template>
