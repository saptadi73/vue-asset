<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import ApiSessionPanel from '@/components/ApiSessionPanel.vue'
import BaseChart from '@/components/BaseChart.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import DataTable from '@/components/DataTable.vue'
import DetailGridTable from '@/components/DetailGridTable.vue'
import DetailHighlightCard from '@/components/DetailHighlightCard.vue'
import MetricCard from '@/components/MetricCard.vue'
import SectionCard from '@/components/SectionCard.vue'
import { getCrudConfig } from '@/config/crud'
import { deleteCrudRecord } from '@/services/crud'
import {
  fetchAssetTrackingTimeline,
  fetchStocktakeSessionDetail,
  fetchStocktakeSessions,
  mapTrackingEventsFromSession,
  submitTrackingScanBatch,
  submitStocktakeScan,
  submitStocktakeWorkflowAction,
  type AssetTrackingTimelineResponse,
  type StocktakeStatus,
  type TrackingBatchFeedback,
  type TrackingScanEvent,
  type TrackingSession,
} from '@/services/tracking'
import { getAccessToken } from '@/services/session'
import { liveSeedIds } from '@/data/liveSeedIds'
import type { DataTableColumn, DetailGridColumn, MetricCardItem } from '@/types/app'
import { formatEnumLabel } from '@/utils/formatters'

const crudConfig = getCrudConfig('tracking')!

interface TrackingRow extends Record<string, unknown> {
  id: string
  session: string
  location: string
  window: string
  status: StocktakeStatus
  verified: string
  target_assets: string
  unmatched: string
  last_scan: string
}

interface StocktakeResultRow extends Record<string, unknown> {
  id: string
  code: string
  asset: string
  result: string
  scanned_at: string
  notes: string
}

interface TrackingVerificationRow extends Record<string, unknown> {
  id: string
  verified_at: string
  result: string
  expected_location: string
  observed_location: string
  resolution_status: string
}

interface BarcodeDetectorLike {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>
}

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike
  }
}

const verificationMixOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent', fontFamily: 'inherit' },
  labels: ['Verified', 'Pending', 'Unmatched'],
  colors: ['#22c55e', '#94a3b8', '#ef4444'],
  dataLabels: { enabled: false },
  legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
  stroke: { width: 0 },
}

