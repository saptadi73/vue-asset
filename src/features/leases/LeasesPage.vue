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

const crudConfig = getCrudConfig('leases')!

interface LeaseRow extends Record<string, unknown> {
  id: number
  contract: string
  vendor: string
  period: string
  status: 'ACTIVE' | 'REVIEW' | 'CLOSED'
  payment: string
  contract_type: string
  renewal_window: string
  owner: string
  scope_note: string
  monthly_payment: string
  next_due_date: string
  payment_cycle: string
  payment_status: string
  contract_note: string
}

interface LeaseAssetDetail {
  id: number
  asset_code: string
  asset_name: string
  lease_period: string
  cost_center: string
  note: string
}

interface LeasePaymentDetail {
  id: number
  invoice: string
  period: string
  due_date: string
  amount: string
  status: 'PLANNED' | 'DUE' | 'PAID'
}

interface LeaseAssetFormState {
  id: number | null
  asset_code: string
  asset_name: string
  lease_period: string
  cost_center: string
  note: string
}

interface LeasePaymentFormState {
  id: number | null
  invoice: string
  period: string
  due_date: string
  amount: string
  status: LeasePaymentDetail['status']
}

const metrics: MetricCardItem[] = [
  {
    title: 'Active Contracts',
    value: '14',
    icon: 'FileClock',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Due This Month',
    value: '4',
    icon: 'CalendarClock',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
  {
    title: 'Monthly Spend',
    value: 'Rp182 jt',
    icon: 'WalletCards',
    tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
  },
]

const columns: DataTableColumn[] = [
  { key: 'contract', label: 'Contract' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'period', label: 'Period' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      ACTIVE: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      REVIEW: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      CLOSED: 'bg-slate-300/70 text-slate-700 ring-slate-300/50 dark:bg-slate-800 dark:text-slate-200',
    },
  },
  { key: 'payment', label: 'Payment' },
]

const paymentStatusTone: Record<LeasePaymentDetail['status'], string> = {
  PLANNED: 'bg-slate-200/80 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700',
  DUE: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  PAID: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
}

const rows: LeaseRow[] = [
  {
    id: 1,
    contract: 'LS-2026-001',
    vendor: 'PT Sarana Mobilitas',
    period: '01 Jul 2026 - 31 Dec 2026',
    status: 'ACTIVE',
    payment: 'Rp42 jt',
    contract_type: 'Vehicle Lease',
    renewal_window: 'Review before 15 Dec 2026',
    owner: 'Fleet Operations',
    scope_note: 'Kontrak untuk kendaraan operasional site dan driver support terbatas.',
    monthly_payment: 'Rp42.000.000',
    next_due_date: '05 Aug 2026',
    payment_cycle: 'Monthly',
    payment_status: 'Invoice Jul sudah diverifikasi, invoice Aug menunggu terbit.',
    contract_note: 'Coverage asuransi masih aktif dan tidak ada addendum terbuka.',
  },
  {
    id: 2,
    contract: 'LS-2026-002',
    vendor: 'PT Solusi Office',
    period: '01 Jan 2026 - 31 Jul 2026',
    status: 'REVIEW',
    payment: 'Rp18 jt',
    contract_type: 'Office Equipment Lease',
    renewal_window: 'Renewal discussion this week',
    owner: 'General Affairs',
    scope_note: 'Projector, printer, dan meeting room device untuk kantor pusat.',
    monthly_payment: 'Rp18.000.000',
    next_due_date: '31 Jul 2026',
    payment_cycle: 'Monthly',
    payment_status: 'Perlu keputusan extend atau close sebelum jatuh tempo akhir bulan.',
    contract_note: 'Ada opsi extension 6 bulan dengan kenaikan 3.5%.',
  },
  {
    id: 3,
    contract: 'LS-2026-003',
    vendor: 'PT Rental Teknologi',
    period: '01 Mar 2026 - 28 Feb 2027',
    status: 'ACTIVE',
    payment: 'Rp56 jt',
    contract_type: 'IT Device Lease',
    renewal_window: 'Quarterly utilization review',
    owner: 'IT Operations',
    scope_note: 'Laptop project team, scanner warehouse, dan beberapa docking station.',
    monthly_payment: 'Rp56.000.000',
    next_due_date: '03 Aug 2026',
    payment_cycle: 'Monthly',
    payment_status: 'Payment berjalan normal dan utilization asset tinggi.',
    contract_note: 'Tingkat utilisasi 91%, masih aman untuk coverage kontrak saat ini.',
  },
  {
    id: 4,
    contract: 'LS-2026-004',
    vendor: 'PT Logistic Equip',
    period: '01 Apr 2025 - 31 Mar 2026',
    status: 'CLOSED',
    payment: 'Rp23 jt',
    contract_type: 'Material Handling',
    renewal_window: 'Closed on 31 Mar 2026',
    owner: 'Warehouse Operations',
    scope_note: 'Forklift cadangan dan pallet mover periode FY sebelumnya.',
    monthly_payment: 'Rp23.000.000',
    next_due_date: '-',
    payment_cycle: 'Closed',
    payment_status: 'Seluruh pembayaran selesai dan dokumen closeout lengkap.',
    contract_note: 'Kontrak sudah ditutup, asset telah dikembalikan ke vendor.',
  },
]

