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
import { maintenanceContractRecords } from '@/data/master-data'
import { liveSeedIds } from '@/data/liveSeedIds'
import { getCrudConfig } from '@/config/crud'
import { deleteCrudRecord } from '@/services/crud'
import type { DataTableColumn, MetricCardItem } from '@/types/app'
import { formatEnumLabel } from '@/utils/formatters'

const crudConfig = getCrudConfig('assets')!

interface AssetRow extends Record<string, unknown> {
  id: number
  asset_id: string
  asset_code: string
  asset_name: string
  category: string
  vendor: string
  location: string
  last_maintenance: string
  status: string
  attention: string
  maintenance_mode: string
  maintenance_sla: string
  warning_detail: string
  contract_detail: string
  downtime: string
  assigned_team: string
  lifecycle_score: string
  maintenance_request_id: string
  asset_transfer_id: string
  stocktake_session_id: string
  lease_contract_id: string
}

const metrics: MetricCardItem[] = [
  {
    title: 'Registered Assets',
    value: '4,982',
    icon: 'PackageSearch',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Dynamic Attributes',
    value: '126',
    icon: 'SlidersHorizontal',
    tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
  },
  {
    title: 'Replacement Review',
    value: '58',
    icon: 'RefreshCw',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
]

const assetColumns: DataTableColumn[] = [
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'category', label: 'Category' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'location', label: 'Location' },
  { key: 'last_maintenance', label: 'Last Maintenance' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      ACTIVE: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      MAINTENANCE: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      RETIRED: 'bg-slate-400/20 text-slate-700 ring-slate-300/50 dark:text-slate-200',
    },
  },
  {
    key: 'attention',
    label: 'Warning',
    type: 'badge',
    toneMap: {
      NONE: 'bg-slate-200/80 text-slate-700 ring-slate-300/70 dark:bg-slate-800 dark:text-slate-200',
      PREDICTIVE: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      CONTRACT: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      MULTI: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
    },
  },
]

