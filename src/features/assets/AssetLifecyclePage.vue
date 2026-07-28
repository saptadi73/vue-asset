<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import DataTable from '@/components/DataTable.vue'
import DetailHighlightCard from '@/components/DetailHighlightCard.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import type { DataTableColumn, MetricCardItem } from '@/types/app'

interface AssetLifecycleRecord {
  id: number
  assetCode: string
  assetName: string
  category: string
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  classUsefulLife: number
  latestReviewedRemainingLife: number
  riskScore: number
  reviewDate: string
  nextReviewDate: string
  replacementRecommendation: 'MAINTAIN' | 'REVIEW' | 'REPLACE'
  replacementStrategy: 'AGE_BASED' | 'CONDITION_BASED' | 'RISK_BASED' | 'MANUAL_REVIEW'
  replacementPriority: 'LOW' | 'MEDIUM' | 'HIGH'
  expectedReplacementDate: string
  replacementBudgetYear: number
  estimatedReplacementCost: string
  supportEndDate: string
  vendorEndOfSaleDate: string
  vendorEndOfSupportDate: string
  retirementStatus: 'NOT_PLANNED' | 'PLANNED' | 'REQUESTED' | 'CONFIRMED'
  retirementDate: string
  retirementNote: string
}

interface LifecycleReviewRow extends Record<string, unknown> {
  id: number
  assetId: number
  reviewDate: string
  conditionScore: string
  remainingLifeMonths: number
  riskScore: string
  replacementRecommendation: 'MAINTAIN' | 'REVIEW' | 'REPLACE'
  estimatedReplacementCost: string
  reviewNotes: string
  reviewedBy: string
  approvedBy: string
}

interface RetirementRow extends Record<string, unknown> {
  id: number
  assetId: number
  retirementNumber: string
  retirementType: 'DISPOSAL' | 'TRADE_IN' | 'WRITE_OFF'
  requestDate: string
  effectiveDate: string
  status: 'REQUESTED' | 'APPROVED' | 'CONFIRMED'
  proceedsAmount: string
  buyerPartner: string
  reason: string
  sapRetirementDocEntry: string
}

const route = useRoute()
const activeSection = ref<'overview' | 'reviews' | 'replacement' | 'retirement' | 'finance'>('overview')