const selectedLeaseId = ref<string>('1')
const defaultSelectedLease = rows[0]!
const selectedLease = computed<LeaseRow>(
  () => rows.find((item) => String(item.id) === selectedLeaseId.value) ?? defaultSelectedLease,
)

const leaseExposureOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#0ea5e9'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '44%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } },
  },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
}

const leaseExposureSeries = [{ name: 'Spend (jt)', data: [182, 176, 171, 168, 165, 160] }]

const summaryRows = computed(() => [
  { label: 'Contract Type', value: selectedLease.value.contract_type, note: 'Jenis kontrak untuk kebutuhan monitoring operasional.' },
  { label: 'Owner', value: selectedLease.value.owner, note: 'PIC internal pemilik kontrak dan reviewer utama.' },
  { label: 'Renewal Window', value: selectedLease.value.renewal_window, note: 'Panduan review sebelum renewal atau closeout.' },
  { label: 'Payment Cycle', value: selectedLease.value.payment_cycle, note: 'Frekuensi tagihan dan kontrol payment schedule.' },
])
const leaseRelatedActions = computed(() => [
  {
    label: 'Update Lease',
    to: `/leases/${selectedLease.value.id}/edit`,
    icon: 'PencilLine',
    tone: 'primary',
  },
  {
    label: 'Request Maintenance',
    to: `/maintenance/new?lease_contract_id=${encodeURIComponent(selectedLease.value.contract)}&lease_contract_number=${encodeURIComponent(selectedLease.value.contract)}&asset_name=${encodeURIComponent(selectedLease.value.scope_note)}&notes=${encodeURIComponent(`Maintenance follow-up for lease ${selectedLease.value.contract}`)}`,
    icon: 'Wrench',
    tone: 'secondary',
  },
  {
    label: 'Update Maintenance',
    to: `/maintenance/${liveSeedIds.maintenance_request_id}/edit?lease_contract_id=${encodeURIComponent(selectedLease.value.contract)}&lease_contract_number=${encodeURIComponent(selectedLease.value.contract)}&asset_name=${encodeURIComponent(selectedLease.value.scope_note)}`,
    icon: 'PencilRuler',
    tone: 'secondary',
  },
  {
    label: 'Create Transfer',
    to: `/transfers/new?notes=${encodeURIComponent(`Transfer coordination for lease ${selectedLease.value.contract}`)}`,
    icon: 'ArrowRightLeft',
    tone: 'secondary',
  },
  {
    label: 'Update Transfer',
    to: `/transfers/${liveSeedIds.asset_transfer_id}/edit?notes=${encodeURIComponent(`Transfer coordination for lease ${selectedLease.value.contract}`)}`,
    icon: 'Route',
    tone: 'secondary',
  },
  {
    label: 'Register Asset',
    to: `/asset-registry/new?predictive_warning=${encodeURIComponent(`Asset registered under lease ${selectedLease.value.contract}`)}`,
    icon: 'Boxes',
    tone: 'secondary',
  },
])

