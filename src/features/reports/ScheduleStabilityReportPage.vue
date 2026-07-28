<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

const metrics: MetricCardItem[] = [
  { title: 'Rescheduled Schedules', value: '17', detail: 'Schedule dengan `reschedule_count > 0` pada periode aktif.', icon: 'CalendarSync', tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200' },
  { title: 'Postponed Status', value: '9', detail: 'Item yang masih tertahan dan perlu keputusan planner.', icon: 'PauseCircle', tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200' },
  { title: 'Most Unstable Source', value: 'PREDICTIVE', detail: 'Source yang paling banyak memicu perubahan jadwal.', icon: 'Radar', tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200' },
  { title: 'Need Event Drilldown', value: '6', detail: 'Schedule yang layak dibuka event history-nya untuk audit.', icon: 'History', tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200' },
]

const statusOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#22c55e', '#0ea5e9', '#f59e0b', '#ef4444'],
  plotOptions: { bar: { borderRadius: 8, columnWidth: '50%' } },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
  xaxis: { categories: ['Planned', 'Confirmed', 'Postponed', 'Completed'], labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } } },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
}

const statusSeries = [{ name: 'Schedules', data: [31, 22, 9, 18] }]

const sourceOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Preventive Plan', 'Meter Trigger', 'Condition Trigger', 'Predictive Trigger'],
  colors: ['#22c55e', '#0ea5e9', '#f59e0b', '#8b5cf6'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const sourceSeries = [26, 14, 11, 17]

const rows = [
  { id: 1, schedule_no: 'SCH-2026-088', asset: 'Forklift FL-12', source: 'PREDICTIVE_TRIGGER', status: 'POSTPONED', reschedule_count: '3', reason: 'Awaiting vendor slot' },
  { id: 2, schedule_no: 'SCH-2026-091', asset: 'Toyota Hilux 2.4', source: 'PREVENTIVE_PLAN', status: 'CONFIRMED', reschedule_count: '1', reason: 'Operational unit still in field' },
  { id: 3, schedule_no: 'SCH-2026-094', asset: 'Cisco Catalyst 9300', source: 'CONDITION_TRIGGER', status: 'POSTPONED', reschedule_count: '2', reason: 'Need outage window approval' },
  { id: 4, schedule_no: 'SCH-2026-099', asset: 'AC Floor 3 East', source: 'METER_TRIGGER', status: 'PLANNED', reschedule_count: '1', reason: 'Planner adjusted due window' },
]

const columns: DataTableColumn[] = [
  { key: 'schedule_no', label: 'Schedule No.' },
  { key: 'asset', label: 'Asset' },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'Status' },
  { key: 'reschedule_count', label: 'Reschedule' },
  { key: 'reason', label: 'Reason' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <SectionCard title="Schedule Status Distribution" description="Pola status schedule untuk mendeteksi instabilitas planning.">
        <BaseChart type="bar" :height="300" :options="statusOptions" :series="statusSeries" />
      </SectionCard>
      <SectionCard title="Schedule Source Distribution" description="Sumber pembentukan schedule yang paling dominan.">
        <BaseChart type="donut" :height="300" :options="sourceOptions" :series="sourceSeries" />
      </SectionCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <DataTable
        title="Most Rescheduled Schedules"
        description="Daftar schedule yang paling sering berubah dan layak diaudit event history-nya."
        :rows="rows"
        :columns="columns"
        search-placeholder="Cari schedule, asset, source..."
        :search-keys="['schedule_no', 'asset', 'source', 'status']"
        :page-size="4"
      />

      <SectionCard title="Build Strategy" description="Strategi build sesuai dokumentasi implementasi.">
        <div class="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <p>Panggil `GET /api/v1/maintenance/schedules` untuk daftar utama dan filter schedule dengan `reschedule_count > 0`.</p>
          <p>Event history sebaiknya lazy load dari `GET /api/v1/maintenance/schedules/{schedule_id}/events` hanya saat row dibuka user.</p>
          <p>Report ini sangat cocok untuk planner dan supervisor karena menunjukkan bukti audit perubahan planning.</p>
        </div>
      </SectionCard>
    </section>
  </div>
</template>
