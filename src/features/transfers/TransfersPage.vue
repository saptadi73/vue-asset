<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import DataTable from '@/components/DataTable.vue'
import DetailHighlightCard from '@/components/DetailHighlightCard.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import { getCrudConfig } from '@/config/crud'
import { deleteCrudRecord } from '@/services/crud'
import type { DataTableColumn, MetricCardItem } from '@/types/app'
import { formatEnumLabel } from '@/utils/formatters'

const crudConfig = getCrudConfig('transfers')!

interface TransferRow extends Record<string, unknown> {
  id: number
  number: string
  from: string
  to: string
  purpose: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'COMPLETED'
  transfer_date: string
  requested_by: string
  approver: string
  asset_count: string
  receiving_pic: string
  route_note: string
  approval_note: string
  current_step: string
  eta: string
}

const metrics: MetricCardItem[] = [
  {
    title: 'Transfer in Progress',
    value: '26',
    icon: 'ArrowRightLeft',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Pending Approval',
    value: '9',
    icon: 'Stamp',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Completed Today',
    value: '12',
    icon: 'BadgeCheck',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'number', label: 'Transfer No.' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'asset_count', label: 'Items' },
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

const rows: TransferRow[] = [
  {
    id: 1,
    number: 'TRF-2026-071',
    from: 'HQ Warehouse',
    to: 'Site A',
    purpose: 'Operational allocation',
    status: 'SUBMITTED',
    transfer_date: '28 Jul 2026',
    requested_by: 'Warehouse Lead',
    approver: 'Ops Manager',
    asset_count: '4',
    receiving_pic: 'Site Admin A',
    route_note: 'Menunggu approval agar armada dispatch bisa dijadwalkan.',
    approval_note: 'Justifikasi mutasi sudah lengkap, tinggal approval area.',
    current_step: 'Approval queue',
    eta: '29 Jul 2026',
  },
  {
    id: 2,
    number: 'TRF-2026-072',
    from: 'Main Office',
    to: 'Training Center',
    purpose: 'Room refresh',
    status: 'APPROVED',
    transfer_date: '27 Jul 2026',
    requested_by: 'GA Supervisor',
    approver: 'Facilities Head',
    asset_count: '7',
    receiving_pic: 'Training Center PIC',
    route_note: 'Sudah approved, menunggu kendaraan dan check-out asset.',
    approval_note: 'Approved dengan catatan semua serial number harus cocok.',
    current_step: 'Ready for dispatch',
    eta: '28 Jul 2026',
  },
  {
    id: 3,
    number: 'TRF-2026-073',
    from: 'Site B',
    to: 'Service Center',
    purpose: 'Repair routing',
    status: 'DRAFT',
    transfer_date: '28 Jul 2026',
    requested_by: 'Site Engineer',
    approver: 'Maintenance Coordinator',
    asset_count: '2',
    receiving_pic: 'Repair Intake Desk',
    route_note: 'Draft masih perlu melengkapi alasan kerusakan dan daftar item.',
    approval_note: 'Belum diajukan.',
    current_step: 'Draft preparation',
    eta: '30 Jul 2026',
  },
  {
    id: 4,
    number: 'TRF-2026-074',
    from: 'HQ Warehouse',
    to: 'Branch West',
    purpose: 'New opening',
    status: 'COMPLETED',
    transfer_date: '26 Jul 2026',
    requested_by: 'Expansion Team',
    approver: 'Supply Chain Manager',
    asset_count: '12',
    receiving_pic: 'Branch West Admin',
    route_note: 'Semua item sudah diterima dan lokasi asset sudah diperbarui.',
    approval_note: 'Closed successfully.',
    current_step: 'Completed & posted',
    eta: 'Completed',
  },
  {
    id: 5,
    number: 'TRF-2026-075',
    from: 'Branch North',
    to: 'HQ Warehouse',
    purpose: 'Asset return',
    status: 'SUBMITTED',
    transfer_date: '28 Jul 2026',
    requested_by: 'Branch Admin',
    approver: 'Asset Controller',
    asset_count: '5',
    receiving_pic: 'Warehouse Return Desk',
    route_note: 'Menunggu approval dan penjadwalan inbound.',
    approval_note: 'Harus cek kondisi fisik saat penerimaan.',
    current_step: 'Approval queue',
    eta: '30 Jul 2026',
  },
  {
    id: 6,
    number: 'TRF-2026-076',
    from: 'Branch East',
    to: 'Site C',
    purpose: 'Short term relocation',
    status: 'APPROVED',
    transfer_date: '27 Jul 2026',
    requested_by: 'Project Admin',
    approver: 'Regional Ops Lead',
    asset_count: '3',
    receiving_pic: 'Site C Coordinator',
    route_note: 'Approved, asset akan dikirim bersama shipment reguler sore ini.',
    approval_note: 'Pastikan item kembali ke origin setelah project selesai.',
    current_step: 'Dispatch arrangement',
    eta: '28 Jul 2026',
  },
]

const selectedTransferId = ref<string>('1')
const defaultSelectedTransfer = rows[0]!
const selectedTransfer = computed<TransferRow>(
  () => rows.find((item) => String(item.id) === selectedTransferId.value) ?? defaultSelectedTransfer,
)

const transferMixOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Draft', 'Submitted', 'Approved', 'Completed'],
  colors: ['#94a3b8', '#38bdf8', '#8b5cf6', '#22c55e'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const transferMixSeries = [6, 9, 5, 12]

const transferItemRows = computed(() => {
  if (selectedTransfer.value.id === 1) {
    return [
      { label: 'AST-0001', value: 'Dell Latitude 7440', note: 'Packed, waiting approval release' },
      { label: 'AST-0007', value: 'Motorola Scanner MC33', note: 'Serial verified' },
      { label: 'AST-0012', value: 'Docking Station WD22', note: 'Accessory included' },
      { label: 'AST-0013', value: 'UPS 1200VA', note: 'Battery checked' },
    ]
  }

  if (selectedTransfer.value.id === 3) {
    return [
      { label: 'AST-0003', value: 'Forklift FL-12', note: 'Corrective repair routing' },
      { label: 'AST-0088', value: 'Forklift Battery Pack', note: 'Included as supporting part' },
    ]
  }

  return [
    { label: 'AST-0042', value: 'Operational Asset Bundle', note: 'Grouped transfer item set' },
    { label: 'AST-0043', value: 'Peripheral Set', note: 'Check physical receipt on arrival' },
  ]
})

const workflowItems = computed(() => {
  const id = selectedTransfer.value.id

  if (selectedTransfer.value.status === 'DRAFT') {
    return [
      {
        label: 'Move to Submitted',
        detail: 'Ajukan draft ke approver agar transfer masuk queue persetujuan.',
        to: `/transfers/${id}/workflow/submit`,
        icon: 'Send',
        tone: 'border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
      },
    ]
  }

  if (selectedTransfer.value.status === 'SUBMITTED') {
    return [
      {
        label: 'Move to Approved',
        detail: 'Setujui transfer agar asset bisa di-dispatch ke lokasi tujuan.',
        to: `/transfers/${id}/workflow/approve`,
        icon: 'BadgeCheck',
        tone: 'border-violet-200 bg-violet-50/70 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200',
      },
    ]
  }

  if (selectedTransfer.value.status === 'APPROVED') {
    return [
      {
        label: 'Move to Completed',
        detail: 'Tutup transfer setelah penerimaan dan update lokasi selesai.',
        to: `/transfers/${id}/workflow/complete`,
        icon: 'PackageCheck',
        tone: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
      },
    ]
  }

  return [
    {
      label: 'Transfer Completed',
      detail: 'Dokumen transfer ini sudah selesai dan tercatat di histori lokasi.',
      to: `/transfers/${id}/edit`,
      icon: 'CircleCheckBig',
      tone: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
    },
  ]
})

const statusDetailRows = computed(() => [
  { label: 'Current Step', value: selectedTransfer.value.current_step, note: 'Posisi proses saat ini di workflow transfer' },
  { label: 'Requested By', value: selectedTransfer.value.requested_by, note: 'Pemilik request awal' },
  { label: 'Approver', value: selectedTransfer.value.approver, note: 'PIC approval aktif' },
  { label: 'Receiving PIC', value: selectedTransfer.value.receiving_pic, note: 'PIC penerima di lokasi tujuan' },
  { label: 'ETA / Completion', value: selectedTransfer.value.eta, note: 'Target penyelesaian transfer' },
])

const handleDeleteTransfer = async (row: Record<string, unknown>) => {
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
        title="Transfer Queue"
        :rows="rows"
        :columns="columns"
        :selected-row-id="selectedTransferId"
        :clickable-rows="true"
        :actions="[
          { label: 'Create New', to: '/transfers/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/transfers/${row.id}/edit`,
          deleteTitle: 'Delete Transfer',
          resolveRowLabel: (row) => String(row.number ?? row.id),
          deleteMessage: (row) => `Transfer ${String(row.number ?? row.id)} akan dihapus dari queue. Pastikan draft atau histori ini memang aman untuk dihapus.`,
          onDelete: handleDeleteTransfer,
        }"
        search-placeholder="Cari nomor transfer, lokasi, atau purpose..."
        :search-keys="['number', 'from', 'to', 'purpose', 'requested_by']"
        @select="selectedTransferId = String($event.id)"
      />

      <div class="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard :title="`${selectedTransfer.number} - ${selectedTransfer.purpose}`">
          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Route</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">From:</span> {{ selectedTransfer.from }}</p>
                <p><span class="font-medium">To:</span> {{ selectedTransfer.to }}</p>
                <p><span class="font-medium">Transfer Date:</span> {{ selectedTransfer.transfer_date }}</p>
              </div>
            </div>

            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Workflow</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Status:</span> {{ formatEnumLabel(selectedTransfer.status) }}</p>
                <p><span class="font-medium">Current Step:</span> {{ selectedTransfer.current_step }}</p>
                <p><span class="font-medium">Asset Items:</span> {{ selectedTransfer.asset_count }}</p>
              </div>
            </div>

            <DetailHighlightCard
              eyebrow="Route Note"
              :status-label="formatEnumLabel(selectedTransfer.status)"
              :note="selectedTransfer.route_note"
              :icon="selectedTransfer.status === 'COMPLETED' ? 'CircleCheckBig' : selectedTransfer.status === 'APPROVED' ? 'BadgeCheck' : 'ArrowRightLeft'"
              :tone="
                selectedTransfer.status === 'DRAFT'
                  ? 'border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-slate-950/40'
                  : selectedTransfer.status === 'SUBMITTED'
                    ? 'border-sky-200 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/10'
                    : selectedTransfer.status === 'APPROVED'
                      ? 'border-violet-200 bg-violet-50/80 dark:border-violet-500/20 dark:bg-violet-500/10'
                      : 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10'
              "
              :badge-tone="
                selectedTransfer.status === 'DRAFT'
                  ? 'bg-slate-200/80 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                  : selectedTransfer.status === 'SUBMITTED'
                    ? 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200'
                    : selectedTransfer.status === 'APPROVED'
                      ? 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200'
                      : 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
              "
            />
          </div>
        </SectionCard>

        <SectionCard title="Approval & Receiving Detail">
          <div class="space-y-3">
            <div
              v-for="row in statusDetailRows"
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
        <SectionCard title="Transfer Item Detail">
          <div class="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10">
            <div
              v-for="item in transferItemRows"
              :key="item.label"
              class="grid gap-2 border-b border-slate-200/70 bg-white/80 px-4 py-4 last:border-b-0 dark:border-white/8 dark:bg-slate-900/50 md:grid-cols-[0.8fr_1.2fr_1.3fr]"
            >
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.label }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ item.value }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.note }}</p>
            </div>
          </div>
        </SectionCard>

        <div class="space-y-6">
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

          <SectionCard title="Transfer Stage Mix">
            <BaseChart type="donut" :height="320" :options="transferMixOptions" :series="transferMixSeries" />
          </SectionCard>
        </div>
      </div>
    </section>
  </div>
</template>
