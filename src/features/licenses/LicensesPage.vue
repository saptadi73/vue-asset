<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import DataTable from '@/components/DataTable.vue'
import DetailHighlightCard from '@/components/DetailHighlightCard.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import { getCrudConfig } from '@/config/crud'
import { liveSeedIds } from '@/data/liveSeedIds'
import { deleteCrudRecord } from '@/services/crud'
import type { DataTableColumn, MetricCardItem } from '@/types/app'
import { formatEnumLabel } from '@/utils/formatters'

const crudConfig = getCrudConfig('licenses')!

interface LicenseRow extends Record<string, unknown> {
  id: number
  product: string
  license_key: string
  seats: string
  expires_at: string
  status: 'ACTIVE' | 'WARNING' | 'EXPIRED'
  vendor: string
  license_type: string
  renewal_window: string
  owner: string
  contract_note: string
  seat_policy: string
  used_seats: string
  available_seats: string
}

interface LicenseAssignmentDetail {
  id: number
  target: string
  assignee_type: string
  assigned_at: string
  status: 'ACTIVE' | 'RELEASED'
  note: string
}

interface LicenseSeatDetail {
  id: number
  bucket: string
  qty: string
  action: string
  note: string
}

interface LicenseAssignmentFormState {
  id: number | null
  target: string
  assignee_type: string
  assigned_at: string
  status: LicenseAssignmentDetail['status']
  note: string
}

const metrics: MetricCardItem[] = [
  {
    title: 'Active Licenses',
    value: '37',
    icon: 'KeyRound',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Expiring Soon',
    value: '6',
    icon: 'AlarmClock',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Unused Seats',
    value: '49',
    icon: 'UsersRound',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'product', label: 'Product' },
  { key: 'license_key', label: 'License Key' },
  { key: 'seats', label: 'Seat Usage' },
  { key: 'expires_at', label: 'Expires At' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      ACTIVE: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      WARNING: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      EXPIRED: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
    },
  },
]

const assignmentStatusTone: Record<LicenseAssignmentDetail['status'], string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  RELEASED: 'bg-slate-200/80 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
}

const rows: LicenseRow[] = [
  {
    id: 1,
    product: 'Microsoft 365 E3',
    license_key: 'M365-E3-09A2',
    seats: '188 / 220',
    expires_at: '31 Dec 2026',
    status: 'ACTIVE',
    vendor: 'Microsoft CSP Partner',
    license_type: 'Subscription',
    renewal_window: 'Renewal prep by Nov 2026',
    owner: 'IT Infrastructure',
    contract_note: 'Lisensi utama kolaborasi dan office productivity seluruh grup.',
    seat_policy: 'Shared enterprise pool',
    used_seats: '188',
    available_seats: '32',
  },
  {
    id: 2,
    product: 'Adobe Creative Cloud',
    license_key: 'ADBE-CR-8842',
    seats: '24 / 30',
    expires_at: '18 Aug 2026',
    status: 'WARNING',
    vendor: 'Adobe Reseller APAC',
    license_type: 'Named User',
    renewal_window: 'Negotiate before 10 Aug 2026',
    owner: 'Brand & Design',
    contract_note: 'Lisensi untuk designer dan content production aktif.',
    seat_policy: 'Named user only',
    used_seats: '24',
    available_seats: '6',
  },
  {
    id: 3,
    product: 'AutoCAD LT',
    license_key: 'ACLT-55R7',
    seats: '14 / 15',
    expires_at: '21 Jul 2026',
    status: 'EXPIRED',
    vendor: 'Autodesk Channel Partner',
    license_type: 'Annual Term',
    renewal_window: 'Expired on 21 Jul 2026',
    owner: 'Engineering Office',
    contract_note: 'Perlu keputusan renew karena satu seat sudah tidak aktif.',
    seat_policy: 'Named user with release approval',
    used_seats: '14',
    available_seats: '1',
  },
  {
    id: 4,
    product: 'Zoom Workplace',
    license_key: 'ZOOM-BIZ-2201',
    seats: '72 / 110',
    expires_at: '03 Nov 2026',
    status: 'ACTIVE',
    vendor: 'Zoom Authorized Partner',
    license_type: 'Business Plan',
    renewal_window: 'Review consumption in Oct 2026',
    owner: 'Corporate Services',
    contract_note: 'Masih ada cukup seat untuk ekspansi user meeting host.',
    seat_policy: 'Host-based seat pool',
    used_seats: '72',
    available_seats: '38',
  },
]

