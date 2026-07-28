import { apiRequest } from '@/services/http'
import { liveSeedIds } from '@/data/liveSeedIds'

export type StocktakeStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED'
export type StocktakeResultType = 'FOUND' | 'WRONG_LOCATION' | 'UNEXPECTED' | 'DUPLICATE_TAG' | 'UNKNOWN_TAG' | 'MISSING'

interface StocktakeLocation {
  id: string
  location_code?: string | null
  location_name?: string | null
  location_type?: string | null
}

interface StocktakeAsset {
  id?: string | null
  asset_code?: string | null
  asset_name?: string | null
  tag_number?: string | null
  serial_number?: string | null
}

interface StocktakeExpectedItem {
  id: string
  asset_id?: string | null
  expected_location_id?: string | null
  asset?: StocktakeAsset | null
  expected_location?: StocktakeLocation | null
}

interface StocktakeResult {
  id?: string
  result_type?: StocktakeResultType | string | null
  notes?: string | null
  created_at?: string | null
  scan_event_id?: string | null
  asset?: StocktakeAsset | null
  expected_location?: StocktakeLocation | null
  observed_location?: StocktakeLocation | null
}

interface StocktakeSessionApi {
  id: string
  session_number: string
  location_id: string
  scope_type: string
  status: StocktakeStatus
  planned_start_at: string | null
  planned_end_at: string | null
  started_at: string | null
  completed_at: string | null
  approved_at?: string | null
  notes?: string | null
  expected_item_count?: number | null
  result_count?: number | null
  location?: StocktakeLocation | null
  expected_items?: StocktakeExpectedItem[] | null
  results?: StocktakeResult[] | null
}

interface ScanEventApi {
  id: string
  event_uid: string
  asset_id?: string | null
  raw_tag_uid: string
  scan_type: string
  scan_source: string
  scanned_location_id?: string | null
  scanned_at: string
  received_at?: string | null
  stocktake_session_id?: string | null
  match_status?: string | null
  processing_status?: string | null
  asset?: StocktakeAsset | null
  scanned_location?: StocktakeLocation | null
  metadata?: Record<string, unknown> | null
}

export interface TrackingScanEvent {
  id: string
  code: string
  result: 'MATCHED' | 'UNMATCHED' | 'DUPLICATE'
  asset: string
  time: string
  note: string
}

export interface AssetTrackingTimelineScan {
  id: string
  code: string
  type: string
  source: string
  time: string
  matchStatus: string
  location: string
  asset: string
  isBatch: boolean
}

export interface AssetTrackingVerification {
  id: string
  result: string
  verifiedAt: string
  resolutionStatus: string
  expectedLocation: string
  observedLocation: string
  notes: string
}

export interface AssetTrackingTimelineResponse {
  assetCode: string
  assetName: string
  scans: AssetTrackingTimelineScan[]
  verifications: AssetTrackingVerification[]
  source: 'api' | 'mock'
}

export interface TrackingBatchFeedback {
  message: string
  items: AssetTrackingTimelineScan[]
  source: 'api' | 'mock'
}

export interface SubmitTrackingBatchPayload {
  rawTagUid: string
  scannedLocationId: string
}

export interface TrackingSession {
  id: string
  sessionNumber: string
  locationId: string
  locationName: string
  scopeType: string
  status: StocktakeStatus
  plannedStartAt: string | null
  plannedEndAt: string | null
  startedAt: string | null
  completedAt: string | null
  approvedAt: string | null
  notes: string
  expectedItemCount: number
  resultCount: number
  expectedItems: StocktakeExpectedItem[]
  results: StocktakeResult[]
}

export interface TrackingSessionsResponse {
  items: TrackingSession[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  } | null
  source: 'api' | 'mock'
}

export interface SubmitStocktakeScanPayload {
  sessionId: string
  rawTagUid: string
  scannedLocationId: string
  scanSource?: 'MOBILE' | 'API' | 'SCANNER'
}

