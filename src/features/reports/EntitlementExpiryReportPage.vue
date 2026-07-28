<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  { title: '30-Day Window', value: '6', detail: 'Berakhir sebelum 27 Aug 2026.', icon: 'AlarmClock', tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200' },
  { title: '60-Day Window', value: '11', detail: 'Perlu review lebih awal.', icon: 'CalendarRange', tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200' },
  { title: '90-Day Window', value: '19', detail: 'Sudah masuk watchlist.', icon: 'ShieldAlert', tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200' },
  { title: 'Top Provider', value: 'PT Mekar Service', detail: 'Provider dengan expiry terbanyak.', icon: 'Building2', tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200' },
]

const expiryRows = [
  { id: 1, reference: 'MC-2026-014', type: 'Maintenance Contract', provider: 'PT Mekar Service', due: '09 Aug 2026', asset_scope: 'Forklift FL-12' },
  { id: 2, reference: 'WRT-DL-7440-B3', type: 'Warranty', provider: 'PT Dell Indonesia', due: '19 Aug 2026', asset_scope: 'Dell Latitude Batch 3' },
  { id: 3, reference: 'SUP-SCN-MC33', type: 'Support Plan', provider: 'PT Dell Indonesia', due: '27 Sep 2026', asset_scope: 'Motorola Scanner MC33' },
  { id: 4, reference: 'MC-2026-002', type: 'Fleet Contract', provider: 'PT Astra Mobility', due: '14 Aug 2026', asset_scope: 'Toyota Hilux 2.4' },
]

const expiryColumns: DataTableColumn[] = [
  { key: 'reference', label: 'Reference' },
  { key: 'type', label: 'Type' },
  { key: 'provider', label: 'Provider' },
  { key: 'due', label: 'Due Date' },
  { key: 'asset_scope', label: 'Scope' },
]

const providerOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['PT Mekar Service', 'PT Dell Indonesia', 'PT Astra Mobility', 'Other'],
  colors: ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const providerSeries = [6, 5, 3, 5]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <DataTable
        title="Expiry Timeline Table"
        description="Watchlist entitlement expiry yang paling butuh aksi komersial atau renewal."
        :rows="expiryRows"
        :columns="expiryColumns"
        search-placeholder="Cari reference, provider, atau scope..."
        :search-keys="['reference', 'type', 'provider', 'asset_scope']"
        :page-size="4"
      />

      <div class="space-y-6">
        <SectionCard title="Provider Breakdown" description="Komposisi provider atau vendor pada entitlement expiry aktif.">
          <BaseChart type="donut" :height="300" :options="providerOptions" :series="providerSeries" />
        </SectionCard>
        <SectionCard title="Suggested Filter" description="Filter utama untuk entitlement expiry dashboard.">
          <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>Gunakan `days_ahead` dengan pilihan 30, 60, 90, atau 120 hari.</p>
            <p>Drilldown idealnya menuju asset detail, warranty detail, atau contract detail yang terkait.</p>
          </div>
        </SectionCard>
      </div>
    </section>
  </div>
</template>