const assetRows: AssetRow[] = [
  {
    id: 1, asset_code: 'AST-0001', asset_name: 'Dell Latitude 7440', category: 'Laptop', vendor: 'PT Dell Indonesia', location: 'HQ - IT Room',
    last_maintenance: '18 Jul 2026', status: 'ACTIVE', attention: 'PREDICTIVE', maintenance_mode: 'Preventive',
    maintenance_sla: '7 days', warning_detail: 'Battery health turun 17% dalam 45 hari terakhir.', contract_detail: 'Lease aktif sampai 31 Dec 2026.',
    downtime: '0.5 h', assigned_team: 'IT Endpoint Team', lifecycle_score: '82/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-001',
  },
  {
    id: 2, asset_code: 'AST-0002', asset_name: 'Toyota Hilux 2.4', category: 'Vehicle', vendor: 'PT Astra Mobility', location: 'Site A',
    last_maintenance: '30 Jun 2026', status: 'ACTIVE', attention: 'CONTRACT', maintenance_mode: 'Vendor Contract',
    maintenance_sla: '48 h', warning_detail: 'Kontrak servis kendaraan berakhir 14 Aug 2026.', contract_detail: 'Maintenance contract MC-2026-002 segera berakhir.',
    downtime: '1.2 h', assigned_team: 'Fleet Operations', lifecycle_score: '88/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-002',
  },
  {
    id: 3, asset_code: 'AST-0003', asset_name: 'Forklift FL-12', category: 'Heavy Equipment', vendor: 'PT Mekar Service Solusi', location: 'Warehouse North',
    last_maintenance: '22 Jul 2026', status: 'MAINTENANCE', attention: 'MULTI', maintenance_mode: 'Corrective',
    maintenance_sla: '24 h', warning_detail: 'Vibration anomaly dan kontrak support corrective tinggal 12 hari.', contract_detail: 'MC-2026-014 berakhir 09 Aug 2026.',
    downtime: '8.5 h', assigned_team: 'Mechanical Team A', lifecycle_score: '61/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-003',
  },
  {
    id: 4, asset_code: 'AST-0004', asset_name: 'Epson EB-L210SW', category: 'Projector', vendor: 'PT Solusi Office', location: 'Training Room',
    last_maintenance: '11 Jul 2026', status: 'ACTIVE', attention: 'NONE', maintenance_mode: 'Scheduled PM',
    maintenance_sla: '14 days', warning_detail: 'Tidak ada warning aktif.', contract_detail: 'Coverage vendor stabil.',
    downtime: '0 h', assigned_team: 'General Affairs', lifecycle_score: '90/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-004',
  },
  {
    id: 5, asset_code: 'AST-0005', asset_name: 'CCTV Dome Lobby A', category: 'Security Device', vendor: 'PT Infra Network Nusantara', location: 'Main Lobby',
    last_maintenance: '20 Jul 2026', status: 'ACTIVE', attention: 'PREDICTIVE', maintenance_mode: 'Preventive',
    maintenance_sla: '72 h', warning_detail: 'Signal packet loss naik 11% minggu ini.', contract_detail: 'Support vendor aktif sampai 31 Mar 2027.',
    downtime: '0.3 h', assigned_team: 'Infra Support', lifecycle_score: '79/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-005',
  },
  {
    id: 6, asset_code: 'AST-0006', asset_name: 'HP LaserJet M507', category: 'Printer', vendor: 'PT Solusi Office', location: 'Finance Office',
    last_maintenance: '09 Jul 2026', status: 'MAINTENANCE', attention: 'NONE', maintenance_mode: 'Corrective',
    maintenance_sla: '36 h', warning_detail: 'Sedang dalam work order penggantian roller.', contract_detail: 'Tidak ada kontrak yang mendesak.',
    downtime: '3.8 h', assigned_team: 'Office Support', lifecycle_score: '74/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-006',
  },
  {
    id: 7, asset_code: 'AST-0007', asset_name: 'Motorola Scanner MC33', category: 'Scanner', vendor: 'PT Dell Indonesia', location: 'Warehouse South',
    last_maintenance: '24 Jul 2026', status: 'ACTIVE', attention: 'NONE', maintenance_mode: 'Preventive',
    maintenance_sla: '5 days', warning_detail: 'Tidak ada warning aktif.', contract_detail: 'Warranty masih aktif sampai Q1 2027.',
    downtime: '0 h', assigned_team: 'Warehouse Systems', lifecycle_score: '86/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-007',
  },
  {
    id: 8, asset_code: 'AST-0008', asset_name: 'Cisco Catalyst 9300', category: 'Network Device', vendor: 'PT Infra Network Nusantara', location: 'Data Center',
    last_maintenance: '03 Jul 2026', status: 'RETIRED', attention: 'CONTRACT', maintenance_mode: 'Vendor Contract',
    maintenance_sla: 'N/A', warning_detail: 'Vendor end-of-support mendekati batas migrasi.', contract_detail: 'Vendor support end date 31 Oct 2026.',
    downtime: '0 h', assigned_team: 'Network Core Team', lifecycle_score: '52/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-008',
  },
]