const lifecycleAssets: AssetLifecycleRecord[] = [
  {
    id: 1,
    assetCode: 'AST-0001',
    assetName: 'Dell Latitude 7440',
    category: 'Laptop',
    condition: 'GOOD',
    classUsefulLife: 48,
    latestReviewedRemainingLife: 22,
    riskScore: 34.2,
    reviewDate: '18 Jul 2026',
    nextReviewDate: '18 Oct 2026',
    replacementRecommendation: 'MAINTAIN',
    replacementStrategy: 'AGE_BASED',
    replacementPriority: 'LOW',
    expectedReplacementDate: '31 May 2028',
    replacementBudgetYear: 2028,
    estimatedReplacementCost: 'Rp24.000.000',
    supportEndDate: '31 Dec 2026',
    vendorEndOfSaleDate: '31 Dec 2027',
    vendorEndOfSupportDate: '31 May 2028',
    retirementStatus: 'NOT_PLANNED',
    retirementDate: 'Belum ada',
    retirementNote: 'Masih dalam window produktif dan cukup dipantau via preventive review.',
  },
  {
    id: 2,
    assetCode: 'AST-0002',
    assetName: 'Toyota Hilux 2.4',
    category: 'Vehicle',
    condition: 'GOOD',
    classUsefulLife: 96,
    latestReviewedRemainingLife: 12,
    riskScore: 58.1,
    reviewDate: '12 Jul 2026',
    nextReviewDate: '14 Aug 2026',
    replacementRecommendation: 'REVIEW',
    replacementStrategy: 'MANUAL_REVIEW',
    replacementPriority: 'MEDIUM',
    expectedReplacementDate: '30 Jun 2027',
    replacementBudgetYear: 2027,
    estimatedReplacementCost: 'Rp285.000.000',
    supportEndDate: '14 Aug 2026',
    vendorEndOfSaleDate: '31 Dec 2026',
    vendorEndOfSupportDate: '30 Jun 2027',
    retirementStatus: 'PLANNED',
    retirementDate: 'Target Q3 2027',
    retirementNote: 'Perlu review efisiensi biaya armada sebelum keputusan akhir replacement.',
  },
  {
    id: 3,
    assetCode: 'AST-0003',
    assetName: 'Forklift FL-12',
    category: 'Heavy Equipment',
    condition: 'FAIR',
    classUsefulLife: 84,
    latestReviewedRemainingLife: 8,
    riskScore: 74.25,
    reviewDate: '27 Jul 2026',
    nextReviewDate: '15 Aug 2026',
    replacementRecommendation: 'REPLACE',
    replacementStrategy: 'RISK_BASED',
    replacementPriority: 'HIGH',
    expectedReplacementDate: '31 Jan 2027',
    replacementBudgetYear: 2027,
    estimatedReplacementCost: 'Rp27.500.000',
    supportEndDate: '09 Aug 2026',
    vendorEndOfSaleDate: '31 Dec 2026',
    vendorEndOfSupportDate: '31 Jan 2027',
    retirementStatus: 'REQUESTED',
    retirementDate: 'Menunggu approval',
    retirementNote: 'Risk downtime naik dan sudah masuk kandidat retirement setelah lifecycle review.',
  },
  {
    id: 4,
    assetCode: 'AST-0004',
    assetName: 'Epson EB-L210SW',
    category: 'Projector',
    condition: 'GOOD',
    classUsefulLife: 60,
    latestReviewedRemainingLife: 30,
    riskScore: 22.4,
    reviewDate: '11 Jul 2026',
    nextReviewDate: '11 Jan 2027',
    replacementRecommendation: 'MAINTAIN',
    replacementStrategy: 'AGE_BASED',
    replacementPriority: 'LOW',
    expectedReplacementDate: '31 Dec 2028',
    replacementBudgetYear: 2028,
    estimatedReplacementCost: 'Rp12.000.000',
    supportEndDate: '31 Dec 2027',
    vendorEndOfSaleDate: '30 Jun 2028',
    vendorEndOfSupportDate: '31 Dec 2028',
    retirementStatus: 'NOT_PLANNED',
    retirementDate: 'Belum ada',
    retirementNote: 'Kondisi stabil dan masih sesuai kebutuhan ruang training.',
  },
  {
    id: 5,
    assetCode: 'AST-0005',
    assetName: 'CCTV Dome Lobby A',
    category: 'Security Device',
    condition: 'GOOD',
    classUsefulLife: 72,
    latestReviewedRemainingLife: 18,
    riskScore: 49.3,
    reviewDate: '20 Jul 2026',
    nextReviewDate: '20 Sep 2026',
    replacementRecommendation: 'REVIEW',
    replacementStrategy: 'CONDITION_BASED',
    replacementPriority: 'MEDIUM',
    expectedReplacementDate: '31 Mar 2028',
    replacementBudgetYear: 2028,
    estimatedReplacementCost: 'Rp5.500.000',
    supportEndDate: '31 Mar 2027',
    vendorEndOfSaleDate: '31 Dec 2027',
    vendorEndOfSupportDate: '31 Mar 2028',
    retirementStatus: 'NOT_PLANNED',
    retirementDate: 'Belum ada',
    retirementNote: 'Perlu review kualitas jaringan dan packet loss sebelum replacement dipercepat.',
  },
  {
    id: 6,
    assetCode: 'AST-0006',
    assetName: 'HP LaserJet M507',
    category: 'Printer',
    condition: 'FAIR',
    classUsefulLife: 60,
    latestReviewedRemainingLife: 9,
    riskScore: 61,
    reviewDate: '09 Jul 2026',
    nextReviewDate: '09 Aug 2026',
    replacementRecommendation: 'REVIEW',
    replacementStrategy: 'CONDITION_BASED',
    replacementPriority: 'MEDIUM',
    expectedReplacementDate: '30 Apr 2027',
    replacementBudgetYear: 2027,
    estimatedReplacementCost: 'Rp4.800.000',
    supportEndDate: '20 Nov 2026',
    vendorEndOfSaleDate: '31 Jan 2027',
    vendorEndOfSupportDate: '30 Apr 2027',
    retirementStatus: 'PLANNED',
    retirementDate: 'Target Apr 2027',
    retirementNote: 'Keputusan buy new atau extend usage menunggu hasil corrective maintenance.',
  },
  {
    id: 7,
    assetCode: 'AST-0007',
    assetName: 'Motorola Scanner MC33',
    category: 'Scanner',
    condition: 'GOOD',
    classUsefulLife: 48,
    latestReviewedRemainingLife: 20,
    riskScore: 31.6,
    reviewDate: '24 Jul 2026',
    nextReviewDate: '24 Nov 2026',
    replacementRecommendation: 'MAINTAIN',
    replacementStrategy: 'AGE_BASED',
    replacementPriority: 'LOW',
    expectedReplacementDate: '31 Mar 2028',
    replacementBudgetYear: 2028,
    estimatedReplacementCost: 'Rp8.200.000',
    supportEndDate: '31 Mar 2027',
    vendorEndOfSaleDate: '30 Sep 2027',
    vendorEndOfSupportDate: '31 Mar 2028',
    retirementStatus: 'NOT_PLANNED',
    retirementDate: 'Belum ada',
    retirementNote: 'Masih sehat dan utilisasi lapangan normal.',
  },
  {
    id: 8,
    assetCode: 'AST-0008',
    assetName: 'Cisco Catalyst 9300',
    category: 'Network Device',
    condition: 'POOR',
    classUsefulLife: 84,
    latestReviewedRemainingLife: 0,
    riskScore: 88.4,
    reviewDate: '27 Jul 2026',
    nextReviewDate: 'Selesai',
    replacementRecommendation: 'REPLACE',
    replacementStrategy: 'RISK_BASED',
    replacementPriority: 'HIGH',
    expectedReplacementDate: '31 Oct 2026',
    replacementBudgetYear: 2026,
    estimatedReplacementCost: 'Rp95.000.000',
    supportEndDate: '31 Oct 2026',
    vendorEndOfSaleDate: '30 Jun 2026',
    vendorEndOfSupportDate: '31 Oct 2026',
    retirementStatus: 'CONFIRMED',
    retirementDate: '27 Jul 2026',
    retirementNote: 'Asset sudah retired dan masuk rencana migrasi perangkat pengganti.',
  },
]