const selectedLicenseId = ref<string>('1')
const defaultSelectedLicense = rows[0]!
const selectedLicense = computed<LicenseRow>(
  () => rows.find((item) => String(item.id) === selectedLicenseId.value) ?? defaultSelectedLicense,
)

const licenseSeatOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Used Seats', 'Available Seats', 'Expired Allocation'],
  colors: ['#0ea5e9', '#22c55e', '#f97316'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const licenseSeatSeries = [298, 86, 14]

const summaryRows = computed(() => [
  { label: 'License Type', value: selectedLicense.value.license_type, note: 'Tipe lisensi yang menentukan cara assignment dan renewal.' },
  { label: 'Owner', value: selectedLicense.value.owner, note: 'PIC pengelola lisensi di sisi frontend operasional.' },
  { label: 'Renewal Window', value: selectedLicense.value.renewal_window, note: 'Batas waktu review agar tidak terlambat renewal.' },
  { label: 'Seat Policy', value: selectedLicense.value.seat_policy, note: 'Aturan dasar distribusi seat dan release.' },
])
const licenseRelatedActions = computed(() => [
  {
    label: 'Update License',
    to: `/licenses/${selectedLicense.value.id}/edit`,
    icon: 'PencilLine',
    tone: 'primary',
  },
  {
    label: 'Update Asset Relation',
    to: `/asset-registry/new?predictive_warning=${encodeURIComponent(`Software relation for ${selectedLicense.value.product}`)}`,
    icon: 'MonitorCog',
    tone: 'secondary',
  },
  {
    label: 'Request Maintenance',
    to: `/maintenance/new?license_id=${encodeURIComponent(selectedLicense.value.license_key)}&license_name=${encodeURIComponent(selectedLicense.value.product)}&notes=${encodeURIComponent(`License issue follow-up for ${selectedLicense.value.product}`)}`,
    icon: 'Wrench',
    tone: 'secondary',
  },
  {
    label: 'Update Maintenance',
    to: `/maintenance/${liveSeedIds.maintenance_request_id}/edit?license_id=${encodeURIComponent(selectedLicense.value.license_key)}&license_name=${encodeURIComponent(selectedLicense.value.product)}`,
    icon: 'PencilRuler',
    tone: 'secondary',
  },
  {
    label: 'Start Stocktake',
    to: `/tracking/new?license_id=${encodeURIComponent(selectedLicense.value.license_key)}&license_name=${encodeURIComponent(selectedLicense.value.product)}&notes=${encodeURIComponent(`License/device audit for ${selectedLicense.value.product}`)}`,
    icon: 'QrCode',
    tone: 'secondary',
  },
  {
    label: 'Update Stocktake',
    to: `/tracking/${liveSeedIds.stocktake_session_id}/edit?license_id=${encodeURIComponent(selectedLicense.value.license_key)}&license_name=${encodeURIComponent(selectedLicense.value.product)}`,
    icon: 'ScanLine',
    tone: 'secondary',
  },
])

const licenseAssignmentsById = reactive<Record<number, LicenseAssignmentDetail[]>>({
  1: [
    { id: 101, target: 'AST-0001 / user.it.manager', assignee_type: 'Asset + User', assigned_at: '02 Jul 2026', status: 'ACTIVE', note: 'Dipakai user manager operasional.' },
    { id: 102, target: 'AST-0007 / warehouse.supervisor', assignee_type: 'Asset + User', assigned_at: '10 Jul 2026', status: 'ACTIVE', note: 'Untuk device scanner admin stocktake.' },
    { id: 103, target: 'finance.analyst', assignee_type: 'Named User', assigned_at: '11 Jul 2026', status: 'ACTIVE', note: 'Seat productivity reguler.' },
  ],
  2: [
    { id: 201, target: 'designer.lead', assignee_type: 'Named User', assigned_at: '01 Jul 2026', status: 'ACTIVE', note: 'Pemakai utama creative suite.' },
    { id: 202, target: 'content.editor', assignee_type: 'Named User', assigned_at: '05 Jul 2026', status: 'ACTIVE', note: 'Masih aktif untuk produksi materi kampanye.' },
    { id: 203, target: 'temp.freelancer', assignee_type: 'Named User', assigned_at: '20 Jun 2026', status: 'RELEASED', note: 'Seat sudah direlease pasca project selesai.' },
  ],
  3: [
    { id: 301, target: 'civil.engineer.01', assignee_type: 'Named User', assigned_at: '14 Jan 2026', status: 'ACTIVE', note: 'Perlu renew agar akses tidak terganggu.' },
    { id: 302, target: 'drafter.team', assignee_type: 'Named User', assigned_at: '22 Feb 2026', status: 'ACTIVE', note: 'Seat aktif menjelang expiry.' },
  ],
  4: [
    { id: 401, target: 'ops.meeting.host', assignee_type: 'Named User', assigned_at: '15 Jul 2026', status: 'ACTIVE', note: 'Host meeting regional.' },
    { id: 402, target: 'corp.secretariat', assignee_type: 'Named User', assigned_at: '19 Jul 2026', status: 'ACTIVE', note: 'Dipakai untuk webinar internal.' },
  ],
})

const seatDetailRowsById = reactive<Record<number, LicenseSeatDetail[]>>({
  1: [
    { id: 1001, bucket: 'Used', qty: '188', action: 'Monitor utilization', note: 'Masih ada 32 seat yang dapat dialokasikan.' },
    { id: 1002, bucket: 'Available', qty: '32', action: 'Reserve for onboarding', note: 'Cukup aman untuk kebutuhan 1-2 bulan ke depan.' },
    { id: 1003, bucket: 'Optimization', qty: '12 users', action: 'Review inactive', note: 'Ada kandidat user jarang aktif untuk cleanup seat.' },
  ],
  2: [
    { id: 2001, bucket: 'Used', qty: '24', action: 'Hold key users', note: 'Seat dipakai tim desain aktif.' },
    { id: 2002, bucket: 'Available', qty: '6', action: 'Prepare renewal', note: 'Masih aman, tapi expiry sudah dekat.' },
    { id: 2003, bucket: 'Release Pool', qty: '2', action: 'Reclaim after campaign', note: 'Bisa diambil dari project sementara.' },
  ],
  3: [
    { id: 3001, bucket: 'Used', qty: '14', action: 'Urgent renewal', note: 'Pemakai aktif berisiko terdampak expiry.' },
    { id: 3002, bucket: 'Available', qty: '1', action: 'Do not assign', note: 'Sebaiknya tidak dialokasikan sebelum renew.' },
    { id: 3003, bucket: 'Risk', qty: 'High', action: 'Escalate owner', note: 'Kontrak sudah lewat tanggal aktif.' },
  ],
  4: [
    { id: 4001, bucket: 'Used', qty: '72', action: 'Monitor host usage', note: 'Seat host aktif cukup efisien.' },
    { id: 4002, bucket: 'Available', qty: '38', action: 'Support growth', note: 'Masih ada ruang ekspansi untuk unit baru.' },
    { id: 4003, bucket: 'Optimization', qty: '8 hosts', action: 'Review monthly', note: 'Host usage rendah dapat dievaluasi.' },
  ],
})

const licenseAssignments = computed<LicenseAssignmentDetail[]>(() => licenseAssignmentsById[selectedLicense.value.id] ?? [])
const seatDetailRows = computed<LicenseSeatDetail[]>(() => seatDetailRowsById[selectedLicense.value.id] ?? [])

const assignmentForm = reactive<LicenseAssignmentFormState>({
  id: null,
  target: '',
  assignee_type: 'Named User',
  assigned_at: '',
  status: 'ACTIVE',
  note: '',
})

const assignmentEditorMode = ref<'create' | 'edit' | null>(null)
const assignmentDeleteTarget = ref<number | null>(null)

const resetAssignmentForm = () => {
  assignmentForm.id = null
  assignmentForm.target = ''
  assignmentForm.assignee_type = 'Named User'
  assignmentForm.assigned_at = ''
  assignmentForm.status = 'ACTIVE'
  assignmentForm.note = ''
}

const startCreateAssignment = () => {
  resetAssignmentForm()
  assignmentEditorMode.value = 'create'
}

const startEditAssignment = (item: LicenseAssignmentDetail) => {
  assignmentForm.id = item.id
  assignmentForm.target = item.target
  assignmentForm.assignee_type = item.assignee_type
  assignmentForm.assigned_at = item.assigned_at
  assignmentForm.status = item.status
  assignmentForm.note = item.note
  assignmentEditorMode.value = 'edit'
}

const saveAssignment = () => {
  const targetRows = licenseAssignmentsById[selectedLicense.value.id] ?? (licenseAssignmentsById[selectedLicense.value.id] = [])
  const payload: LicenseAssignmentDetail = {
    id: assignmentForm.id ?? Date.now(),
    target: assignmentForm.target,
    assignee_type: assignmentForm.assignee_type,
    assigned_at: assignmentForm.assigned_at,
    status: assignmentForm.status,
    note: assignmentForm.note,
  }

  if (assignmentEditorMode.value === 'edit' && assignmentForm.id !== null) {
    const index = targetRows.findIndex((item) => item.id === assignmentForm.id)
    if (index >= 0) targetRows[index] = payload
  } else {
    targetRows.unshift(payload)
  }

  resetAssignmentForm()
  assignmentEditorMode.value = null
}

const releaseSeat = (item: LicenseAssignmentDetail) => {
  const targetRows = licenseAssignmentsById[selectedLicense.value.id] ?? []
  const index = targetRows.findIndex((row) => row.id === item.id)

  if (index >= 0) {
    targetRows[index] = {
      ...item,
      status: 'RELEASED',
      note: item.note.includes('Released') ? item.note : `${item.note} Released back to seat pool.`,
    }
  }
}

const confirmAssignmentDelete = () => {
  if (assignmentDeleteTarget.value === null) return

  licenseAssignmentsById[selectedLicense.value.id] = (licenseAssignmentsById[selectedLicense.value.id] ?? []).filter(
    (item) => item.id !== assignmentDeleteTarget.value,
  )
  assignmentDeleteTarget.value = null
}

const handleDeleteLicense = async (row: Record<string, unknown>) => {
  await deleteCrudRecord(crudConfig, String(row.id))
}
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="space-y-6">
      <DataTable
        title="Software Licenses"
        :rows="rows"
        :columns="columns"
        :selected-row-id="selectedLicenseId"
        :clickable-rows="true"
        :actions="[
          { label: 'Create New', to: '/licenses/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/licenses/${row.id}/edit`,
          deleteTitle: 'Delete License',
          resolveRowLabel: (row) => String(row.license_key ?? row.product ?? row.id),
          deleteMessage: (row) => `Lisensi ${String(row.product ?? row.license_key ?? row.id)} akan dihapus dari daftar. Pastikan seat dan histori renewal tidak lagi dibutuhkan.`,
          onDelete: handleDeleteLicense,
        }"
        search-placeholder="Cari product, license key, atau status..."
        :search-keys="['product', 'license_key', 'status', 'vendor']"
        @select="selectedLicenseId = String($event.id)"
      />

      <div class="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard :title="`${selectedLicense.product} - ${selectedLicense.license_key}`">
          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">License Scope</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Vendor:</span> {{ selectedLicense.vendor }}</p>
                <p><span class="font-medium">Type:</span> {{ selectedLicense.license_type }}</p>
                <p><span class="font-medium">Expires:</span> {{ selectedLicense.expires_at }}</p>
              </div>
            </div>

            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Seat Pulse</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Seat Usage:</span> {{ selectedLicense.seats }}</p>
                <p><span class="font-medium">Used:</span> {{ selectedLicense.used_seats }}</p>
                <p><span class="font-medium">Available:</span> {{ selectedLicense.available_seats }}</p>
              </div>
            </div>

            <DetailHighlightCard
              eyebrow="License Note"
              :status-label="formatEnumLabel(selectedLicense.status)"
              :note="selectedLicense.contract_note"
              icon="KeySquare"
              :tone="
                selectedLicense.status === 'ACTIVE'
                  ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10'
                  : selectedLicense.status === 'WARNING'
                    ? 'border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10'
                    : 'border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10'
              "
              :badge-tone="
                selectedLicense.status === 'ACTIVE'
                  ? 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
                  : selectedLicense.status === 'WARNING'
                    ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                    : 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200'
              "
            />
          </div>
        </SectionCard>

        <div class="space-y-6">
          <SectionCard title="Related Actions">
            <div class="grid gap-3">
              <RouterLink
                v-for="action in licenseRelatedActions"
                :key="action.label"
                :to="action.to"
                class="flex items-center justify-between gap-4 rounded-[22px] border px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5"
                :class="
                  action.tone === 'primary'
                    ? 'border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                    : 'border-slate-200/80 bg-slate-50/80 text-slate-700 hover:border-sky-300 hover:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200'
                "
              >
                <span class="inline-flex items-center gap-3">
                  <span
                    class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border"
                    :class="
                      action.tone === 'primary'
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200'
                    "
                  >
                    <BaseIcon :name="action.icon" :size="16" />
                  </span>
                  {{ action.label }}
                </span>
                <BaseIcon name="ArrowRight" :size="16" :class="action.tone === 'primary' ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'" />
              </RouterLink>
            </div>
          </SectionCard>

          <SectionCard title="License Summary">
            <div class="space-y-3">
              <div
                v-for="row in summaryRows"
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

          <SectionCard title="Seat Allocation Mix">
            <BaseChart type="donut" :height="320" :options="licenseSeatOptions" :series="licenseSeatSeries" />
          </SectionCard>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Assignment Detail Table">
          <div class="mb-4 flex justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
              @click="startCreateAssignment"
            >
              <BaseIcon name="Plus" :size="15" />
              Add Assignment
            </button>
          </div>
          <div class="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10">
            <div
              v-for="assignment in licenseAssignments"
              :key="assignment.id"
              class="grid gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-4 last:border-b-0 dark:border-white/8 dark:bg-slate-900/50 md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_1fr_auto]"
            >
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ assignment.target }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ assignment.assignee_type }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ assignment.assigned_at }}</p>
              <span :class="['inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1', assignmentStatusTone[assignment.status]]">
                {{ assignment.status }}
              </span>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ assignment.note }}</p>
              <div class="flex items-start justify-end gap-2">
                <button
                  v-if="assignment.status === 'ACTIVE'"
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 transition hover:-translate-y-0.5 hover:border-emerald-300 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                  title="Release seat"
                  @click="releaseSeat(assignment)"
                >
                  <BaseIcon name="RefreshCcw" :size="16" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-800 transition hover:-translate-y-0.5 hover:border-sky-300 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
                  title="Update assignment"
                  @click="startEditAssignment(assignment)"
                >
                  <BaseIcon name="PencilLine" :size="16" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 transition hover:-translate-y-0.5 hover:border-rose-300 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                  title="Delete assignment"
                  @click="assignmentDeleteTarget = assignment.id"
                >
                  <BaseIcon name="Trash2" :size="16" />
                </button>
              </div>
            </div>
          </div>

          <form
            v-if="assignmentEditorMode"
            class="mt-4 grid gap-4 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40 md:grid-cols-2"
            @submit.prevent="saveAssignment"
          >
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Target</label>
              <input v-model="assignmentForm.target" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Assignee Type</label>
              <select v-model="assignmentForm.assignee_type" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white">
                <option value="Named User">Named User</option>
                <option value="Asset + User">Asset + User</option>
                <option value="Shared Pool">Shared Pool</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Assigned At</label>
              <input v-model="assignmentForm.assigned_at" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
              <select v-model="assignmentForm.status" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white">
                <option value="ACTIVE">Active</option>
                <option value="RELEASED">Released</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Note</label>
              <textarea v-model="assignmentForm.note" rows="3" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div class="md:col-span-2 flex justify-end gap-3">
              <button type="button" class="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200" @click="assignmentEditorMode = null">
                Cancel
              </button>
              <button type="submit" class="rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white dark:border-sky-600 dark:bg-sky-600">
                {{ assignmentEditorMode === 'edit' ? 'Update Assignment' : 'Create Assignment' }}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Seat Optimization Detail">
          <div class="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10">
            <div
              v-for="row in seatDetailRows"
              :key="row.id"
              class="grid gap-2 border-b border-slate-200/70 bg-white/80 px-4 py-4 last:border-b-0 dark:border-white/8 dark:bg-slate-900/50 md:grid-cols-[0.8fr_0.7fr_1fr_1.3fr]"
            >
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ row.bucket }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ row.qty }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ row.action }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ row.note }}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>

    <div
      v-if="assignmentDeleteTarget !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-slate-900">
        <div class="flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            <BaseIcon name="ShieldAlert" :size="20" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">Delete Assignment</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Assignment license akan dihapus dari detail seat allocation produk ini.
            </p>
            <p class="mt-3 text-xs font-medium tracking-[0.18em] text-rose-600 uppercase dark:text-rose-300">
              Double check sebelum melanjutkan.
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200"
            @click="assignmentDeleteTarget = null"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-full bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-500"
            @click="confirmAssignmentDelete"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
