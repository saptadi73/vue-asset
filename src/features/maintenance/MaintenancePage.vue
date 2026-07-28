<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import DataTable from '@/components/DataTable.vue'
import DetailGridTable from '@/components/DetailGridTable.vue'
import DetailHighlightCard from '@/components/DetailHighlightCard.vue'
import DocumentStatusList from '@/components/DocumentStatusList.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import { getCrudConfig } from '@/config/crud'
import { deleteCrudRecord } from '@/services/crud'
import type { DataTableColumn, DetailGridColumn, DocumentReference, MetricCardItem } from '@/types/app'
import { formatEnumLabel } from '@/utils/formatters'

const crudConfig = getCrudConfig('maintenance')!

interface MaintenanceRow extends Record<string, unknown> {
  id: number
  request_no: string
  asset: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  request_date: string
  team: string
  execution_mode: 'INTERNAL' | 'VENDOR' | 'HYBRID'
  sla_response: string
  sla_resolution: string
  downtime: string
  vendor: string
  symptom: string
  triage_note: string
  next_step: string
  maintenance_contract: string
}

const crudStatusTone: Record<MaintenanceRow['status'], string> = {
  OPEN: 'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
  ASSIGNED: 'border-violet-200 bg-violet-50/70 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200',
  IN_PROGRESS: 'border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
  COMPLETED: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
}