export interface TrackingScanSubmission {
  event: TrackingScanEvent
  source: 'api' | 'mock'
}

const formatSession = (session: StocktakeSessionApi): TrackingSession => ({
  id: session.id,
  sessionNumber: session.session_number,
  locationId: session.location_id,
  locationName: session.location?.location_name || session.location?.location_code || session.location_id,
  scopeType: session.scope_type,
  status: session.status,
  plannedStartAt: session.planned_start_at,
  plannedEndAt: session.planned_end_at,
  startedAt: session.started_at,
  completedAt: session.completed_at,
  approvedAt: session.approved_at || null,
  notes: session.notes || '',
  expectedItemCount: session.expected_item_count || 0,
  resultCount: session.result_count || 0,
  expectedItems: session.expected_items || [],
  results: session.results || [],
})

const toTrackingEvent = (result: StocktakeResult): TrackingScanEvent => {
  const resultType = (result.result_type || '').toUpperCase()
  const duplicate = resultType.includes('DUPLICATE')
  const unmatched = ['WRONG_LOCATION', 'UNEXPECTED', 'UNKNOWN_TAG', 'MISSING'].includes(resultType)

  return {
    id: result.id || `${result.asset?.asset_code || result.asset?.tag_number || 'scan'}-${result.created_at || 'now'}`,
    code: result.asset?.tag_number || result.asset?.asset_code || 'UNKNOWN-TAG',
    result: duplicate ? 'DUPLICATE' : unmatched ? 'UNMATCHED' : 'MATCHED',
    asset: result.asset?.asset_name || result.asset?.asset_code || 'Unknown asset',
    time: result.created_at || new Date().toISOString(),
    note: result.notes || resultType || 'Scan result recorded.',
  }
}

export const mapTrackingEventsFromSession = (session: TrackingSession) =>
  session.results.map(toTrackingEvent).sort((left, right) => right.time.localeCompare(left.time))

const toScanEventFromApi = (scan: ScanEventApi): TrackingScanEvent => {
  const matchStatus = (scan.match_status || '').toUpperCase()
  const duplicate = matchStatus.includes('DUPLICATE')
  const unmatched = ['WRONG_LOCATION', 'UNEXPECTED', 'UNKNOWN', 'NOT_FOUND'].some((keyword) => matchStatus.includes(keyword))

  return {
    id: scan.id,
    code: scan.asset?.tag_number || scan.asset?.asset_code || scan.raw_tag_uid,
    result: duplicate ? 'DUPLICATE' : unmatched ? 'UNMATCHED' : 'MATCHED',
    asset: scan.asset?.asset_name || scan.asset?.asset_code || scan.raw_tag_uid,
    time: scan.scanned_at,
    note: matchStatus ? `Match status: ${matchStatus}` : 'Scan berhasil diproses.',
  }
}

const toTimelineScan = (scan: {
  id: string
  raw_tag_uid: string
  scan_type: string
  scan_source: string
  scanned_at: string
  match_status?: string | null
  asset?: StocktakeAsset | null
  scanned_location?: { location_name?: string | null; location_code?: string | null } | null
  metadata?: Record<string, unknown> | null
}): AssetTrackingTimelineScan => ({
  id: scan.id,
  code: scan.asset?.tag_number || scan.asset?.asset_code || scan.raw_tag_uid,
  type: scan.scan_type,
  source: scan.scan_source,
  time: scan.scanned_at,
  matchStatus: scan.match_status || 'UNKNOWN',
  location: scan.scanned_location?.location_name || scan.scanned_location?.location_code || '-',
  asset: scan.asset?.asset_name || scan.asset?.asset_code || scan.raw_tag_uid,
  isBatch: Boolean(scan.metadata?.batch),
})