const statusChartOptions: ApexOptions = {
  chart: { type: 'bar', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#22c55e'],
  plotOptions: { bar: { borderRadius: 6, horizontal: true } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Active', 'Maintenance', 'Available', 'Retired'],
    labels: { style: { colors: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8'] } },
  },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)' },
}

const statusChartSeries = [{ name: 'Assets', data: [3450, 622, 710, 200] }]
const expiringContracts = maintenanceContractRecords.filter((item) => item.endDate <= '2026-08-15')
const selectedAssetId = ref<string>('1')
const defaultSelectedAsset = assetRows[0]!
const selectedAsset = computed<AssetRow>(
  () => assetRows.find((item) => String(item.id) === selectedAssetId.value) ?? defaultSelectedAsset,
)
const warningRows = computed(() => [
  { label: 'Current Warning', value: selectedAsset.value.attention, note: selectedAsset.value.warning_detail },
  { label: 'Contract Note', value: selectedAsset.value.vendor, note: selectedAsset.value.contract_detail },
  { label: 'Maintenance Mode', value: selectedAsset.value.maintenance_mode, note: `SLA target ${selectedAsset.value.maintenance_sla}` },
])
const operationalRows = computed(() => [
  { label: 'Assigned Team', value: selectedAsset.value.assigned_team, note: 'Tim penanggung jawab aktif' },
  { label: 'Downtime', value: selectedAsset.value.downtime, note: 'Akumulasi downtime periode aktif' },
  { label: 'Lifecycle Score', value: selectedAsset.value.lifecycle_score, note: 'Penilaian kesehatan lifecycle asset' },
])
const assetRelatedActions = computed(() => [
  {
    label: 'Update Asset',
    to: `/asset-registry/${selectedAsset.value.id}/edit`,
    icon: 'PencilLine',
    tone: 'primary',
  },
  {
    label: 'Request Maintenance',
    to: `/maintenance/new?asset_id=${encodeURIComponent(selectedAsset.value.asset_id)}&asset_code=${encodeURIComponent(selectedAsset.value.asset_code)}&asset_name=${encodeURIComponent(selectedAsset.value.asset_name)}&request_date=2026-07-28&notes=${encodeURIComponent(`Follow-up asset ${selectedAsset.value.asset_code}`)}`,
    icon: 'Wrench',
    tone: 'secondary',
  },
  {
    label: 'Update Maintenance',
    to: `/maintenance/${selectedAsset.value.maintenance_request_id}/edit?asset_id=${encodeURIComponent(selectedAsset.value.asset_id)}&asset_code=${encodeURIComponent(selectedAsset.value.asset_code)}&asset_name=${encodeURIComponent(selectedAsset.value.asset_name)}`,
    icon: 'PencilRuler',
    tone: 'secondary',
  },
  {
    label: 'Create Transfer',
    to: `/transfers/new?asset_id=${encodeURIComponent(selectedAsset.value.asset_id)}&asset_code=${encodeURIComponent(selectedAsset.value.asset_code)}&asset_name=${encodeURIComponent(selectedAsset.value.asset_name)}&from_location=${encodeURIComponent(selectedAsset.value.location)}&requested_by=${encodeURIComponent(selectedAsset.value.assigned_team)}&notes=${encodeURIComponent(`Transfer initiated for ${selectedAsset.value.asset_code}`)}`,
    icon: 'ArrowRightLeft',
    tone: 'secondary',
  },
  {
    label: 'Update Transfer',
    to: `/transfers/${selectedAsset.value.asset_transfer_id}/edit?asset_id=${encodeURIComponent(selectedAsset.value.asset_id)}&asset_code=${encodeURIComponent(selectedAsset.value.asset_code)}&asset_name=${encodeURIComponent(selectedAsset.value.asset_name)}&from_location=${encodeURIComponent(selectedAsset.value.location)}`,
    icon: 'Route',
    tone: 'secondary',
  },
  {
    label: 'Update Lease Contract',
    to: `/leases/${selectedAsset.value.lease_contract_id}/edit?scope_summary=${encodeURIComponent(`Coverage for asset ${selectedAsset.value.asset_name}`)}`,
    icon: 'FilePenLine',
    tone: 'secondary',
  },
  {
    label: 'Start Stocktake',
    to: `/tracking/new?asset_id=${encodeURIComponent(selectedAsset.value.asset_id)}&asset_code=${encodeURIComponent(selectedAsset.value.asset_code)}&asset_name=${encodeURIComponent(selectedAsset.value.asset_name)}&location=${encodeURIComponent(selectedAsset.value.location)}&notes=${encodeURIComponent(`Stocktake follow-up for asset ${selectedAsset.value.asset_code}`)}`,
    icon: 'QrCode',
    tone: 'secondary',
  },
  {
    label: 'Update Stocktake',
    to: `/tracking/${selectedAsset.value.stocktake_session_id}/edit?asset_id=${encodeURIComponent(selectedAsset.value.asset_id)}&asset_code=${encodeURIComponent(selectedAsset.value.asset_code)}&asset_name=${encodeURIComponent(selectedAsset.value.asset_name)}&location=${encodeURIComponent(selectedAsset.value.location)}`,
    icon: 'ScanLine',
    tone: 'secondary',
  },
])

const handleDeleteAsset = async (row: Record<string, unknown>) => {
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
        title="Asset Registry Table"
        :rows="assetRows"
        :columns="assetColumns"
        :selected-row-id="selectedAssetId"
        :clickable-rows="true"
        :actions="[
          { label: 'Create New', to: '/asset-registry/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/asset-registry/${row.id}/edit`,
          deleteTitle: 'Delete Asset',
          resolveRowLabel: (row) => String(row.asset_code ?? row.asset_name ?? row.id),
          deleteMessage: (row) => `Asset ${String(row.asset_name ?? row.asset_code ?? row.id)} akan dihapus dari daftar. Pastikan data ini memang tidak dibutuhkan lagi.`,
          onDelete: handleDeleteAsset,
        }"
        search-placeholder="Cari asset code, asset name, category, atau location..."
        :search-keys="['asset_code', 'asset_name', 'category', 'location', 'vendor']"
        @select="selectedAssetId = String($event.id)"
      />

      <div class="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <SectionCard :title="`${selectedAsset.asset_code} - ${selectedAsset.asset_name}`">
          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Classification</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Category:</span> {{ selectedAsset.category }}</p>
                <p><span class="font-medium">Vendor:</span> {{ selectedAsset.vendor }}</p>
                <p><span class="font-medium">Location:</span> {{ selectedAsset.location }}</p>
              </div>
            </div>

            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
              <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Status</p>
              <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p><span class="font-medium">Current Status:</span> {{ formatEnumLabel(selectedAsset.status) }}</p>
                <p><span class="font-medium">Last Maintenance:</span> {{ selectedAsset.last_maintenance }}</p>
                <p><span class="font-medium">Maintenance Mode:</span> {{ selectedAsset.maintenance_mode }}</p>
              </div>
            </div>

            <DetailHighlightCard
              eyebrow="Warning"
              :status-label="formatEnumLabel(selectedAsset.attention)"
              :note="selectedAsset.warning_detail"
              :icon="selectedAsset.attention === 'CONTRACT' ? 'ShieldAlert' : selectedAsset.attention === 'NONE' ? 'CircleCheckBig' : 'TriangleAlert'"
              :tone="
                selectedAsset.attention === 'NONE'
                  ? 'border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-slate-950/40'
                  : selectedAsset.attention === 'PREDICTIVE'
                    ? 'border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10'
                    : selectedAsset.attention === 'CONTRACT'
                      ? 'border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10'
                      : 'border-violet-200 bg-violet-50/80 dark:border-violet-500/20 dark:bg-violet-500/10'
              "
              :badge-tone="
                selectedAsset.attention === 'NONE'
                  ? 'bg-slate-200/80 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                  : selectedAsset.attention === 'PREDICTIVE'
                    ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                    : selectedAsset.attention === 'CONTRACT'
                      ? 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200'
                      : 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200'
              "
            />
          </div>
        </SectionCard>

        <div class="space-y-6">
          <SectionCard title="Related Actions">
            <div class="grid gap-3">
              <RouterLink
                v-for="action in assetRelatedActions"
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

          <SectionCard title="Warning & Contract Detail">
            <div class="space-y-3">
              <div
                v-for="row in warningRows"
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

          <SectionCard title="Contract Watchlist">
            <div class="space-y-3">
              <div
                v-for="contract in expiringContracts"
                :key="contract.id"
                class="rounded-[22px] border border-rose-200 bg-rose-50/80 p-4 dark:border-rose-500/20 dark:bg-rose-500/10"
              >
                <p class="text-sm font-semibold text-rose-900 dark:text-rose-100">{{ contract.number }}</p>
                <p class="mt-1 text-sm text-rose-800 dark:text-rose-200">{{ contract.vendorName }}</p>
                <p class="mt-2 text-xs font-medium tracking-[0.18em] text-rose-600 uppercase dark:text-rose-300">
                  Expiring {{ contract.endDate }}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Operational Detail Rows">
          <div class="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10">
            <div
              v-for="row in operationalRows"
              :key="row.label"
              class="grid gap-2 border-b border-slate-200/70 bg-white/80 px-4 py-4 last:border-b-0 dark:border-white/8 dark:bg-slate-900/50 md:grid-cols-[0.9fr_0.8fr_1.3fr]"
            >
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ row.label }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">{{ row.value }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ row.note }}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Asset Status Split">
          <BaseChart type="bar" :height="300" :options="statusChartOptions" :series="statusChartSeries" />
        </SectionCard>
      </div>
    </section>
  </div>
</template>