const leaseAssetsById = reactive<Record<number, LeaseAssetDetail[]>>({
  1: [
    { id: 101, asset_code: 'AST-TR-001', asset_name: 'Toyota Hilux 2.4', lease_period: 'Jul 2026 - Dec 2026', cost_center: 'Fleet Site A', note: 'Dipakai untuk operasional field dan site visit.' },
    { id: 102, asset_code: 'AST-TR-002', asset_name: 'Mitsubishi L300', lease_period: 'Jul 2026 - Dec 2026', cost_center: 'Fleet Warehouse', note: 'Support distribusi logistik internal.' },
  ],
  2: [
    { id: 201, asset_code: 'AST-OF-112', asset_name: 'Epson EB-L210SW', lease_period: 'Jan 2026 - Jul 2026', cost_center: 'Training Center', note: 'Perlu keputusan extend untuk semester berikutnya.' },
    { id: 202, asset_code: 'AST-OF-087', asset_name: 'HP LaserJet M507', lease_period: 'Jan 2026 - Jul 2026', cost_center: 'Finance Office', note: 'Sudah ada opsi buyout dari vendor.' },
  ],
  3: [
    { id: 301, asset_code: 'AST-IT-221', asset_name: 'Dell Latitude 7440', lease_period: 'Mar 2026 - Feb 2027', cost_center: 'IT Project Squad', note: 'Utilisasi tinggi, seat allocation penuh.' },
    { id: 302, asset_code: 'AST-IT-222', asset_name: 'Motorola Scanner MC33', lease_period: 'Mar 2026 - Feb 2027', cost_center: 'Warehouse Systems', note: 'Masih aktif untuk proses stocktake.' },
    { id: 303, asset_code: 'AST-IT-223', asset_name: 'Docking Station WD22', lease_period: 'Mar 2026 - Feb 2027', cost_center: 'IT Shared Device', note: 'Aset pendukung hybrid workstation.' },
  ],
  4: [{ id: 401, asset_code: 'AST-WH-510', asset_name: 'Forklift FL-10', lease_period: 'Apr 2025 - Mar 2026', cost_center: 'Warehouse Ops', note: 'Kontrak closed dan unit sudah direturn.' }],
})

const leasePaymentsById = reactive<Record<number, LeasePaymentDetail[]>>({
  1: [
    { id: 1001, invoice: 'INV-LS-001-07', period: 'Jul 2026', due_date: '05 Aug 2026', amount: 'Rp42.000.000', status: 'DUE' },
    { id: 1002, invoice: 'INV-LS-001-06', period: 'Jun 2026', due_date: '05 Jul 2026', amount: 'Rp42.000.000', status: 'PAID' },
  ],
  2: [
    { id: 2001, invoice: 'INV-LS-002-07', period: 'Jul 2026', due_date: '31 Jul 2026', amount: 'Rp18.000.000', status: 'DUE' },
    { id: 2002, invoice: 'INV-LS-002-06', period: 'Jun 2026', due_date: '30 Jun 2026', amount: 'Rp18.000.000', status: 'PAID' },
  ],
  3: [
    { id: 3001, invoice: 'INV-LS-003-08', period: 'Aug 2026', due_date: '03 Aug 2026', amount: 'Rp56.000.000', status: 'PLANNED' },
    { id: 3002, invoice: 'INV-LS-003-07', period: 'Jul 2026', due_date: '03 Jul 2026', amount: 'Rp56.000.000', status: 'PAID' },
  ],
  4: [{ id: 4001, invoice: 'INV-LS-004-03', period: 'Mar 2026', due_date: '31 Mar 2026', amount: 'Rp23.000.000', status: 'PAID' }],
})