const columns: DataTableColumn[] = [
  { key: 'session', label: 'Session' },
  { key: 'location', label: 'Location' },
  { key: 'window', label: 'Window' },
  {
    key: 'status',
    label: 'Status',
    type: 'badge',
    toneMap: {
      DRAFT: 'bg-slate-300/70 text-slate-700 ring-slate-300/50 dark:bg-slate-800 dark:text-slate-200',
      IN_PROGRESS: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
      COMPLETED: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      APPROVED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
  { key: 'verified', label: 'Verified' },
  { key: 'unmatched', label: 'Unmatched' },
]
const expectedAssetColumns: DetailGridColumn[] = [
  { key: 'code', label: 'Code', valueClass: 'text-sm font-semibold text-slate-900 dark:text-white' },
  { key: 'name', label: 'Asset' },
  { key: 'location', label: 'Location', valueClass: 'text-sm text-slate-500 dark:text-slate-400' },
]
const stocktakeResultColumns: DataTableColumn[] = [
  { key: 'code', label: 'Code' },
  { key: 'asset', label: 'Asset' },
  {
    key: 'result',
    label: 'Result',
    type: 'badge',
    toneMap: {
      FOUND: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      UNEXPECTED: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      UNKNOWN_TAG: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      DUPLICATE_TAG: 'bg-violet-500/15 text-violet-700 ring-violet-400/20 dark:text-violet-200',
    },
  },
  { key: 'scanned_at', label: 'Scanned At' },
]
const trackingVerificationColumns: DataTableColumn[] = [
  { key: 'verified_at', label: 'Verified At' },
  {
    key: 'result',
    label: 'Verification Result',
    type: 'badge',
    toneMap: {
      PRESENT_MATCH: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
      LOCATION_MISMATCH: 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200',
      OPEN: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
    },
  },
  { key: 'expected_location', label: 'Expected Location' },
  { key: 'observed_location', label: 'Observed Location' },
  {
    key: 'resolution_status',
    label: 'Resolution',
    type: 'badge',
    toneMap: {
      OPEN: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
      RESOLVED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  },
]

const rows = ref<TrackingRow[]>([])
const activeView = ref<'tracking' | 'stocktake'>('stocktake')
const selectedSessionId = ref('')
const selectedSessionDetail = ref<TrackingSession | null>(null)
const scanEvents = ref<TrackingScanEvent[]>([])
const trackingTimeline = ref<AssetTrackingTimelineResponse | null>(null)
const trackingBatchFeedback = ref<TrackingBatchFeedback | null>(null)
const dataSource = ref<'api'>('api')
const hasAccessToken = ref(false)
const loadError = ref('')
const actionFeedback = ref('')
const scanFeedback = ref('')
const workflowNote = ref('')
const manualCode = ref('')
const isLoading = ref(false)
const isDetailLoading = ref(false)
const isActionSubmitting = ref(false)
const isScanSubmitting = ref(false)
const isBatchSubmitting = ref(false)

const videoRef = ref<HTMLVideoElement | null>(null)
const scanState = ref({
  supported: typeof window !== 'undefined' && 'BarcodeDetector' in window,
  isStarting: false,
  isScanning: false,
  isProcessing: false,
  errorMessage: '',
  lastCode: '',
})

let mediaStream: MediaStream | null = null
let scanLoopId: number | null = null
let detector: BarcodeDetectorLike | null = null
let detailRequestToken = 0

const syncAccessTokenState = () => {
  hasAccessToken.value = Boolean(getAccessToken().trim())
}

const formatDateTime = (value: string | null) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const formatDateOnly = (value: string | null) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const formatWindow = (startAt: string | null, endAt: string | null) => {
  if (!startAt && !endAt) return '-'
  return `${formatDateOnly(startAt)} - ${formatDateOnly(endAt)}`
}

const countUnmatchedEvents = (session: TrackingSession) =>
  mapTrackingEventsFromSession(session).filter((item) => item.result === 'UNMATCHED').length

const latestEventTime = (session: TrackingSession) => {
  const latest = mapTrackingEventsFromSession(session)[0]
  return latest ? formatDateTime(latest.time) : '-'
}

const mapSessionToRow = (session: TrackingSession): TrackingRow => ({
  id: session.id,
  session: session.sessionNumber,
  location: session.locationName,
  window: formatWindow(session.plannedStartAt, session.plannedEndAt),
  status: session.status,
  verified: `${session.resultCount} / ${session.expectedItemCount}`,
  target_assets: String(session.expectedItemCount),
  unmatched: String(countUnmatchedEvents(session)),
  last_scan: latestEventTime(session),
})

const upsertRow = (session: TrackingSession) => {
  const nextRow = mapSessionToRow(session)
  const index = rows.value.findIndex((item) => item.id === session.id)

  if (index === -1) {
    rows.value = [nextRow, ...rows.value]
    return
  }

  const nextRows = [...rows.value]
  nextRows[index] = nextRow
  rows.value = nextRows
}

const syncSelectedDetail = (session: TrackingSession) => {
  selectedSessionDetail.value = session
  scanEvents.value = mapTrackingEventsFromSession(session).slice(0, 10)
}

const loadSessionDetail = async (sessionId: string) => {
  if (!sessionId) return
  if (!hasAccessToken.value) return

  const requestToken = ++detailRequestToken
  isDetailLoading.value = true

  try {
    const response = await fetchStocktakeSessionDetail(sessionId)

    if (requestToken !== detailRequestToken) return

    syncSelectedDetail(response.item)
    upsertRow(response.item)
  } catch (error) {
    if (requestToken !== detailRequestToken) return
    loadError.value = error instanceof Error ? error.message : 'Detail stocktake tidak bisa dimuat.'
  } finally {
    if (requestToken === detailRequestToken) {
      isDetailLoading.value = false
    }
  }
}

const loadSessions = async () => {
  if (!hasAccessToken.value) {
    loadError.value = 'Bearer token diperlukan. Simpan access token terlebih dahulu agar halaman tracking dan stocktake bisa mengambil data backend.'
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const response = await fetchStocktakeSessions()
    rows.value = response.items.map(mapSessionToRow)

    if (!rows.value.length) {
      selectedSessionId.value = ''
      selectedSessionDetail.value = null
      scanEvents.value = []
      return
    }

    const stillExists = rows.value.some((item) => item.id === selectedSessionId.value)
    selectedSessionId.value = stillExists ? selectedSessionId.value : String(rows.value[0]?.id || '')
    await loadSessionDetail(selectedSessionId.value)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Daftar stocktake tidak bisa dimuat.'
  } finally {
    isLoading.value = false
  }
}

const loadTrackingTimeline = async () => {
  if (!hasAccessToken.value) {
    loadError.value = 'Bearer token diperlukan. Simpan access token terlebih dahulu agar tracking timeline bisa mengambil data backend.'
    return
  }

  try {
    trackingTimeline.value = await fetchAssetTrackingTimeline(liveSeedIds.asset_id)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Tracking timeline tidak bisa dimuat.'
  }
}

const selectedSession = computed(() => selectedSessionDetail.value)

const metrics = computed<MetricCardItem[]>(() => {
  const total = rows.value.length
  const activeCount = rows.value.filter((item) => item.status === 'IN_PROGRESS').length
  const pendingApprovalCount = rows.value.filter((item) => item.status === 'COMPLETED').length

  const aggregate = rows.value.reduce(
    (summary, row) => {
      const [verified = 0, target = 0] = String(row.verified)
        .split('/')
        .map((value) => Number(value.trim()))

      return {
        verified: summary.verified + (Number.isFinite(verified) ? verified : 0),
        target: summary.target + (Number.isFinite(target) ? target : 0),
      }
    },
    { verified: 0, target: 0 },
  )

  const coverage = aggregate.target > 0 ? Math.round((aggregate.verified / aggregate.target) * 100) : 0

  return [
    {
      title: 'Open Stocktakes',
      value: String(activeCount || total),
      icon: 'ScanSearch',
      tone: 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200',
    },
    {
      title: 'Pending Approval',
      value: String(pendingApprovalCount),
      icon: 'Stamp',
      tone: 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200',
    },
    {
      title: 'Coverage',
      value: `${coverage}%`,
      icon: 'Radar',
      tone: 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200',
    },
  ]
})

const sessionSummaryRows = computed(() => {
  if (!selectedSession.value) return []

  return [
    {
      label: 'Target Assets',
      value: String(selectedSession.value.expectedItemCount),
      note: 'Total snapshot asset yang harus diverifikasi pada sesi ini.',
    },
    {
      label: 'Result Count',
      value: String(selectedSession.value.resultCount),
      note: 'Jumlah hasil scan atau hasil stocktake yang sudah terbentuk.',
    },
    {
      label: 'Started At',
      value: formatDateTime(selectedSession.value.startedAt),
      note: 'Waktu sesi benar-benar dijalankan di lapangan.',
    },
    {
      label: 'Approved At',
      value: formatDateTime(selectedSession.value.approvedAt),
      note: 'Terisi setelah hasil stocktake disetujui.',
    },
  ]
})

const expectedAssetRows = computed(() => {
  if (!selectedSession.value?.expectedItems?.length) return []

  return selectedSession.value.expectedItems.slice(0, 6).map((item) => ({
    id: item.id,
    code: item.asset?.asset_code || item.asset?.tag_number || '-',
    name: item.asset?.asset_name || 'Unnamed asset',
    location: selectedSession.value?.locationName || item.expected_location?.location_name || '-',
  }))
})
const stocktakeResultRows = computed<StocktakeResultRow[]>(() => {
  if (!selectedSession.value?.results?.length) return []

  return selectedSession.value.results.map((item) => ({
    id: item.id || `${item.asset?.asset_code || item.asset?.tag_number || 'result'}-${item.created_at || 'now'}`,
    code: item.asset?.tag_number || item.asset?.asset_code || '-',
    asset: item.asset?.asset_name || item.asset?.asset_code || 'Unknown asset',
    result: String(item.result_type || '-'),
    scanned_at: formatDateTime(item.created_at || null),
    notes: item.notes || '-',
  }))
})
const trackingVerificationRows = computed<TrackingVerificationRow[]>(() =>
  (trackingTimeline.value?.verifications || []).map((item) => ({
    id: item.id,
    verified_at: formatDateTime(item.verifiedAt),
    result: item.result,
    expected_location: item.expectedLocation,
    observed_location: item.observedLocation,
    resolution_status: item.resolutionStatus,
  })),
)
const discrepancyCards = [
  {
    title: 'Location Discrepancies',
    value: 'Review mismatched asset location and open resolution actions.',
    to: '/reports/tracking-verification',
    icon: 'MapPinned',
  },
  {
    title: 'Missing Assets',
    value: 'Open missing asset watchlist from the latest stocktake sessions.',
    to: '/reports/tracking-verification',
    icon: 'PackageX',
  },
  {
    title: 'Unverified Aging',
    value: 'Audit unverified items and escalation backlog by age bucket.',
    to: '/reports/tracking-verification',
    icon: 'ClockAlert',
  },
] as const

const verificationMixSeries = computed(() => {
  if (!selectedSession.value) return [0, 0, 0]

  const unmatched = countUnmatchedEvents(selectedSession.value)
  const verified = Math.max(selectedSession.value.resultCount - unmatched, 0)
  const pending = Math.max(selectedSession.value.expectedItemCount - selectedSession.value.resultCount, 0)

  return [verified, pending, unmatched]
})

const availableWorkflowActions = computed(() => {
  const status = selectedSession.value?.status
  const actions = crudConfig.workflowActions || []

  if (status === 'DRAFT') return actions.filter((item) => item.key === 'start')
  if (status === 'IN_PROGRESS') return actions.filter((item) => item.key === 'complete')
  if (status === 'COMPLETED') return actions.filter((item) => item.key === 'approve')
  return []
})

const submitDetectedCode = async (rawCode: string) => {
  const session = selectedSession.value
  const normalized = rawCode.trim().toUpperCase()

  if (!normalized) return

  if (!session) {
    scanState.value.errorMessage = 'Pilih sesi stocktake terlebih dahulu.'
    return
  }

  if (session.status !== 'IN_PROGRESS') {
    scanState.value.errorMessage = 'Scan QR hanya aktif untuk sesi dengan status IN_PROGRESS.'
    return
  }

  isScanSubmitting.value = true
  scanState.value.isProcessing = true
  scanState.value.errorMessage = ''
  scanFeedback.value = ''

  try {
    const response = await submitStocktakeScan({
      sessionId: session.id,
      rawTagUid: normalized,
      scannedLocationId: session.locationId,
      scanSource: scanState.value.isScanning ? 'MOBILE' : 'API',
    })

    scanState.value.lastCode = normalized
    scanFeedback.value = `Scan ${normalized} berhasil dikirim ke backend.`

    scanEvents.value = [response.event, ...scanEvents.value.filter((item) => item.id !== response.event.id)].slice(0, 10)
    await loadSessionDetail(session.id)
  } catch (error) {
    scanState.value.errorMessage = error instanceof Error ? error.message : 'Scan QR tidak bisa diproses.'
  } finally {
    isScanSubmitting.value = false
    scanState.value.isProcessing = false
  }
}

const stopScanner = () => {
  if (scanLoopId !== null) {
    window.clearTimeout(scanLoopId)
    scanLoopId = null
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop())
    mediaStream = null
  }

  if (videoRef.value) {
    videoRef.value.srcObject = null
  }

  scanState.value.isScanning = false
}

const scanFrame = async () => {
  if (!detector || !videoRef.value || !scanState.value.isScanning) return

  try {
    const results = await detector.detect(videoRef.value)
    const code = results.find((item) => item.rawValue)?.rawValue

    if (code && code !== scanState.value.lastCode && !scanState.value.isProcessing) {
      await submitDetectedCode(code)
    }
  } catch {
    scanState.value.errorMessage = 'Browser mendukung kamera, tetapi scan QR belum berhasil diproses.'
  } finally {
    if (scanState.value.isScanning) {
      scanLoopId = window.setTimeout(() => {
        void scanFrame()
      }, 900)
    }
  }
}

const startScanner = async () => {
  if (!selectedSession.value) {
    scanState.value.errorMessage = 'Pilih sesi stocktake terlebih dahulu.'
    return
  }

  if (selectedSession.value.status !== 'IN_PROGRESS') {
    scanState.value.errorMessage = 'Mulai sesi stocktake terlebih dahulu sebelum menjalankan QR scan.'
    return
  }

  if (!scanState.value.supported) {
    scanState.value.errorMessage = 'Browser ini belum mendukung BarcodeDetector. Gunakan manual scan fallback.'
    return
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    scanState.value.errorMessage = 'Browser ini belum mendukung akses kamera.'
    return
  }

  scanState.value.isStarting = true
  scanState.value.errorMessage = ''

  try {
    const Detector = window.BarcodeDetector
    detector = Detector ? new Detector({ formats: ['qr_code'] }) : null

    if (!detector) {
      throw new Error('BarcodeDetector tidak tersedia di browser ini.')
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })

    if (!videoRef.value) throw new Error('Preview video tidak tersedia.')

    videoRef.value.srcObject = mediaStream
    await videoRef.value.play()
    scanState.value.isScanning = true
    void scanFrame()
  } catch (error) {
    scanState.value.errorMessage =
      error instanceof Error ? error.message : 'Tidak bisa mengakses kamera untuk scan QR.'
    stopScanner()
  } finally {
    scanState.value.isStarting = false
  }
}

const handleManualScan = async () => {
  await submitDetectedCode(manualCode.value)
  manualCode.value = ''
}

const handleWorkflowAction = async (actionKey: 'start' | 'complete' | 'approve') => {
  if (!selectedSession.value) return

  isActionSubmitting.value = true
  actionFeedback.value = ''

  try {
    const response = await submitStocktakeWorkflowAction(selectedSession.value.id, actionKey, workflowNote.value || undefined)
    syncSelectedDetail(response.item)
    upsertRow(response.item)
    actionFeedback.value = `Workflow ${actionKey} berhasil dijalankan ke backend.`
    workflowNote.value = ''
  } catch (error) {
    actionFeedback.value = error instanceof Error ? error.message : 'Workflow action gagal dijalankan.'
  } finally {
    isActionSubmitting.value = false
  }
}

const runBatchScan = async () => {
  if (!hasAccessToken.value) {
    loadError.value = 'Bearer token diperlukan sebelum menjalankan batch scan ke backend.'
    return
  }

  isBatchSubmitting.value = true
  loadError.value = ''

  try {
    trackingBatchFeedback.value = await submitTrackingScanBatch({
      rawTagUid: liveSeedIds.asset_tag_number,
      scannedLocationId: liveSeedIds.origin_location_id,
    })
    await loadTrackingTimeline()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Batch scan feedback tidak bisa dimuat dari backend.'
  } finally {
    isBatchSubmitting.value = false
  }
}

const handleDeleteTracking = async (row: Record<string, unknown>) => {
  await deleteCrudRecord(crudConfig, String(row.id))
}

const reloadBackendData = async () => {
  syncAccessTokenState()

  if (!hasAccessToken.value) {
    loadError.value =
      'Bearer token diperlukan. Simpan access token terlebih dahulu agar halaman tracking dan stocktake bisa mengambil data backend.'
    return
  }

  loadError.value = ''
  await Promise.all([loadSessions(), loadTrackingTimeline()])
}

watch(selectedSessionId, async (nextId, previousId) => {
  if (!nextId || nextId === previousId) return

  workflowNote.value = ''
  actionFeedback.value = ''
  scanFeedback.value = ''
  await loadSessionDetail(nextId)
})

onMounted(async () => {
  await reloadBackendData()
})

onBeforeUnmount(() => {
  stopScanner()
})
</script>

<template>
  <div class="space-y-8">
    <div v-if="!hasAccessToken" class="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
      <SectionCard title="Bearer Token Diperlukan" description="Halaman Tracking & Stocktake sekarang berjalan langsung ke backend, jadi access token wajib tersedia.">
        <div class="rounded-[24px] border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
          <p class="text-sm leading-6 text-amber-900 dark:text-amber-100">
            Simpan `access token` hasil `POST /api/v1/auth/login`, lalu klik tombol reload di bawah ini untuk mengambil data tracking dan stocktake dari backend.
          </p>

          <div class="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
              @click="void reloadBackendData()"
            >
              <BaseIcon name="RefreshCw" :size="15" />
              Reload After Save
            </button>
          </div>
        </div>
      </SectionCard>

      <ApiSessionPanel />
    </div>

    <div
      v-if="loadError"
      class="rounded-[24px] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
    >
      {{ loadError }}
    </div>

    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
        :class="
          activeView === 'tracking'
            ? 'border-slate-950 bg-slate-950 text-white dark:border-sky-600 dark:bg-sky-600'
            : 'border-slate-200/80 bg-slate-50/80 text-slate-600 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-sky-500/20 dark:hover:text-sky-200'
        "
        @click="activeView = 'tracking'"
      >
        Tracking Timeline
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
        :class="
          activeView === 'stocktake'
            ? 'border-slate-950 bg-slate-950 text-white dark:border-sky-600 dark:bg-sky-600'
            : 'border-slate-200/80 bg-slate-50/80 text-slate-600 hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-sky-500/20 dark:hover:text-sky-200'
        "
        @click="activeView = 'stocktake'"
      >
        Stocktake
      </button>
    </section>

    <section v-if="activeView === 'tracking'" class="space-y-6">
      <SectionCard
        :title="trackingTimeline ? `${trackingTimeline.assetCode} - ${trackingTimeline.assetName}` : 'Tracking Timeline'"
        description="Timeline scan asset, verification list, dan batch scan feedback langsung dari endpoint backend."
      >
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Scan Activity</p>
            <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <p><span class="font-medium">Total Scans:</span> {{ trackingTimeline?.scans.length || 0 }}</p>
              <p><span class="font-medium">Batch Scans:</span> {{ trackingTimeline?.scans.filter((item) => item.isBatch).length || 0 }}</p>
              <p><span class="font-medium">Source:</span> {{ dataSource }}</p>
            </div>
          </div>

          <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Verification</p>
            <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <p><span class="font-medium">Verifications:</span> {{ trackingTimeline?.verifications.length || 0 }}</p>
              <p><span class="font-medium">Open:</span> {{ trackingTimeline?.verifications.filter((item) => item.resolutionStatus === 'OPEN').length || 0 }}</p>
              <p><span class="font-medium">Last Event:</span> {{ trackingTimeline?.scans[0] ? formatDateTime(trackingTimeline.scans[0].time) : '-' }}</p>
            </div>
          </div>

          <DetailHighlightCard
            eyebrow="Batch Scan Feedback"
            :status-label="trackingBatchFeedback?.source || 'api'"
            :note="trackingBatchFeedback?.message || 'Jalankan sample batch scan untuk mengambil feedback langsung dari backend.'"
            icon="ScanLine"
            tone="border-sky-200 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/10"
            badge-tone="bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200"
          />
        </div>

        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
            :disabled="isBatchSubmitting"
            @click="runBatchScan"
          >
            <BaseIcon :name="isBatchSubmitting ? 'LoaderCircle' : 'ScanSearch'" :size="16" :class="isBatchSubmitting ? 'animate-spin' : ''" />
            {{ isBatchSubmitting ? 'Running Batch...' : 'Run Sample Batch' }}
          </button>
        </div>
      </SectionCard>

      <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Tracking Scan Timeline" description="Riwayat scan dari asset tracking timeline, termasuk source dan match status.">
          <div v-if="trackingTimeline?.scans.length" class="space-y-3">
            <div
              v-for="scan in trackingTimeline.scans"
              :key="scan.id"
              class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ scan.code }}</p>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ scan.asset }}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{{ scan.type }}</span>
                  <span class="rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-400/20 dark:text-sky-200">{{ scan.matchStatus }}</span>
                </div>
              </div>
              <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {{ scan.location }} · {{ scan.source }}{{ scan.isBatch ? ' · batch' : '' }}
              </p>
              <p class="mt-2 text-xs font-medium tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">
                {{ formatDateTime(scan.time) }}
              </p>
            </div>
          </div>
          <div v-else class="rounded-[22px] border border-dashed border-slate-200/80 bg-slate-50/70 px-4 py-5 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-400">
            Belum ada timeline tracking yang bisa ditampilkan.
          </div>
        </SectionCard>

        <DataTable
          title="Verification List"
          description="Expected vs observed location serta resolution status hasil verifikasi."
          :rows="trackingVerificationRows"
          :columns="trackingVerificationColumns"
          search-placeholder="Cari verification result atau lokasi..."
          :search-keys="['result', 'expected_location', 'observed_location', 'resolution_status']"
          :page-size="4"
        />
      </div>

      <SectionCard title="Verification Dashboard" description="Shortcut ke discrepancy dashboard untuk Flow C: location discrepancies, missing assets, dan unverified assets.">
        <div class="grid gap-3 md:grid-cols-3">
          <RouterLink
            v-for="item in discrepancyCards"
            :key="item.title"
            :to="item.to"
            class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-sky-500/20"
          >
            <div class="flex items-start gap-3">
              <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                <BaseIcon :name="item.icon" :size="18" />
              </span>
              <div>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ item.value }}</p>
                <p class="mt-3 text-xs font-semibold tracking-[0.18em] text-sky-600 uppercase dark:text-sky-300">
                  Open Dashboard
                </p>
              </div>
            </div>
          </RouterLink>
        </div>
      </SectionCard>
    </section>

    <section v-else class="space-y-6">
      <DataTable
        title="Stocktake Sessions"
        :rows="rows"
        :columns="columns"
        :selected-row-id="selectedSessionId"
        :clickable-rows="true"
        :actions="[
          { label: 'Create New', to: '/tracking/new', icon: 'Plus', tone: 'primary' },
        ]"
        :row-actions="{
          editPath: (row) => `/tracking/${row.id}/edit`,
          deleteTitle: 'Delete Stocktake Session',
          resolveRowLabel: (row) => String(row.session ?? row.id),
          deleteMessage: (row) => `Sesi ${String(row.session ?? row.id)} akan dihapus dari daftar stocktake. Pastikan progress verifikasi sudah tidak diperlukan.`,
          onDelete: handleDeleteTracking,
        }"
        search-placeholder="Cari session, location, atau status..."
        :search-keys="['session', 'location', 'status']"
        @select="selectedSessionId = String($event.id)"
      />

      <div v-if="isLoading || isDetailLoading" class="rounded-[24px] border border-slate-200/80 bg-white/80 px-5 py-4 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
        Memuat data stocktake dan scan events...
      </div>

      <template v-if="selectedSession">
        <div class="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <SectionCard :title="`${selectedSession.sessionNumber} - ${selectedSession.locationName}`">
            <div class="grid gap-4 md:grid-cols-3">
              <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
                <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Session Window</p>
                <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <p><span class="font-medium">Window:</span> {{ formatWindow(selectedSession.plannedStartAt, selectedSession.plannedEndAt) }}</p>
                  <p><span class="font-medium">Scope:</span> {{ selectedSession.scopeType }}</p>
                  <p><span class="font-medium">Status:</span> {{ formatEnumLabel(selectedSession.status) }}</p>
                </div>
              </div>

              <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/40">
                <p class="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Stocktake Progress</p>
                <div class="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                  <p><span class="font-medium">Verified:</span> {{ selectedSession.resultCount }} / {{ selectedSession.expectedItemCount }}</p>
                  <p><span class="font-medium">Unmatched:</span> {{ countUnmatchedEvents(selectedSession) }}</p>
                  <p><span class="font-medium">Last Event:</span> {{ latestEventTime(selectedSession) }}</p>
                </div>
              </div>

              <DetailHighlightCard
                eyebrow="Operational Note"
                :status-label="formatEnumLabel(selectedSession.status)"
                :note="selectedSession.notes || 'Belum ada catatan operasional.'"
                :icon="
                  selectedSession.status === 'APPROVED'
                    ? 'BadgeCheck'
                    : selectedSession.status === 'COMPLETED'
                      ? 'ClipboardCheck'
                      : selectedSession.status === 'IN_PROGRESS'
                        ? 'ScanSearch'
                        : 'Clock3'
                "
                :tone="
                  selectedSession.status === 'DRAFT'
                    ? 'border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-slate-950/40'
                    : selectedSession.status === 'IN_PROGRESS'
                      ? 'border-sky-200 bg-sky-50/80 dark:border-sky-500/20 dark:bg-sky-500/10'
                      : selectedSession.status === 'COMPLETED'
                        ? 'border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10'
                        : 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10'
                "
                :badge-tone="
                  selectedSession.status === 'DRAFT'
                    ? 'bg-slate-200/80 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                    : selectedSession.status === 'IN_PROGRESS'
                      ? 'bg-sky-500/15 text-sky-700 ring-sky-400/20 dark:text-sky-200'
                      : selectedSession.status === 'COMPLETED'
                        ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                        : 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
                "
              />
            </div>
          </SectionCard>

          <SectionCard title="Session Operational Detail">
            <div class="space-y-3">
              <div
                v-for="row in sessionSummaryRows"
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
          <div class="space-y-6">
            <SectionCard title="QR Scan Console">
              <div class="space-y-5">
                <div class="overflow-hidden rounded-[28px] border border-slate-200/80 bg-slate-950 dark:border-white/10">
                  <video
                    ref="videoRef"
                    class="aspect-[16/9] w-full object-cover"
                    playsinline
                    muted
                  />
                </div>

                <div class="flex flex-wrap gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500"
                    :disabled="scanState.isStarting || scanState.isScanning || isScanSubmitting"
                    @click="startScanner"
                  >
                    <BaseIcon :name="scanState.isStarting ? 'LoaderCircle' : 'Camera'" :size="16" :class="scanState.isStarting ? 'animate-spin' : ''" />
                    {{ scanState.isStarting ? 'Starting...' : 'Start QR Scan' }}
                  </button>

                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-400 hover:text-sky-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
                    :disabled="!scanState.isScanning"
                    @click="stopScanner"
                  >
                    <BaseIcon name="CircleStop" :size="16" />
                    Stop
                  </button>
                </div>

                <div class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">Manual scan input</p>
                    <span class="rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {{ selectedSession.locationName }}
                    </span>
                  </div>

                  <div class="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      v-model="manualCode"
                      type="text"
                      placeholder="Masukkan kode QR atau asset tag..."
                      class="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      class="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500"
                      :disabled="isScanSubmitting"
                      @click="handleManualScan"
                    >
                      <BaseIcon :name="isScanSubmitting ? 'LoaderCircle' : 'ScanLine'" :size="16" :class="isScanSubmitting ? 'animate-spin' : ''" />
                      {{ isScanSubmitting ? 'Submitting...' : 'Submit Scan' }}
                    </button>
                  </div>

                  <p v-if="scanState.errorMessage" class="mt-3 text-sm leading-6 text-rose-600 dark:text-rose-300">
                    {{ scanState.errorMessage }}
                  </p>
                  <p v-else-if="scanFeedback" class="mt-3 text-sm leading-6 text-emerald-600 dark:text-emerald-300">
                    {{ scanFeedback }}
                  </p>

                  <p class="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Kamera QR scan berjalan optimal di `https` atau `localhost`, dan browser yang mendukung `BarcodeDetector`.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Expected Asset Snapshot">
              <DetailGridTable
                :columns="expectedAssetColumns"
                :rows="expectedAssetRows"
                desktop-grid-class="md:grid-cols-[0.8fr_1.2fr_1fr] gap-2"
                empty-message="Snapshot expected asset belum tersedia atau backend belum mengembalikan daftar expected items untuk sesi ini."
              />
            </SectionCard>

            <DataTable
              title="Results Table"
              description="Hasil scan stocktake untuk sesi terpilih, sesuai rekomendasi mock guide."
              :rows="stocktakeResultRows"
              :columns="stocktakeResultColumns"
              search-placeholder="Cari code, asset, atau result..."
              :search-keys="['code', 'asset', 'result', 'notes']"
              :page-size="5"
            />
          </div>

          <div class="space-y-6">
            <SectionCard title="Next State Action">
              <div class="space-y-4">
                <textarea
                  v-model="workflowNote"
                  rows="3"
                  placeholder="Tambahkan catatan workflow jika diperlukan..."
                  class="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100"
                />

                <div v-if="availableWorkflowActions.length" class="space-y-3">
                  <button
                    v-for="item in availableWorkflowActions"
                    :key="item.key"
                    type="button"
                    class="flex w-full items-start gap-3 rounded-[22px] border p-4 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    :class="item.tone"
                    :disabled="isActionSubmitting"
                    @click="handleWorkflowAction(item.key as 'start' | 'complete' | 'approve')"
                  >
                    <span class="rounded-2xl bg-white/80 p-2 ring-1 ring-white/60 dark:bg-slate-950/30 dark:ring-white/10">
                      <BaseIcon :name="isActionSubmitting ? 'LoaderCircle' : item.icon" :size="16" :class="isActionSubmitting ? 'animate-spin' : ''" />
                    </span>
                    <span>
                      <span class="block text-sm font-semibold">{{ item.label }}</span>
                      <span class="mt-1 block text-xs leading-5 opacity-80">{{ item.description }}</span>
                    </span>
                  </button>
                </div>

                <div
                  v-else
                  class="rounded-[22px] border border-emerald-200 bg-emerald-50/70 px-4 py-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                >
                  Tidak ada next state action. Sesi ini sudah berada di status akhir atau menunggu proses lain.
                </div>

                <p v-if="actionFeedback" class="text-sm leading-6 text-slate-500 dark:text-slate-300">
                  {{ actionFeedback }}
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Recent Scan Events">
              <div v-if="scanEvents.length" class="space-y-3">
                <div
                  v-for="event in scanEvents"
                  :key="event.id"
                  class="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ event.code }}</p>
                      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ event.asset }}</p>
                    </div>
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                      :class="
                        event.result === 'MATCHED'
                          ? 'bg-emerald-500/15 text-emerald-700 ring-emerald-400/20 dark:text-emerald-200'
                          : event.result === 'DUPLICATE'
                            ? 'bg-amber-500/15 text-amber-700 ring-amber-400/20 dark:text-amber-200'
                            : 'bg-rose-500/15 text-rose-700 ring-rose-400/20 dark:text-rose-200'
                      "
                    >
                      {{ event.result }}
                    </span>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ event.note }}</p>
                  <p class="mt-2 text-xs font-medium tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">
                    {{ formatDateTime(event.time) }}
                  </p>
                </div>
              </div>
              <div v-else class="rounded-[22px] border border-dashed border-slate-200/80 bg-slate-50/70 px-4 py-5 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950/30 dark:text-slate-400">
                Belum ada scan event yang bisa ditampilkan untuk sesi ini.
              </div>
            </SectionCard>

            <SectionCard title="Verification Mix">
              <BaseChart type="donut" :height="320" :options="verificationMixOptions" :series="verificationMixSeries" />
            </SectionCard>
          </div>
        </div>
      </template>

      <SectionCard title="Discrepancy Dashboard" description="Buka report verification untuk melihat discrepancy, missing assets, dan unverified aging dari hasil stocktake.">
        <div class="flex flex-wrap gap-3">
          <RouterLink
            to="/reports/tracking-verification"
            class="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:border-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <BaseIcon name="ArrowRight" :size="15" />
            Open Verification Dashboard
          </RouterLink>
        </div>
      </SectionCard>
    </section>
  </div>
</template>