const lifecycleReviews: LifecycleReviewRow[] = [
  { id: 101, assetId: 1, reviewDate: '18 Jul 2026', conditionScore: '82.00', remainingLifeMonths: 22, riskScore: '34.20', replacementRecommendation: 'MAINTAIN', estimatedReplacementCost: 'Rp24.000.000', reviewNotes: 'Stabil, cukup monitor battery trend.', reviewedBy: 'IT Endpoint Lead', approvedBy: 'IT Manager' },
  { id: 201, assetId: 2, reviewDate: '12 Jul 2026', conditionScore: '77.40', remainingLifeMonths: 12, riskScore: '58.10', replacementRecommendation: 'REVIEW', estimatedReplacementCost: 'Rp285.000.000', reviewNotes: 'Perlu review biaya operasional vs umur pakai tersisa.', reviewedBy: 'Fleet Planner', approvedBy: 'Fleet Manager' },
  { id: 301, assetId: 3, reviewDate: '27 Jul 2026', conditionScore: '68.50', remainingLifeMonths: 8, riskScore: '74.25', replacementRecommendation: 'REPLACE', estimatedReplacementCost: 'Rp27.500.000', reviewNotes: 'Risiko downtime naik, kandidat retire atau replace.', reviewedBy: 'Mechanical Supervisor', approvedBy: 'Operations Manager' },
  { id: 302, assetId: 3, reviewDate: '02 May 2026', conditionScore: '72.30', remainingLifeMonths: 12, riskScore: '61.80', replacementRecommendation: 'REVIEW', estimatedReplacementCost: 'Rp25.000.000', reviewNotes: 'Masih bisa dipakai, namun monitor vibration.', reviewedBy: 'Mechanical Supervisor', approvedBy: 'Operations Manager' },
  { id: 401, assetId: 4, reviewDate: '11 Jul 2026', conditionScore: '90.10', remainingLifeMonths: 30, riskScore: '22.40', replacementRecommendation: 'MAINTAIN', estimatedReplacementCost: 'Rp12.000.000', reviewNotes: 'Kondisi bagus dan utilisasi stabil.', reviewedBy: 'GA Support Lead', approvedBy: 'GA Manager' },
  { id: 501, assetId: 5, reviewDate: '20 Jul 2026', conditionScore: '79.00', remainingLifeMonths: 18, riskScore: '49.30', replacementRecommendation: 'REVIEW', estimatedReplacementCost: 'Rp5.500.000', reviewNotes: 'Review kembali bila packet loss tetap tinggi.', reviewedBy: 'Infra Support Lead', approvedBy: 'Infra Manager' },
  { id: 601, assetId: 6, reviewDate: '09 Jul 2026', conditionScore: '63.70', remainingLifeMonths: 9, riskScore: '61.00', replacementRecommendation: 'REVIEW', estimatedReplacementCost: 'Rp4.800.000', reviewNotes: 'Tunggu hasil corrective sebelum finalisasi.', reviewedBy: 'Office Support Lead', approvedBy: 'Facilities Manager' },
  { id: 701, assetId: 7, reviewDate: '24 Jul 2026', conditionScore: '86.40', remainingLifeMonths: 20, riskScore: '31.60', replacementRecommendation: 'MAINTAIN', estimatedReplacementCost: 'Rp8.200.000', reviewNotes: 'Utilisasi normal dan kondisi stabil.', reviewedBy: 'Warehouse Systems Lead', approvedBy: 'Warehouse Manager' },
  { id: 801, assetId: 8, reviewDate: '27 Jul 2026', conditionScore: '52.00', remainingLifeMonths: 0, riskScore: '88.40', replacementRecommendation: 'REPLACE', estimatedReplacementCost: 'Rp95.000.000', reviewNotes: 'Lifecycle review final sebelum retirement confirmation.', reviewedBy: 'Network Core Lead', approvedBy: 'Infrastructure Manager' },
]