const metrics: MetricCardItem[] = [
  {
    title: 'Backlog',
    value: '73',
    icon: 'ListTodo',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'SLA Compliance',
    value: '94.2%',
    icon: 'ShieldCheck',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
  {
    title: 'Downtime Hours',
    value: '126 h',
    icon: 'Clock3',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Critical Failures',
    value: '8',
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
const executionDetailColumns: DetailGridColumn[] = [
  { key: 'label', label: 'Stage', valueClass: 'text-sm font-semibold text-slate-900 dark:text-white' },
  { key: 'value', label: 'Value' },
  { key: 'note', label: 'Context', valueClass: 'text-sm text-slate-500 dark:text-slate-400' },
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
      IN_PROGRESS: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      COMPLETED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
  { key: 'team', label: 'Team' },
]

const requestRows: MaintenanceRow[] = [
  {
    id: 1,
    request_no: 'MR-2026-121',
    asset: 'Forklift FL-12',
    priority: 'HIGH',
    status: 'OPEN',
    request_date: '28 Jul 2026',
    team: 'Mechanical Team A',
    execution_mode: 'VENDOR',
    sla_response: '2 h left',
    sla_resolution: '22 h left',
    downtime: '3.5 h',
    vendor: 'PT Mekar Service Solusi',
    symptom: 'Mesin berhenti saat beban > 60% dan muncul bunyi getar abnormal.',
    triage_note: 'Butuh validasi bearing dan kemungkinan vendor field visit.',
    next_step: 'Triage and assign',
    maintenance_contract: 'MC-2026-014',
  },
  {
    id: 2,
    request_no: 'MR-2026-122',
    asset: 'Printer HQ-02',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    request_date: '27 Jul 2026',
    team: 'Office Support',
    execution_mode: 'INTERNAL',
    sla_response: 'Met',
    sla_resolution: '12 h left',
    downtime: '1.0 h',
    vendor: 'N/A',
    symptom: 'Paper jam berulang setelah 20 lembar print.',
    triage_note: 'Assigned ke office support, spare roller sedang disiapkan.',
    next_step: 'Field execution',
    maintenance_contract: '',
  },
  {
    id: 3,
    request_no: 'MR-2026-123',
    asset: 'CCTV Lobby A',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    request_date: '28 Jul 2026',
    team: 'Infra Support',
    execution_mode: 'HYBRID',
    sla_response: 'Met',
    sla_resolution: '6 h left',
    downtime: '2.1 h',
    vendor: 'PT Infra Network Nusantara',
    symptom: 'Video stream putus dan packet loss naik signifikan.',
    triage_note: 'Internal team menangani switch port, vendor standby untuk kamera replacement.',
    next_step: 'Vendor standby and verification',
    maintenance_contract: '',
  },
  {
    id: 4,
    request_no: 'MR-2026-124',
    asset: 'Generator G-4',
    priority: 'LOW',
    status: 'COMPLETED',
    request_date: '25 Jul 2026',
    team: 'Utilities Team',
    execution_mode: 'INTERNAL',
    sla_response: 'Met',
    sla_resolution: 'Closed',
    downtime: '0.8 h',
    vendor: 'N/A',
    symptom: 'Minor fuel sensor fluctuation.',
    triage_note: 'Work order selesai dan sensor sudah dikalibrasi ulang.',
    next_step: 'Closed',
    maintenance_contract: '',
  },
  {
    id: 5,
    request_no: 'MR-2026-125',
    asset: 'AC Floor 3 East',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    request_date: '27 Jul 2026',
    team: 'HVAC Team',
    execution_mode: 'VENDOR',
    sla_response: 'Met',
    sla_resolution: '16 h left',
    downtime: '4.6 h',
    vendor: 'PT Mekar Service Solusi',
    symptom: 'Suhu ruangan tidak turun dan airflow sangat lemah.',
    triage_note: 'Vendor scheduled siang ini, unit butuh coil cleaning dan refrigerant check.',
    next_step: 'Vendor visit scheduled',
    maintenance_contract: 'MC-2026-014',
  },
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

const selectedRequestId = ref<string>('1')
const defaultSelectedRequest = requestRows[0]!
const selectedRequest = computed<MaintenanceRow>(
  () => requestRows.find((item) => String(item.id) === selectedRequestId.value) ?? defaultSelectedRequest,
)

const maintenanceContractDocuments = computed<DocumentReference[]>(() => {
  const documentMap: Record<string, DocumentReference[]> = {
    'MC-2026-002': [
      {
        id: 'maintenance-contract-mc-2026-002',
        label: 'Maintenance Contract',
        fileName: 'MC-2026-002-contract.txt',
        href: '/documents/contracts/MC-2026-002-contract.txt',
        note: 'Dokumen kontrak maintenance fleet service dengan SLA response 48 jam.',
        kind: 'contract',
      },
    ],
    'MC-2026-014': [
      {
        id: 'maintenance-contract-mc-2026-014',
        label: 'Maintenance Contract',
        fileName: 'MC-2026-014-contract.txt',
        href: '/documents/contracts/MC-2026-014-contract.txt',
        note: 'Dokumen corrective support dan cakupan spare part vendor.',
        kind: 'contract',
      },
    ],
  }

  if (!selectedRequest.value.maintenance_contract) {
    return [
      {
        id: `maintenance-contract-${selectedRequest.value.request_no}`,
        label: 'Maintenance Contract',
        note: 'Tidak ada dokumen kontrak maintenance untuk request ini.',
        kind: 'contract',
      },
    ]
  }

  return documentMap[selectedRequest.value.maintenance_contract] ?? [
    {
      id: `maintenance-contract-${selectedRequest.value.maintenance_contract}`,
      label: 'Maintenance Contract',
      note: 'Tidak ada dokumen kontrak maintenance untuk request ini.',
      kind: 'contract',
    },
  ]
})

const requestLifecycleRows = computed(() => [
  { label: 'Current Step', value: selectedRequest.value.next_step, note: 'Posisi request saat ini di workflow maintenance' },
  { label: 'Execution Mode', value: selectedRequest.value.execution_mode, note: 'Menentukan kebutuhan vendor atau tim internal' },
  { label: 'Assigned Team', value: selectedRequest.value.team, note: 'Tim utama penanggung jawab' },
  { label: 'Vendor Support', value: selectedRequest.value.vendor, note: 'Partner support saat dibutuhkan' },
  { label: 'Downtime', value: selectedRequest.value.downtime, note: 'Akumulasi downtime operasional terkait request ini' },
])

const slaRows = computed(() => [
  { label: 'Response SLA', value: selectedRequest.value.sla_response, note: 'Mengacu target response dari priority atau contract coverage' },
  { label: 'Resolution SLA', value: selectedRequest.value.sla_resolution, note: 'Target penyelesaian berdasarkan triage aktif' },
  { label: 'Triage Note', value: selectedRequest.value.priority, note: selectedRequest.value.triage_note },
])

const workOrderRows = computed(() => {
  if (selectedRequest.value.status === 'OPEN') {
    return [
      { label: 'Assessment', value: 'Waiting triage', note: 'Supervisor perlu menentukan route execution dan SLA final.' },
      { label: 'Vendor Readiness', value: selectedRequest.value.vendor, note: 'Validasi entitlement vendor sebelum assign.' },
    ]
  }

  if (selectedRequest.value.status === 'ASSIGNED') {
    return [
      { label: 'Assignment', value: selectedRequest.value.team, note: 'Team sudah ditugaskan dan menunggu eksekusi.' },
      { label: 'Preparation', value: 'Parts / tools check', note: 'Cek ketersediaan spare part dan tools kerja.' },
    ]
  }

  if (selectedRequest.value.status === 'IN_PROGRESS') {
    return [
      { label: 'Execution', value: 'Work order active', note: 'Pekerjaan sedang berjalan di lapangan.' },
      { label: 'Vendor Coordination', value: selectedRequest.value.vendor, note: 'Vendor standby untuk komponen yang perlu penggantian.' },
    ]
  }

  return [
    { label: 'Completion', value: 'Verified', note: 'Request selesai dan siap masuk histori reliability.' },
    { label: 'Downtime Result', value: selectedRequest.value.downtime, note: 'Downtime final tercatat untuk reporting.' },
  ]
})

const workflowItems = computed(() => {
  const id = selectedRequest.value.id

  if (selectedRequest.value.status === 'OPEN') {
    return [
      {
        label: 'Assign Request',
        detail: 'Lanjutkan ke assignment tim atau planner setelah triage awal lengkap.',
        to: `/maintenance/${id}/edit`,
        icon: 'UserCheck',
        tone: crudStatusTone.ASSIGNED,
      },
    ]
  }

  if (selectedRequest.value.status === 'ASSIGNED') {
    return [
      {
        label: 'Move to In Progress',
        detail: 'Gunakan saat teknisi atau vendor sudah mulai eksekusi di lapangan.',
        to: `/maintenance/${id}/edit`,
        icon: 'Wrench',
        tone: crudStatusTone.IN_PROGRESS,
      },
    ]
  }

  if (selectedRequest.value.status === 'IN_PROGRESS') {
    return [
      {
        label: 'Move to Completed',
        detail: 'Tutup request setelah pekerjaan selesai dan hasil diverifikasi.',
        to: `/maintenance/${id}/edit`,
        icon: 'CircleCheckBig',
        tone: crudStatusTone.COMPLETED,
      },
    ]
  }

  return [
    {
      label: 'Request Completed',
      detail: 'Request ini sudah selesai dan dapat dilihat di histori reliability dan SLA.',
      to: `/maintenance/${id}/edit`,
      icon: 'BadgeCheck',
      tone: crudStatusTone.COMPLETED,
    },
  ]
})

const handleDeleteMaintenance = async (row: Record<string, unknown>) => {
  await deleteCrudRecord(crudConfig, String(row.id))
}
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <SectionCard title="Maintenance Trend">
        <BaseChart type="line" :height="300" :options="trendOptions" :series="trendSeries" />
      </SectionCard>

      <SectionCard title="Backlog Priority Mix">
        <BaseChart type="donut" :height="320" :options="priorityMixOptions" :series="priorityMixSeries" />
      </SectionCard>
    </section>

    <section class="space-y-6">
      <DataTable
        title="Maintenance Request Queue"
        :rows="requestRows"
        :columns="requestColumns"
        :selected-row-id="selectedRequestId"
        :clickable-rows="true"
        :actions="[
          { label: 'Create New', to: '/maintenance/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/maintenance/${row.id}/edit`,
          deleteTitle: 'Delete Maintenance Request',
          resolveRowLabel: (row) => String(row.request_no ?? row.asset ?? row.id),
          deleteMessage: (row) => `Request ${String(row.request_no ?? row.id)} untuk ${String(row.asset ?? 'asset terkait')} akan dihapus dari backlog tampilan ini.`,
          onDelete: handleDeleteMaintenance,
        }"
        search-placeholder="Cari request number, asset, priority, atau status..."
        :search-keys="['request_no', 'asset', 'priority', 'status', 'team']"
        @select="selectedRequestId = String($event.id)"
      />

      <div class="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard :title="`${selectedRequest.request_no} - ${selectedRequest.asset}`">
          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Request Context</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Request Date:</span> {{ selectedRequest.request_date }}</p>
                <p><span class="font-medium">Priority:</span> {{ selectedRequest.priority }}</p>
                <p><span class="font-medium">Status:</span> {{ formatEnumLabel(selectedRequest.status) }}</p>
              </div>
            </div>

            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Execution</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Mode:</span> {{ selectedRequest.execution_mode }}</p>
                <p><span class="font-medium">Team:</span> {{ selectedRequest.team }}</p>
                <p><span class="font-medium">Vendor:</span> {{ selectedRequest.vendor }}</p>
              </div>
            </div>

            <DetailHighlightCard
              eyebrow="Symptom"
              :status-label="formatEnumLabel(selectedRequest.status)"
              :note="selectedRequest.symptom"
              :icon="selectedRequest.status === 'COMPLETED' ? 'CircleCheckBig' : selectedRequest.status === 'IN_PROGRESS' ? 'Wrench' : 'TriangleAlert'"
              :tone="crudStatusTone[selectedRequest.status]"
              :badge-tone="
                selectedRequest.status === 'OPEN'
                  ? 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200'
                  : selectedRequest.status === 'ASSIGNED'
                    ? 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200'
                    : selectedRequest.status === 'IN_PROGRESS'
                      ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                      : 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
              "
            />
          </div>
        </SectionCard>

        <SectionCard title="SLA & Triage Snapshot">
          <div class="space-y-3">
            <div
              v-for="row in slaRows"
              :key="row.label"
              class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ row.label }}</p>
                <span class="rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {{ row.value }}
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ row.note }}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <SectionCard title="Execution Detail">
          <DetailGridTable :columns="executionDetailColumns" :rows="requestLifecycleRows" desktop-grid-class="md:grid-cols-[0.9fr_0.8fr_1.3fr] gap-2" row-key="label" />
        </SectionCard>

        <div class="space-y-6">
          <SectionCard title="Work Order Readiness">
            <div class="space-y-3">
              <div
                v-for="row in workOrderRows"
                :key="row.label"
                class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ row.label }}</p>
                  <span class="rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {{ row.value }}
                  </span>
                </div>
                <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ row.note }}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Contract Documents" description="Dokumen kontrak maintenance yang terkait dengan request ini.">
            <DocumentStatusList :documents="maintenanceContractDocuments" />
          </SectionCard>

          <SectionCard title="Next State Action">
            <div class="space-y-3">
              <RouterLink
                v-for="item in workflowItems"
                :key="item.label"
                :to="item.to"
                class="flex items-start gap-3 rounded-[22px] border p-4 transition hover:-translate-y-0.5"
                :class="item.tone"
              >
                <span class="rounded-2xl bg-white/80 p-2 ring-1 ring-white/60 dark:bg-slate-950/30 dark:ring-white/10">
                  <BaseIcon :name="item.icon" :size="16" />
                </span>
                <span>
                  <span class="block text-sm font-semibold">{{ item.label }}</span>
                  <span class="mt-1 block text-xs leading-5 opacity-80">{{ item.detail }}</span>
                </span>
              </RouterLink>
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  </div>
</template>