const toTrackingVerification = (verification: {
  id: string
  verification_result: string
  verified_at: string
  resolution_status: string
  expected_location?: { location_name?: string | null } | null
  observed_location?: { location_name?: string | null } | null
  notes?: string | null
}): AssetTrackingVerification => ({
  id: verification.id,
  result: verification.verification_result,
  verifiedAt: verification.verified_at,
  resolutionStatus: verification.resolution_status,
  expectedLocation: verification.expected_location?.location_name || '-',
  observedLocation: verification.observed_location?.location_name || '-',
  notes: verification.notes || '-',
})

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const fetchStocktakeSessions = async () => {
  const response = await apiRequest<StocktakeSessionApi[]>('/stocktakes')
  return {
    items: response.data.map(formatSession),
    pagination: response.meta.pagination || null,
    source: 'api' as const,
  }
}

export const fetchAssetTrackingTimeline = async (assetId?: string) => {
  const endpoint = `/assets/${assetId || liveSeedIds.asset_id}/tracking`
  const response = await apiRequest<{
    scans?: ScanEventApi[] | null
    verifications?: Array<{
      id: string
      verification_result: string
      verified_at: string
      resolution_status: string
      expected_location?: { location_name?: string | null } | null
      observed_location?: { location_name?: string | null } | null
      notes?: string | null
    }> | null
  }>(endpoint)

  const scans = response.data.scans || []

  return {
    assetCode: scans[0]?.asset?.asset_code || liveSeedIds.asset_tag_number,
    assetName: scans[0]?.asset?.asset_name || 'Seed Tracking Asset',
    scans: scans.map(toTimelineScan),
    verifications: (response.data.verifications || []).map(toTrackingVerification),
    source: 'api' as const,
  }
}

export const submitTrackingScanBatch = async (payload: SubmitTrackingBatchPayload) => {
  const requestBody = [
    {
      event_uid: generateId(),
      raw_tag_uid: payload.rawTagUid.trim().toUpperCase(),
      scan_type: 'CHECK_IN',
      scan_source: 'API',
      scanned_location_id: payload.scannedLocationId,
      scanned_at: '2026-07-27T10:05:00Z',
      received_at: '2026-07-27T10:05:05Z',
      metadata: {
        batch: true,
      },
    },
  ]

  const response = await apiRequest<ScanEventApi[]>('/tracking/scan-events/batch', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return {
    message: 'Batch scan event berhasil diproses.',
    items: response.data.map(toTimelineScan),
    source: 'api' as const,
  }
}

export const fetchStocktakeSessionDetail = async (sessionId: string) => {
  const response = await apiRequest<StocktakeSessionApi>(`/stocktakes/${sessionId}`)
  return {
    item: formatSession(response.data),
    source: 'api' as const,
  }
}

export const submitStocktakeWorkflowAction = async (
  sessionId: string,
  action: 'start' | 'complete' | 'approve',
  notes?: string,
) => {
  const body = {
    acted_at: new Date().toISOString(),
    ...(notes ? { notes } : {}),
  }

  const response = await apiRequest<StocktakeSessionApi>(`/stocktakes/${sessionId}/${action}`, {
    method: 'POST',
    body,
  })

  return {
    item: formatSession(response.data),
    source: 'api' as const,
  }
}

export const submitStocktakeScan = async (payload: SubmitStocktakeScanPayload) => {
  const requestBody = {
    event_uid: generateId(),
    raw_tag_uid: payload.rawTagUid.trim().toUpperCase(),
    scan_type: 'STOCKTAKE',
    scan_source: payload.scanSource || 'MOBILE',
    scanned_location_id: payload.scannedLocationId,
    scanned_at: new Date().toISOString(),
    received_at: new Date().toISOString(),
    metadata: {
      stocktake: true,
    },
  }

  const response = await apiRequest<ScanEventApi>(`/stocktakes/${payload.sessionId}/scan`, {
    method: 'POST',
    body: requestBody,
  })

  return {
    event: toScanEventFromApi(response.data),
    source: 'api' as const,
  }
}
