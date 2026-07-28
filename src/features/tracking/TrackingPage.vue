<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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
  fetchStocktakeSessionDetail,
  fetchStocktakeSessions,
  mapTrackingEventsFromSession,
  submitStocktakeScan,
  submitStocktakeWorkflowAction,
  type StocktakeStatus,
  type TrackingScanEvent,
  type TrackingSession,
} from '@/services/tracking'
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

const rows = ref<TrackingRow[]>([])
const selectedSessionId = ref('')
const selectedSessionDetail = ref<TrackingSession | null>(null)
const scanEvents = ref<TrackingScanEvent[]>([])
const dataSource = ref<'api' | 'mock'>('mock')
const loadError = ref('')
const actionFeedback = ref('')
const scanFeedback = ref('')
const workflowNote = ref('')
const manualCode = ref('')
const isLoading = ref(false)
const isDetailLoading = ref(false)
const isActionSubmitting = ref(false)
const isScanSubmitting = ref(false)

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

  const requestToken = ++detailRequestToken
  isDetailLoading.value = true

  try {
    const response = await fetchStocktakeSessionDetail(sessionId)

    if (requestToken !== detailRequestToken) return

    dataSource.value = response.source
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
  isLoading.value = true
  loadError.value = ''

  try {
    const response = await fetchStocktakeSessions()
    dataSource.value = response.source
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
    scanFeedback.value =
      response.source === 'api'
        ? `Scan ${normalized} berhasil dikirim ke backend.`
        : `Scan ${normalized} masuk ke mode mock frontend.`

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
    actionFeedback.value =
      response.source === 'api'
        ? `Workflow ${actionKey} berhasil dijalankan ke backend.`
        : `Workflow ${actionKey} dijalankan dalam mode mock frontend.`
    workflowNote.value = ''
  } catch (error) {
    actionFeedback.value = error instanceof Error ? error.message : 'Workflow action gagal dijalankan.'
  } finally {
    isActionSubmitting.value = false
  }
}

const handleDeleteTracking = async (row: Record<string, unknown>) => {
  await deleteCrudRecord(crudConfig, String(row.id))
}

watch(selectedSessionId, async (nextId, previousId) => {
  if (!nextId || nextId === previousId) return

  workflowNote.value = ''
  actionFeedback.value = ''
  scanFeedback.value = ''
  await loadSessionDetail(nextId)
})

onMounted(async () => {
  await loadSessions()
})

onBeforeUnmount(() => {
  stopScanner()
})
</script>

<template>
  <div class="space-y-8">
    <div
      v-if="dataSource === 'mock' || loadError"
      class="rounded-[24px] border px-4 py-3 text-sm"
      :class="
        loadError
          ? 'border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200'
          : 'border-sky-200 bg-sky-50/80 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200'
      "
    >
      {{ loadError || 'Halaman tracking sedang memakai fallback mock agar frontend tetap bisa dikembangkan saat backend atau token belum aktif.' }}
    </div>

    <section class="grid gap-4 lg:grid-cols-3">
      <MetricCard v-for="item in metrics" :key="item.title" :item="item" />
    </section>

    <section class="space-y-6">
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
                    <p class="text-sm font-semibold text-slate-900 dark:text-white">Manual scan fallback</p>
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
    </section>
  </div>
</template>