const retirementRows: RetirementRow[] = [
  { id: 1, assetId: 3, retirementNumber: 'RET-2026-003', retirementType: 'DISPOSAL', requestDate: '27 Jul 2026', effectiveDate: '-', status: 'REQUESTED', proceedsAmount: 'Rp0', buyerPartner: '-', reason: 'Retirement diajukan setelah lifecycle review menunjukkan risiko tinggi.', sapRetirementDocEntry: '-' },
  { id: 2, assetId: 8, retirementNumber: 'RET-2026-008', retirementType: 'DISPOSAL', requestDate: '27 Jul 2026', effectiveDate: '27 Jul 2026', status: 'CONFIRMED', proceedsAmount: 'Rp1.500.000', buyerPartner: 'PT Infra Network Nusantara', reason: 'Retirement dikonfirmasi setelah penilaian lifecycle dan rencana migrasi network.', sapRetirementDocEntry: '91001' },
]

const selectedAssetId = computed(() => Number(route.params.assetId || '1'))
const defaultAsset = lifecycleAssets[0]!
const selectedAsset = computed(() => lifecycleAssets.find((item) => item.id === selectedAssetId.value) ?? defaultAsset)
const selectedAssetReviews = computed(() => lifecycleReviews.filter((item) => item.assetId === selectedAsset.value.id))
const selectedAssetRetirements = computed(() => retirementRows.filter((item) => item.assetId === selectedAsset.value.id))
const latestReview = computed(() => selectedAssetReviews.value[0] ?? null)
const activeRetirement = computed(() => selectedAssetRetirements.value[0] ?? null)

const replacementUrgency = computed(() => {
  if (selectedAsset.value.riskScore >= 80) return 'Urgent'
  if (selectedAsset.value.latestReviewedRemainingLife <= 6) return 'Near End-of-Life'
  return 'Planned Review'
})

const metrics = computed<MetricCardItem[]>(() => [
  {
    title: 'Condition',
    value: selectedAsset.value.condition,
    detail: `Condition score ${latestReview.value?.conditionScore ?? '-'}`,
    icon: 'ShieldCheck',
    tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
  },
  {
    title: 'Lifecycle Risk',
    value: String(selectedAsset.value.riskScore),
    detail: `Latest review ${selectedAsset.value.reviewDate}`,
    icon: 'ShieldAlert',
    tone: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
  },
  {
    title: 'Remaining Life',
    value: `${selectedAsset.value.latestReviewedRemainingLife} mo`,
    detail: `Class useful life ${selectedAsset.value.classUsefulLife} mo`,
    icon: 'Hourglass',
    tone: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
  },
  {
    title: 'Replacement',
    value: selectedAsset.value.replacementRecommendation,
    detail: replacementUrgency.value,
    icon: 'RefreshCw',
    tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
  },
])