const leaseAssets = computed<LeaseAssetDetail[]>(() => leaseAssetsById[selectedLease.value.id] ?? [])
const leasePayments = computed<LeasePaymentDetail[]>(() => leasePaymentsById[selectedLease.value.id] ?? [])

const assetForm = reactive<LeaseAssetFormState>({
  id: null,
  asset_code: '',
  asset_name: '',
  lease_period: '',
  cost_center: '',
  note: '',
})

const paymentForm = reactive<LeasePaymentFormState>({
  id: null,
  invoice: '',
  period: '',
  due_date: '',
  amount: '',
  status: 'PLANNED',
})

const assetEditorMode = ref<'create' | 'edit' | null>(null)
const paymentEditorMode = ref<'create' | 'edit' | null>(null)
const childDeleteTarget = ref<{ type: 'asset' | 'payment'; id: number } | null>(null)

const resetAssetForm = () => {
  assetForm.id = null
  assetForm.asset_code = ''
  assetForm.asset_name = ''
  assetForm.lease_period = ''
  assetForm.cost_center = ''
  assetForm.note = ''
}

const resetPaymentForm = () => {
  paymentForm.id = null
  paymentForm.invoice = ''
  paymentForm.period = ''
  paymentForm.due_date = ''
  paymentForm.amount = ''
  paymentForm.status = 'PLANNED'
}

const startCreateAsset = () => {
  resetAssetForm()
  assetEditorMode.value = 'create'
}

const startEditAsset = (item: LeaseAssetDetail) => {
  assetForm.id = item.id
  assetForm.asset_code = item.asset_code
  assetForm.asset_name = item.asset_name
  assetForm.lease_period = item.lease_period
  assetForm.cost_center = item.cost_center
  assetForm.note = item.note
  assetEditorMode.value = 'edit'
}

const saveAsset = () => {
  const targetRows = leaseAssetsById[selectedLease.value.id] ?? (leaseAssetsById[selectedLease.value.id] = [])
  const payload: LeaseAssetDetail = {
    id: assetForm.id ?? Date.now(),
    asset_code: assetForm.asset_code,
    asset_name: assetForm.asset_name,
    lease_period: assetForm.lease_period,
    cost_center: assetForm.cost_center,
    note: assetForm.note,
  }

  if (assetEditorMode.value === 'edit' && assetForm.id !== null) {
    const index = targetRows.findIndex((item) => item.id === assetForm.id)
    if (index >= 0) targetRows[index] = payload
  } else {
    targetRows.unshift(payload)
  }

  resetAssetForm()
  assetEditorMode.value = null
}

const startCreatePayment = () => {
  resetPaymentForm()
  paymentEditorMode.value = 'create'
}

const startEditPayment = (item: LeasePaymentDetail) => {
  paymentForm.id = item.id
  paymentForm.invoice = item.invoice
  paymentForm.period = item.period
  paymentForm.due_date = item.due_date
  paymentForm.amount = item.amount
  paymentForm.status = item.status
  paymentEditorMode.value = 'edit'
}

const savePayment = () => {
  const targetRows = leasePaymentsById[selectedLease.value.id] ?? (leasePaymentsById[selectedLease.value.id] = [])
  const payload: LeasePaymentDetail = {
    id: paymentForm.id ?? Date.now(),
    invoice: paymentForm.invoice,
    period: paymentForm.period,
    due_date: paymentForm.due_date,
    amount: paymentForm.amount,
    status: paymentForm.status,
  }

  if (paymentEditorMode.value === 'edit' && paymentForm.id !== null) {
    const index = targetRows.findIndex((item) => item.id === paymentForm.id)
    if (index >= 0) targetRows[index] = payload
  } else {
    targetRows.unshift(payload)
  }

  resetPaymentForm()
  paymentEditorMode.value = null
}

