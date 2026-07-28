<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import DataTable from '@/components/DataTable.vue'
import DetailGridTable from '@/components/DetailGridTable.vue'
import DetailHighlightCard from '@/components/DetailHighlightCard.vue'
import DocumentStatusList from '@/components/DocumentStatusList.vue'
import MetricCard from '@/components/MetricCard.vue'
import RelatedActionsPanel from '@/components/RelatedActionsPanel.vue'
import SectionCard from '@/components/SectionCard.vue'
import { maintenanceContractRecords } from '@/data/master-data'
import { liveSeedIds } from '@/data/liveSeedIds'
import { getCrudConfig } from '@/config/crud'
import { deleteCrudRecord } from '@/services/crud'
import type { DataTableColumn, DetailGridColumn, DocumentReference, MetricCardItem, RelatedActionItem } from '@/types/app'
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
  lease_contract_number?: string
  maintenance_contract_number?: string
}

interface AssetLifecycleProfile {
  classUsefulLife: string
  latestReviewedRemainingLife: string
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  conditionScore: string
  riskScore: string
  reviewDate: string
  nextReviewDate: string
  replacementRecommendation: 'MAINTAIN' | 'REVIEW' | 'REPLACE'
  replacementStrategy: 'AGE_BASED' | 'CONDITION_BASED' | 'RISK_BASED' | 'MANUAL_REVIEW'
  expectedReplacementDate: string
  replacementPriority: 'LOW' | 'MEDIUM' | 'HIGH'
  replacementCost: string
  replacementBudgetYear: string
  supportEndDate: string
  vendorEndOfSaleDate: string
  vendorEndOfSupportDate: string
  retirementStatus: 'NOT_PLANNED' | 'PLANNED' | 'REQUESTED' | 'CONFIRMED'
  retirementDate: string
  retirementNote: string
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
    downtime: '0.5 h', assigned_team: 'IT Endpoint Team', lifecycle_score: '82/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-001', lease_contract_number: 'LS-2026-001',
  },
  {
    id: 2, asset_code: 'AST-0002', asset_name: 'Toyota Hilux 2.4', category: 'Vehicle', vendor: 'PT Astra Mobility', location: 'Site A',
    last_maintenance: '30 Jun 2026', status: 'ACTIVE', attention: 'CONTRACT', maintenance_mode: 'Vendor Contract',
    maintenance_sla: '48 h', warning_detail: 'Kontrak servis kendaraan berakhir 14 Aug 2026.', contract_detail: 'Maintenance contract MC-2026-002 segera berakhir.',
    downtime: '1.2 h', assigned_team: 'Fleet Operations', lifecycle_score: '88/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-002', maintenance_contract_number: 'MC-2026-002',
  },
  {
    id: 3, asset_code: 'AST-0003', asset_name: 'Forklift FL-12', category: 'Heavy Equipment', vendor: 'PT Mekar Service Solusi', location: 'Warehouse North',
    last_maintenance: '22 Jul 2026', status: 'MAINTENANCE', attention: 'MULTI', maintenance_mode: 'Corrective',
    maintenance_sla: '24 h', warning_detail: 'Vibration anomaly dan kontrak support corrective tinggal 12 hari.', contract_detail: 'MC-2026-014 berakhir 09 Aug 2026.',
    downtime: '8.5 h', assigned_team: 'Mechanical Team A', lifecycle_score: '61/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-003', lease_contract_number: 'LS-2026-003', maintenance_contract_number: 'MC-2026-014',
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
    downtime: '0.3 h', assigned_team: 'Infra Support', lifecycle_score: '79/100', asset_id: liveSeedIds.asset_id, maintenance_request_id: liveSeedIds.maintenance_request_id, asset_transfer_id: liveSeedIds.asset_transfer_id, stocktake_session_id: liveSeedIds.stocktake_session_id, lease_contract_id: 'lease-005', maintenance_contract_number: 'MC-2026-021',
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
const assetLifecycleProfiles: Record<string, AssetLifecycleProfile> = {
  'AST-0001': {
    classUsefulLife: '48 months',
    latestReviewedRemainingLife: '22 months',
    condition: 'GOOD',
    conditionScore: '82.00',
    riskScore: '34.20',
    reviewDate: '18 Jul 2026',
    nextReviewDate: '18 Oct 2026',
    replacementRecommendation: 'MAINTAIN',
    replacementStrategy: 'AGE_BASED',
    expectedReplacementDate: '31 May 2028',
    replacementPriority: 'LOW',
    replacementCost: 'Rp24.000.000',
    replacementBudgetYear: '2028',
    supportEndDate: '31 Dec 2026',
    vendorEndOfSaleDate: '31 Dec 2027',
    vendorEndOfSupportDate: '31 May 2028',
    retirementStatus: 'NOT_PLANNED',
    retirementDate: 'Belum ada',
    retirementNote: 'Masih dalam window produktif, cukup dipantau via preventive review.',
  },
  'AST-0002': {
    classUsefulLife: '96 months',
    latestReviewedRemainingLife: '12 months',
    condition: 'GOOD',
    conditionScore: '77.40',
    riskScore: '58.10',
    reviewDate: '12 Jul 2026',
    nextReviewDate: '14 Aug 2026',
    replacementRecommendation: 'REVIEW',
    replacementStrategy: 'MANUAL_REVIEW',
    expectedReplacementDate: '30 Jun 2027',
    replacementPriority: 'MEDIUM',
    replacementCost: 'Rp285.000.000',
    replacementBudgetYear: '2027',
    supportEndDate: '14 Aug 2026',
    vendorEndOfSaleDate: '31 Dec 2026',
    vendorEndOfSupportDate: '30 Jun 2027',
    retirementStatus: 'PLANNED',
    retirementDate: 'Target Q3 2027',
    retirementNote: 'Menunggu hasil review kontrak dan efisiensi biaya operasional armada.',
  },
  'AST-0003': {
    classUsefulLife: '84 months',
    latestReviewedRemainingLife: '8 months',
    condition: 'FAIR',
    conditionScore: '68.50',
    riskScore: '74.25',
    reviewDate: '27 Jul 2026',
    nextReviewDate: '15 Aug 2026',
    replacementRecommendation: 'REPLACE',
    replacementStrategy: 'RISK_BASED',
    expectedReplacementDate: '31 Jan 2027',
    replacementPriority: 'HIGH',
    replacementCost: 'Rp27.500.000',
    replacementBudgetYear: '2027',
    supportEndDate: '09 Aug 2026',
    vendorEndOfSaleDate: '31 Dec 2026',
    vendorEndOfSupportDate: '31 Jan 2027',
    retirementStatus: 'REQUESTED',
    retirementDate: 'Menunggu approval',
    retirementNote: 'Risk downtime naik, kandidat penggantian atau retirement setelah lifecycle review.',
  },
  'AST-0004': {
    classUsefulLife: '60 months',
    latestReviewedRemainingLife: '30 months',
    condition: 'GOOD',
    conditionScore: '90.10',
    riskScore: '22.40',
    reviewDate: '11 Jul 2026',
    nextReviewDate: '11 Jan 2027',
    replacementRecommendation: 'MAINTAIN',
    replacementStrategy: 'AGE_BASED',
    expectedReplacementDate: '31 Dec 2028',
    replacementPriority: 'LOW',
    replacementCost: 'Rp12.000.000',
    replacementBudgetYear: '2028',
    supportEndDate: '31 Dec 2027',
    vendorEndOfSaleDate: '30 Jun 2028',
    vendorEndOfSupportDate: '31 Dec 2028',
    retirementStatus: 'NOT_PLANNED',
    retirementDate: 'Belum ada',
    retirementNote: 'Kondisi stabil dan masih sesuai kebutuhan ruang training.',
  },
  'AST-0005': {
    classUsefulLife: '72 months',
    latestReviewedRemainingLife: '18 months',
    condition: 'GOOD',
    conditionScore: '79.00',
    riskScore: '49.30',
    reviewDate: '20 Jul 2026',
    nextReviewDate: '20 Sep 2026',
    replacementRecommendation: 'REVIEW',
    replacementStrategy: 'CONDITION_BASED',
    expectedReplacementDate: '31 Mar 2028',
    replacementPriority: 'MEDIUM',
    replacementCost: 'Rp5.500.000',
    replacementBudgetYear: '2028',
    supportEndDate: '31 Mar 2027',
    vendorEndOfSaleDate: '31 Dec 2027',
    vendorEndOfSupportDate: '31 Mar 2028',
    retirementStatus: 'NOT_PLANNED',
    retirementDate: 'Belum ada',
    retirementNote: 'Belum perlu retire, namun perlu review kualitas jaringan dan packet loss.',
  },
  'AST-0006': {
    classUsefulLife: '60 months',
    latestReviewedRemainingLife: '9 months',
    condition: 'FAIR',
    conditionScore: '63.70',
    riskScore: '61.00',
    reviewDate: '09 Jul 2026',
    nextReviewDate: '09 Aug 2026',
    replacementRecommendation: 'REVIEW',
    replacementStrategy: 'CONDITION_BASED',
    expectedReplacementDate: '30 Apr 2027',
    replacementPriority: 'MEDIUM',
    replacementCost: 'Rp4.800.000',
    replacementBudgetYear: '2027',
    supportEndDate: '20 Nov 2026',
    vendorEndOfSaleDate: '31 Jan 2027',
    vendorEndOfSupportDate: '30 Apr 2027',
    retirementStatus: 'PLANNED',
    retirementDate: 'Target Apr 2027',
    retirementNote: 'Menunggu hasil corrective maintenance untuk putuskan buy new atau extend usage.',
  },
  'AST-0007': {
    classUsefulLife: '48 months',
    latestReviewedRemainingLife: '20 months',
    condition: 'GOOD',
    conditionScore: '86.40',
    riskScore: '31.60',
    reviewDate: '24 Jul 2026',
    nextReviewDate: '24 Nov 2026',
    replacementRecommendation: 'MAINTAIN',
    replacementStrategy: 'AGE_BASED',
    expectedReplacementDate: '31 Mar 2028',
    replacementPriority: 'LOW',
    replacementCost: 'Rp8.200.000',
    replacementBudgetYear: '2028',
    supportEndDate: '31 Mar 2027',
    vendorEndOfSaleDate: '30 Sep 2027',
    vendorEndOfSupportDate: '31 Mar 2028',
    retirementStatus: 'NOT_PLANNED',
    retirementDate: 'Belum ada',
    retirementNote: 'Masih sehat dan utilisasi lapangan normal.',
  },
  'AST-0008': {
    classUsefulLife: '84 months',
    latestReviewedRemainingLife: '0 months',
    condition: 'POOR',
    conditionScore: '52.00',
    riskScore: '88.40',
    reviewDate: '27 Jul 2026',
    nextReviewDate: 'Selesai',
    replacementRecommendation: 'REPLACE',
    replacementStrategy: 'RISK_BASED',
    expectedReplacementDate: '31 Oct 2026',
    replacementPriority: 'HIGH',
    replacementCost: 'Rp95.000.000',
    replacementBudgetYear: '2026',
    supportEndDate: '31 Oct 2026',
    vendorEndOfSaleDate: '30 Jun 2026',
    vendorEndOfSupportDate: '31 Oct 2026',
    retirementStatus: 'CONFIRMED',
    retirementDate: '27 Jul 2026',
    retirementNote: 'Asset sudah retired dan masuk rencana migrasi perangkat pengganti.',
  },
}
const defaultLifecycleProfile = assetLifecycleProfiles['AST-0001']!
const selectedLifecycleProfile = computed<AssetLifecycleProfile>(() => assetLifecycleProfiles[selectedAsset.value.asset_code] ?? defaultLifecycleProfile)
const lifecycleSummaryRows = computed(() => [
  { label: 'Class Useful Life', value: selectedLifecycleProfile.value.classUsefulLife, note: `Latest reviewed remaining life ${selectedLifecycleProfile.value.latestReviewedRemainingLife}` },
  { label: 'Condition', value: selectedLifecycleProfile.value.condition, note: `Condition score ${selectedLifecycleProfile.value.conditionScore}` },
  { label: 'Lifecycle Risk Score', value: selectedLifecycleProfile.value.riskScore, note: `Review date ${selectedLifecycleProfile.value.reviewDate}` },
  { label: 'Last Review', value: selectedLifecycleProfile.value.reviewDate, note: `Next review ${selectedLifecycleProfile.value.nextReviewDate}` },
])
const lifecycleRecommendationRows = computed(() => [
  {
    label: 'Replacement Recommendation',
    value: selectedLifecycleProfile.value.replacementRecommendation,
    note: `Expected replacement ${selectedLifecycleProfile.value.expectedReplacementDate}`,
  },
  {
    label: 'Replacement Planning',
    value: selectedLifecycleProfile.value.replacementPriority,
    note: `${selectedLifecycleProfile.value.replacementStrategy} · Estimated replacement cost ${selectedLifecycleProfile.value.replacementCost} · Budget year ${selectedLifecycleProfile.value.replacementBudgetYear}`,
  },
  {
    label: 'Support Deadline',
    value: selectedLifecycleProfile.value.supportEndDate,
    note: `EOS ${selectedLifecycleProfile.value.vendorEndOfSaleDate} · EoSpt ${selectedLifecycleProfile.value.vendorEndOfSupportDate}`,
  },
  {
    label: 'Retirement Status',
    value: selectedLifecycleProfile.value.retirementStatus,
    note: `${selectedLifecycleProfile.value.retirementDate} - ${selectedLifecycleProfile.value.retirementNote}`,
  },
])
const assetManualDocuments = computed<DocumentReference[]>(() => {
  const documentMap: Record<string, DocumentReference[]> = {
    'AST-0001': [
      {
        id: 'asset-manual-ast-0001',
        label: 'Manual Book',
        fileName: 'AST-0001-manual.txt',
        href: '/documents/assets/AST-0001-manual.txt',
        note: 'Panduan setup, battery care, dan checklist preventive untuk unit utama.',
        kind: 'manual',
      },
    ],
    'AST-0005': [
      {
        id: 'asset-manual-ast-0005',
        label: 'Manual Book',
        fileName: 'AST-0005-manual.txt',
        href: '/documents/assets/AST-0005-manual.txt',
        note: 'Panduan mounting, konfigurasi jaringan, dan inspeksi CCTV.',
        kind: 'manual',
      },
    ],
  }

  return documentMap[selectedAsset.value.asset_code] ?? []
})
const leaseDocuments = computed<DocumentReference[]>(() => {
  const documentMap: Record<string, DocumentReference[]> = {
    'LS-2026-001': [
      {
        id: 'asset-lease-ls-2026-001',
        label: 'Lease Contract',
        fileName: 'LS-2026-001-contract.txt',
        href: '/documents/contracts/LS-2026-001-contract.txt',
        note: 'Dokumen lease untuk coverage laptop, billing, dan handover clause.',
        kind: 'contract',
      },
    ],
    'LS-2026-003': [
      {
        id: 'asset-lease-ls-2026-003',
        label: 'Lease Contract',
        fileName: 'LS-2026-003-contract.txt',
        href: '/documents/contracts/LS-2026-003-contract.txt',
        note: 'Dokumen lease perangkat IT dan review utilisasi asset terkait.',
        kind: 'contract',
      },
    ],
  }

  return selectedAsset.value.lease_contract_number ? (documentMap[selectedAsset.value.lease_contract_number] ?? []) : []
})
const maintenanceDocuments = computed<DocumentReference[]>(() => {
  const documentMap: Record<string, DocumentReference[]> = {
    'MC-2026-002': [
      {
        id: 'asset-maintenance-mc-2026-002',
        label: 'Maintenance Contract',
        fileName: 'MC-2026-002-contract.txt',
        href: '/documents/contracts/MC-2026-002-contract.txt',
        note: 'Kontrak fleet maintenance dengan SLA response 48 jam.',
        kind: 'contract',
      },
    ],
    'MC-2026-014': [
      {
        id: 'asset-maintenance-mc-2026-014',
        label: 'Maintenance Contract',
        fileName: 'MC-2026-014-contract.txt',
        href: '/documents/contracts/MC-2026-014-contract.txt',
        note: 'Kontrak corrective support dan cakupan spare part vendor.',
        kind: 'contract',
      },
    ],
  }

  return selectedAsset.value.maintenance_contract_number ? (documentMap[selectedAsset.value.maintenance_contract_number] ?? []) : []
})
const assetDocuments = computed<DocumentReference[]>(() => {
  const documents = [...assetManualDocuments.value, ...leaseDocuments.value, ...maintenanceDocuments.value]

  if (documents.length > 0) return documents

  return [
    {
      id: `asset-document-${selectedAsset.value.asset_code}`,
      label: 'Asset Document',
      note: 'Tidak ada manual book, lease contract, atau maintenance contract untuk asset ini.',
      kind: 'support',
    },
  ]
})
const operationalColumns: DetailGridColumn[] = [
  { key: 'label', label: 'Metric', valueClass: 'text-sm font-semibold text-slate-900 dark:text-white' },
  { key: 'value', label: 'Value' },
  { key: 'note', label: 'Context', valueClass: 'text-sm text-slate-500 dark:text-slate-400' },
]
const assetRelatedActions = computed<RelatedActionItem[]>(() => [
  {
    label: 'Update Asset',
    to: `/asset-registry/${selectedAsset.value.id}/edit`,
    icon: 'PencilLine',
    tone: 'primary',
  },
  {
    label: 'Open Lifecycle',
    to: `/assets/${selectedAsset.value.id}/lifecycle`,
    icon: 'RefreshCw',
    tone: 'secondary',
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

      <div class="grid items-start gap-6 xl:grid-cols-[1.15fr_1fr]">
        <div class="space-y-6">
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

          <div class="grid gap-6 2xl:grid-cols-[1.18fr_0.82fr]">
            <SectionCard title="Lifecycle">
              <div class="grid gap-4 md:grid-cols-3">
                <DetailHighlightCard
                  eyebrow="Lifecycle Review"
                  :status-label="selectedLifecycleProfile.replacementRecommendation"
                  :note="selectedLifecycleProfile.retirementNote"
                  :icon="
                    selectedLifecycleProfile.replacementRecommendation === 'REPLACE'
                      ? 'RefreshCw'
                      : selectedLifecycleProfile.replacementRecommendation === 'REVIEW'
                        ? 'FileSearch'
                        : 'ShieldCheck'
                  "
                  :tone="
                    selectedLifecycleProfile.replacementRecommendation === 'REPLACE'
                      ? 'border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10'
                      : selectedLifecycleProfile.replacementRecommendation === 'REVIEW'
                        ? 'border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10'
                        : 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10'
                  "
                  :badge-tone="
                    selectedLifecycleProfile.replacementRecommendation === 'REPLACE'
                      ? 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200'
                      : selectedLifecycleProfile.replacementRecommendation === 'REVIEW'
                        ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                        : 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
                  "
                />

                <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
                  <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Condition & Risk</p>
                  <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                    <p><span class="font-medium">Condition:</span> {{ selectedLifecycleProfile.condition }}</p>
                    <p><span class="font-medium">Condition Score:</span> {{ selectedLifecycleProfile.conditionScore }}</p>
                    <p><span class="font-medium">Lifecycle Risk Score:</span> {{ selectedLifecycleProfile.riskScore }}</p>
                  </div>
                </div>

                <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
                  <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Useful Life</p>
                  <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                    <p><span class="font-medium">Class Useful Life:</span> {{ selectedLifecycleProfile.classUsefulLife }}</p>
                    <p><span class="font-medium">Latest Reviewed Remaining Life:</span> {{ selectedLifecycleProfile.latestReviewedRemainingLife }}</p>
                    <p><span class="font-medium">Next Review:</span> {{ selectedLifecycleProfile.nextReviewDate }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-4 grid gap-4 lg:grid-cols-2">
                <div class="space-y-3">
                  <div
                    v-for="row in lifecycleSummaryRows"
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

                <div class="space-y-3">
                  <div
                    v-for="row in lifecycleRecommendationRows"
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
              </div>
            </SectionCard>

            <div class="space-y-6">
              <SectionCard title="Operational Detail Rows">
                <DetailGridTable :columns="operationalColumns" :rows="operationalRows" desktop-grid-class="md:grid-cols-[0.9fr_0.8fr_1.3fr] gap-2" row-key="label" />
              </SectionCard>

              <SectionCard title="Asset Status Split">
                <BaseChart type="bar" :height="300" :options="statusChartOptions" :series="statusChartSeries" />
              </SectionCard>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <SectionCard title="Related Actions">
            <RelatedActionsPanel :actions="assetRelatedActions" />
          </SectionCard>

          <SectionCard title="Asset Documents" description="Manual book, lease contract, dan maintenance contract untuk asset terpilih.">
            <DocumentStatusList :documents="assetDocuments" />
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

    </section>
  </div>
</template>