const riskTrendOptions: ApexOptions = {
  chart: { type: 'line', background: 'transparent', fontFamily: 'inherit', toolbar: { show: false } },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#ef4444', '#0ea5e9'],
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(148, 163, 184, 0.18)', strokeDashArray: 4 },
  xaxis: {
    categories: selectedAssetReviews.value.map((item) => item.reviewDate).reverse(),
    labels: { style: { colors: selectedAssetReviews.value.map(() => '#94a3b8') } },
  },
  yaxis: { labels: { style: { colors: ['#94a3b8'] } } },
}

const riskTrendSeries = computed(() => [
  { name: 'Risk Score', data: selectedAssetReviews.value.map((item) => Number(item.riskScore)).reverse() },
  { name: 'Remaining Life', data: selectedAssetReviews.value.map((item) => item.remainingLifeMonths).reverse() },
])

const reviewColumns: DataTableColumn[] = [
  { key: 'reviewDate', label: 'Review Date' },
  { key: 'conditionScore', label: 'Condition Score' },
  { key: 'remainingLifeMonths', label: 'Remaining Life (mo)' },
  { key: 'riskScore', label: 'Risk Score' },
  {
    key: 'replacementRecommendation',
    label: 'Recommendation',
    type: 'badge',
    toneMap: {
      MAINTAIN: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      REVIEW: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      REPLACE: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
    },
  },
]