const confirmChildDelete = () => {
  if (!childDeleteTarget.value) return

  if (childDeleteTarget.value.type === 'asset') {
    leaseAssetsById[selectedLease.value.id] = (leaseAssetsById[selectedLease.value.id] ?? []).filter(
      (item) => item.id !== childDeleteTarget.value?.id,
    )
  } else {
    leasePaymentsById[selectedLease.value.id] = (leasePaymentsById[selectedLease.value.id] ?? []).filter(
      (item) => item.id !== childDeleteTarget.value?.id,
    )
  }

  childDeleteTarget.value = null
}

const handleDeleteLease = async (row: Record<string, unknown>) => {
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
        title="Lease Contracts"
        :rows="rows"
        :columns="columns"
        :selected-row-id="selectedLeaseId"
        :clickable-rows="true"
        :actions="[
          { label: 'Create New', to: '/leases/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/leases/${row.id}/edit`,
          deleteTitle: 'Delete Lease Contract',
          resolveRowLabel: (row) => String(row.contract ?? row.id),
          deleteMessage: (row) => `Kontrak ${String(row.contract ?? row.id)} akan dihapus dari daftar lease. Pastikan dampak ke vendor dan histori payment sudah dicek.`,
          onDelete: handleDeleteLease,
        }"
        search-placeholder="Cari kontrak, vendor, atau periode..."
        :search-keys="['contract', 'vendor', 'period', 'status']"
        @select="selectedLeaseId = String($event.id)"
      />

      <div class="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard :title="`${selectedLease.contract} - ${selectedLease.vendor}`">
          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Contract Scope</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Period:</span> {{ selectedLease.period }}</p>
                <p><span class="font-medium">Type:</span> {{ selectedLease.contract_type }}</p>
                <p><span class="font-medium">Monthly Payment:</span> {{ selectedLease.monthly_payment }}</p>
              </div>
            </div>

            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Billing Pulse</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Next Due:</span> {{ selectedLease.next_due_date }}</p>
                <p><span class="font-medium">Cycle:</span> {{ selectedLease.payment_cycle }}</p>
                <p><span class="font-medium">Payment Status:</span> {{ selectedLease.payment_status }}</p>
              </div>
            </div>

            <DetailHighlightCard
              eyebrow="Contract Note"
              :status-label="formatEnumLabel(selectedLease.status)"
              :note="selectedLease.scope_note"
              icon="FileSpreadsheet"
              :tone="
                selectedLease.status === 'ACTIVE'
                  ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10'
                  : selectedLease.status === 'REVIEW'
                    ? 'border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10'
                    : 'border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-slate-950/40'
              "
              :badge-tone="
                selectedLease.status === 'ACTIVE'
                  ? 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
                  : selectedLease.status === 'REVIEW'
                    ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                    : 'bg-slate-200/80 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
              "
            />
          </div>
        </SectionCard>

        <div class="space-y-6">
          <SectionCard title="Related Actions">
            <div class="grid gap-3">
              <RouterLink
                v-for="action in leaseRelatedActions"
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

          <SectionCard title="Lease Summary">
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

          <SectionCard title="Lease Cost Projection">
            <BaseChart type="bar" :height="300" :options="leaseExposureOptions" :series="leaseExposureSeries" />
          </SectionCard>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Leased Asset Detail">
          <div class="mb-4 flex justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
              @click="startCreateAsset"
            >
              <BaseIcon name="Plus" :size="15" />
              Add Lease Asset
            </button>
          </div>
          <div class="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10">
            <div
              v-for="item in leaseAssets"
              :key="item.id"
              class="grid gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-4 last:border-b-0 dark:border-white/8 dark:bg-slate-900/50 md:grid-cols-[0.8fr_1.1fr_1fr_1fr_1fr_auto]"
            >
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.asset_code }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ item.asset_name }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ item.lease_period }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ item.cost_center }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.note }}</p>
              <div class="flex items-start justify-end gap-2">
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-800 transition hover:-translate-y-0.5 hover:border-sky-300 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
                  title="Update asset"
                  @click="startEditAsset(item)"
                >
                  <BaseIcon name="PencilLine" :size="16" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 transition hover:-translate-y-0.5 hover:border-rose-300 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                  title="Delete asset"
                  @click="childDeleteTarget = { type: 'asset', id: item.id }"
                >
                  <BaseIcon name="Trash2" :size="16" />
                </button>
              </div>
            </div>
          </div>

          <form
            v-if="assetEditorMode"
            class="mt-4 grid gap-4 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40 md:grid-cols-2"
            @submit.prevent="saveAsset"
          >
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Asset Code</label>
              <input v-model="assetForm.asset_code" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Asset Name</label>
              <input v-model="assetForm.asset_name" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Lease Period</label>
              <input v-model="assetForm.lease_period" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Cost Center</label>
              <input v-model="assetForm.cost_center" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div class="md:col-span-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Note</label>
              <textarea v-model="assetForm.note" rows="3" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div class="md:col-span-2 flex justify-end gap-3">
              <button type="button" class="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200" @click="assetEditorMode = null">
                Cancel
              </button>
              <button type="submit" class="rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white dark:border-sky-600 dark:bg-sky-600">
                {{ assetEditorMode === 'edit' ? 'Update Asset' : 'Create Asset' }}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Payment Schedule Detail">
          <div class="mb-4 flex justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
              @click="startCreatePayment"
            >
              <BaseIcon name="Plus" :size="15" />
              Add Payment Schedule
            </button>
          </div>
          <div class="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10">
            <div
              v-for="payment in leasePayments"
              :key="payment.id"
              class="grid gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-4 last:border-b-0 dark:border-white/8 dark:bg-slate-900/50 md:grid-cols-[0.9fr_0.8fr_0.8fr_0.9fr_0.8fr_auto]"
            >
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ payment.invoice }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ payment.period }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ payment.due_date }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ payment.amount }}</p>
              <span :class="['inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1', paymentStatusTone[payment.status]]">
                {{ payment.status }}
              </span>
              <div class="flex items-start justify-end gap-2">
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-800 transition hover:-translate-y-0.5 hover:border-sky-300 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200"
                  title="Update payment"
                  @click="startEditPayment(payment)"
                >
                  <BaseIcon name="PencilLine" :size="16" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 transition hover:-translate-y-0.5 hover:border-rose-300 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                  title="Delete payment"
                  @click="childDeleteTarget = { type: 'payment', id: payment.id }"
                >
                  <BaseIcon name="Trash2" :size="16" />
                </button>
              </div>
            </div>
          </div>

          <form
            v-if="paymentEditorMode"
            class="mt-4 grid gap-4 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40 md:grid-cols-2"
            @submit.prevent="savePayment"
          >
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Invoice</label>
              <input v-model="paymentForm.invoice" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Period</label>
              <input v-model="paymentForm.period" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Due Date</label>
              <input v-model="paymentForm.due_date" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Amount</label>
              <input v-model="paymentForm.amount" type="text" required class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white" />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
              <select v-model="paymentForm.status" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-white">
                <option value="PLANNED">Planned</option>
                <option value="DUE">Due</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            <div class="md:col-span-2 flex justify-end gap-3">
              <button type="button" class="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200" @click="paymentEditorMode = null">
                Cancel
              </button>
              <button type="submit" class="rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white dark:border-sky-600 dark:bg-sky-600">
                {{ paymentEditorMode === 'edit' ? 'Update Payment' : 'Create Payment' }}
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </section>

    <div
      v-if="childDeleteTarget"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-slate-900">
        <div class="flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            <BaseIcon name="ShieldAlert" :size="20" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-950 dark:text-white">Delete Detail Record</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Data detail {{ childDeleteTarget.type === 'asset' ? 'leased asset' : 'payment schedule' }} akan dihapus dari kontrak ini.
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
            @click="childDeleteTarget = null"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-full bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-500"
            @click="confirmChildDelete"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