const retirementColumns: DataTableColumn[] = [
  { key: 'retirementNumber', label: 'Retirement No.' },
  { key: 'retirementType', label: 'Type' },
  { key: 'requestDate', label: 'Request Date' },
  { key: 'effectiveDate', label: 'Effective Date' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      REQUESTED: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      APPROVED: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
      CONFIRMED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
]

const overviewCards = computed(() => [
  { label: 'Class Useful Life', value: `${selectedAsset.value.classUsefulLife} months`, note: `Category ${selectedAsset.value.category}` },
  { label: 'Latest Reviewed Remaining Life', value: `${selectedAsset.value.latestReviewedRemainingLife} months`, note: `Review date ${selectedAsset.value.reviewDate}` },
  { label: 'Next Review Date', value: selectedAsset.value.nextReviewDate, note: 'Dari master asset dan latest lifecycle review.' },
  { label: 'Replacement Priority', value: selectedAsset.value.replacementPriority, note: `Strategy ${selectedAsset.value.replacementStrategy}` },
])

const replacementCards = computed(() => [
  { label: 'Expected Replacement Date', value: selectedAsset.value.expectedReplacementDate, note: `Budget year ${selectedAsset.value.replacementBudgetYear}` },
  { label: 'Estimated Replacement Cost', value: selectedAsset.value.estimatedReplacementCost, note: `Recommendation ${selectedAsset.value.replacementRecommendation}` },
  { label: 'Support Deadline', value: selectedAsset.value.supportEndDate, note: `Vendor support end ${selectedAsset.value.vendorEndOfSupportDate}` },
  { label: 'End of Sale', value: selectedAsset.value.vendorEndOfSaleDate, note: replacementUrgency.value },
])

const sectionTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'replacement', label: 'Replacement Planning' },
  { key: 'retirement', label: 'Retirement' },
  { key: 'finance', label: 'Finance Lifecycle' },
] as const
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold tracking-[0.22em] text-sky-600 uppercase dark:text-sky-300">Lifecycle</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {{ selectedAsset.assetCode }} - {{ selectedAsset.assetName }}
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Halaman lifecycle operasional per asset berdasarkan mapping backend yang sudah tersedia.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <RouterLink
          to="/asset-registry"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
        >
          <BaseIcon name="ArrowLeft" :size="15" />
          Back to Assets
        </RouterLink>
        <RouterLink
          :to="`/asset-registry/${selectedAsset.id}/edit`"
          class="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          <BaseIcon name="PencilLine" :size="15" />
          Update Asset
        </RouterLink>
      </div>
    </div>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="flex flex-wrap gap-2">
      <button
        v-for="tab in sectionTabs"
        :key="tab.key"
        type="button"
        class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
        :class="
          activeSection === tab.key
            ? 'border-slate-950 bg-slate-950 text-white dark:border-sky-600 dark:bg-sky-600'
            : 'border-slate-200/80 bg-slate-50/80 text-slate-600 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-sky-500/20 dark:hover:text-sky-200'
        "
        @click="activeSection = tab.key"
      >
        {{ tab.label }}
      </button>
    </section>

    <section v-show="activeSection === 'overview'" class="space-y-6">
      <div class="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <SectionCard title="Lifecycle Overview" description="Ringkasan operational lifecycle yang sudah benar-benar tersedia dari backend atau turunan ringan.">
          <div class="grid gap-4 md:grid-cols-2">
            <div
              v-for="item in overviewCards"
              :key="item.label"
              class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.label }}</p>
                <span class="rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {{ item.value }}
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ item.note }}</p>
            </div>
          </div>
        </SectionCard>

        <DetailHighlightCard
          eyebrow="Latest Lifecycle Summary"
          :status-label="selectedAsset.replacementRecommendation"
          :note="selectedAsset.retirementNote"
          :icon="selectedAsset.replacementRecommendation === 'REPLACE' ? 'TriangleAlert' : selectedAsset.replacementRecommendation === 'REVIEW' ? 'FileSearch' : 'ShieldCheck'"
          :tone="
            selectedAsset.replacementRecommendation === 'REPLACE'
              ? 'border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10'
              : selectedAsset.replacementRecommendation === 'REVIEW'
                ? 'border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10'
                : 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10'
          "
          :badge-tone="
            selectedAsset.replacementRecommendation === 'REPLACE'
              ? 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200'
              : selectedAsset.replacementRecommendation === 'REVIEW'
                ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                : 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
          "
        />
      </div>
    </section>

    <section v-show="activeSection === 'reviews'" class="space-y-6">
      <SectionCard title="Lifecycle Review Trend" description="Trend review history untuk risk score dan remaining life berdasarkan lifecycle review terbaru ke lama.">
        <BaseChart type="line" :height="320" :options="riskTrendOptions" :series="riskTrendSeries" />
      </SectionCard>

      <DataTable
        title="Lifecycle Reviews"
        description="History review score, remaining life, dan recommendation per asset."
        :rows="selectedAssetReviews"
        :columns="reviewColumns"
        search-placeholder="Cari review date, recommendation, atau reviewer..."
        :search-keys="['reviewDate', 'replacementRecommendation', 'reviewedBy', 'approvedBy', 'reviewNotes']"
        :page-size="5"
      />

      <SectionCard title="Review Timeline" description="Catatan review terbaru untuk membantu reviewer memahami perubahan keputusan.">
        <div class="space-y-3">
          <div
            v-for="review in selectedAssetReviews"
            :key="review.id"
            class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ review.reviewDate }}</p>
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                :class="
                  review.replacementRecommendation === 'REPLACE'
                    ? 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200'
                    : review.replacementRecommendation === 'REVIEW'
                      ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                      : 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
                "
              >
                {{ review.replacementRecommendation }}
              </span>
            </div>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ review.reviewNotes }}</p>
            <p class="mt-2 text-xs tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
              Condition {{ review.conditionScore }} · Remaining {{ review.remainingLifeMonths }} mo · Risk {{ review.riskScore }} · Reviewed by {{ review.reviewedBy }}
            </p>
          </div>
        </div>
      </SectionCard>
    </section>

    <section v-show="activeSection === 'replacement'" class="space-y-6">
      <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Replacement Planning" description="Gabungan data master asset dan latest lifecycle review untuk kebutuhan planning per asset.">
          <div class="space-y-3">
            <div
              v-for="item in replacementCards"
              :key="item.label"
              class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.label }}</p>
                <span class="rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {{ item.value }}
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ item.note }}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Support Deadline Card" description="Deadline support vendor dan tanda urgency yang bisa diturunkan ringan di frontend.">
          <div class="space-y-4">
            <DetailHighlightCard
              eyebrow="Support Ending Soon"
              :status-label="replacementUrgency"
              :note="`Support deadline ${selectedAsset.supportEndDate}, vendor end-of-support ${selectedAsset.vendorEndOfSupportDate}.`"
              icon="CalendarClock"
              :tone="
                replacementUrgency === 'Urgent'
                  ? 'border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10'
                  : replacementUrgency === 'Near End-of-Life'
                    ? 'border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10'
                    : 'border-sky-200 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/10'
              "
              :badge-tone="
                replacementUrgency === 'Urgent'
                  ? 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200'
                  : replacementUrgency === 'Near End-of-Life'
                    ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                    : 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200'
              "
            />

            <div class="rounded-[22px] border border-dashed border-slate-300/80 bg-slate-50/70 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-400">
              Frontend hanya menampilkan planning per asset. Belum ada ranking portfolio enterprise atau consolidated replacement pipeline dari backend.
            </div>
          </div>
        </SectionCard>
      </div>
    </section>

    <section v-show="activeSection === 'retirement'" class="space-y-6">
      <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DetailHighlightCard
          eyebrow="Retirement Status"
          :status-label="selectedAsset.retirementStatus"
          :note="selectedAsset.retirementNote"
          icon="Archive"
          :tone="
            selectedAsset.retirementStatus === 'CONFIRMED'
              ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10'
              : selectedAsset.retirementStatus === 'REQUESTED'
                ? 'border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10'
                : 'border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-slate-950/40'
          "
          :badge-tone="
            selectedAsset.retirementStatus === 'CONFIRMED'
              ? 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
              : selectedAsset.retirementStatus === 'REQUESTED'
                ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                : 'bg-slate-200/80 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
          "
        />

        <SectionCard title="Retirement Actions" description="Workflow retirement backend sudah operasional dan bukan placeholder.">
          <div class="grid gap-3 md:grid-cols-3">
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm dark:border-white/10 dark:bg-slate-950/40">
              <p class="font-semibold text-slate-900 dark:text-white">Create Retirement Request</p>
              <p class="mt-2 text-slate-500 dark:text-slate-400">Gunakan saat asset masuk kandidat retire dari hasil lifecycle review.</p>
            </div>
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm dark:border-white/10 dark:bg-slate-950/40">
              <p class="font-semibold text-slate-900 dark:text-white">Approve</p>
              <p class="mt-2 text-slate-500 dark:text-slate-400">Approval formal sebelum asset berubah ke status final retirement.</p>
            </div>
            <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 text-sm dark:border-white/10 dark:bg-slate-950/40">
              <p class="font-semibold text-slate-900 dark:text-white">Confirm</p>
              <p class="mt-2 text-slate-500 dark:text-slate-400">Konfirmasi akhir untuk update final asset status dan referensi SAP.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <DataTable
        title="Retirement Requests"
        description="History request retirement, approval, dan confirmation per asset."
        :rows="selectedAssetRetirements"
        :columns="retirementColumns"
        search-placeholder="Cari retirement number, status, atau reason..."
        :search-keys="['retirementNumber', 'status', 'reason', 'buyerPartner']"
        :page-size="4"
      />

      <SectionCard
        v-if="activeRetirement"
        title="Retirement Detail"
        description="Ringkasan request retirement aktif atau terbaru."
      >
        <div class="space-y-3">
          <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
            <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ activeRetirement.retirementNumber }}</p>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ activeRetirement.reason }}</p>
            <p class="mt-3 text-xs tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
              Status {{ activeRetirement.status }} · Effective {{ activeRetirement.effectiveDate }} · SAP {{ activeRetirement.sapRetirementDocEntry }}
            </p>
          </div>
        </div>
      </SectionCard>
    </section>

    <section v-show="activeSection === 'finance'" class="space-y-6">
      <SectionCard title="Finance Lifecycle" description="Coming soon sesuai mapping karena backend depreciation dan finance lifecycle snapshot belum final.">
        <div class="rounded-[24px] border border-dashed border-slate-300/80 bg-slate-50/80 p-8 dark:border-white/10 dark:bg-slate-950/30">
          <p class="text-base font-semibold text-slate-900 dark:text-white">Finance Lifecycle belum final</p>
          <p class="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Area ini sengaja ditahan sampai backend depreciation domain selesai. Nantinya bagian ini akan memuat depreciation area, method, accumulated depreciation, net book value, dan period movement.
          </p>
        </div>
      </SectionCard>
    </section>
  </div>
</template>
