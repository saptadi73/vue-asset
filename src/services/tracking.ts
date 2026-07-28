import { ApiError, apiRequest } from '@/services/http'

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

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const mutableMockSessions: StocktakeSessionApi[] = [
  {
    id: 'mock-stk-hq-1',
    session_number: 'STK-HQ-JUL',
    location_id: 'loc-hq-wh',
    scope_type: 'LOCATION',
    status: 'IN_PROGRESS',
    planned_start_at: '2026-07-27T02:00:00Z',
    planned_end_at: '2026-07-31T10:00:00Z',
    started_at: '2026-07-27T02:10:00Z',
    completed_at: null,
    approved_at: null,
    notes: 'Masih ada area rack C dan pallet outbound yang perlu diverifikasi ulang.',
    expected_item_count: 340,
    result_count: 312,
    location: {
      id: 'loc-hq-wh',
      location_code: 'HQ-WH',
      location_name: 'HQ Warehouse',
      location_type: 'WAREHOUSE',
    },
    expected_items: [
      {
        id: 'exp-1',
        asset_id: 'asset-ast-0001',
        expected_location_id: 'loc-hq-wh',
        asset: { id: 'asset-ast-0001', asset_code: 'AST-0001', asset_name: 'Dell Latitude 7440', tag_number: 'AST-0001' },
      },
      {
        id: 'exp-2',
        asset_id: 'asset-ast-0003',
        expected_location_id: 'loc-hq-wh',
        asset: { id: 'asset-ast-0003', asset_code: 'AST-0003', asset_name: 'Forklift FL-12', tag_number: 'AST-0003' },
      },
      {
        id: 'exp-3',
        asset_id: 'asset-ast-0005',
        expected_location_id: 'loc-hq-wh',
        asset: { id: 'asset-ast-0005', asset_code: 'AST-0005', asset_name: 'CCTV Dome Lobby A', tag_number: 'AST-0005' },
      },
    ],
    results: [
      {
        id: 'res-1',
        result_type: 'FOUND',
        notes: 'Aset ditemukan sesuai rack A-03.',
        created_at: '2026-07-28T02:14:00Z',
        asset: { asset_code: 'AST-0001', asset_name: 'Dell Latitude 7440', tag_number: 'AST-0001' },
      },
      {
        id: 'res-2',
        result_type: 'UNEXPECTED',
        notes: 'Tag ditemukan tetapi belum masuk ke snapshot expected.',
        created_at: '2026-07-28T02:08:00Z',
        asset: { asset_code: 'AST-0088', asset_name: 'Unknown asset tag', tag_number: 'AST-0088' },
      },
      {
        id: 'res-3',
        result_type: 'DUPLICATE_TAG',
        notes: 'Tag ini sudah pernah discan pada shift pagi.',
        created_at: '2026-07-28T01:57:00Z',
        asset: { asset_code: 'AST-0102', asset_name: 'UPS 1200VA', tag_number: 'AST-0102' },
      },
    ],
  },
  {
    id: 'mock-stk-sitea-2',
    session_number: 'STK-SITEA-JUL',
    location_id: 'loc-site-a',
    scope_type: 'LOCATION',
    status: 'COMPLETED',
    planned_start_at: '2026-07-25T01:00:00Z',
    planned_end_at: '2026-07-29T09:00:00Z',
    started_at: '2026-07-25T01:05:00Z',
    completed_at: '2026-07-28T01:42:00Z',
    approved_at: null,
    notes: 'Menunggu approval hasil recount dua asset bergerak.',
    expected_item_count: 156,
    result_count: 141,
    location: {
      id: 'loc-site-a',
      location_code: 'SITE-A',
      location_name: 'Site A',
      location_type: 'SITE',
    },
    expected_items: [],
    results: [
      {
        id: 'res-4',
        result_type: 'FOUND',
        notes: 'Posisi sesuai ruang panel.',
        created_at: '2026-07-28T01:42:00Z',
        asset: { asset_code: 'AST-0201', asset_name: 'Site A Router', tag_number: 'AST-0201' },
      },
      {
        id: 'res-5',
        result_type: 'UNKNOWN_TAG',
        notes: 'Tag rusak dan perlu relabel.',
        created_at: '2026-07-28T01:37:00Z',
        asset: { asset_code: 'AST-0208', asset_name: 'Office Chair Asset Tag', tag_number: 'AST-0208' },
      },
    ],
  },
  {
    id: 'mock-stk-branchw-3',
    session_number: 'STK-BRANCHW-JUL',
    location_id: 'loc-branch-west',
    scope_type: 'LOCATION',
    status: 'APPROVED',
    planned_start_at: '2026-07-20T01:00:00Z',
    planned_end_at: '2026-07-24T09:00:00Z',
    started_at: '2026-07-20T01:04:00Z',
    completed_at: '2026-07-24T09:27:00Z',
    approved_at: '2026-07-24T10:00:00Z',
    notes: 'Seluruh asset sudah cocok dengan lokasi fisik dan hasil stocktake telah disetujui.',
    expected_item_count: 98,
    result_count: 98,
    location: {
      id: 'loc-branch-west',
      location_code: 'BR-WEST',
      location_name: 'Branch West',
      location_type: 'BRANCH',
    },
    expected_items: [],
    results: [
      {
        id: 'res-6',
        result_type: 'FOUND',
        notes: 'Stocktake selesai tanpa discrepancy.',
        created_at: '2026-07-24T09:27:00Z',
        asset: { asset_code: 'AST-0302', asset_name: 'Branch West Printer', tag_number: 'AST-0302' },
      },
    ],
  },
]

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

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const getMockSessionById = (sessionId: string) => {
  const session = mutableMockSessions.find((item) => item.id === sessionId)

  if (!session) {
    throw new ApiError('Mock stocktake session tidak ditemukan.', 404, 'STOCKTAKE_SESSION_NOT_FOUND')
  }

  return session
}

const useMockFallback = <T>(factory: () => T) => {
  try {
    return factory()
  } catch (error) {
    throw error instanceof ApiError ? error : new ApiError('Fallback mock gagal diproses.', 500, 'TRACKING_MOCK_ERROR')
  }
}

export const fetchStocktakeSessions = async () => {
  try {
    const response = await apiRequest<StocktakeSessionApi[]>('/stocktakes')
    return {
      items: response.data.map(formatSession),
      pagination: response.meta.pagination || null,
      source: 'api' as const,
    }
  } catch {
    return useMockFallback<TrackingSessionsResponse>(() => ({
      items: clone(mutableMockSessions).map(formatSession),
      pagination: {
        page: 1,
        page_size: mutableMockSessions.length,
        total_items: mutableMockSessions.length,
        total_pages: 1,
      },
      source: 'mock',
    }))
  }
}

export const fetchStocktakeSessionDetail = async (sessionId: string) => {
  try {
    const response = await apiRequest<StocktakeSessionApi>(`/stocktakes/${sessionId}`)
    return {
      item: formatSession(response.data),
      source: 'api' as const,
    }
  } catch {
    return useMockFallback(() => ({
      item: formatSession(clone(getMockSessionById(sessionId))),
      source: 'mock' as const,
    }))
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

  try {
    const response = await apiRequest<StocktakeSessionApi>(`/stocktakes/${sessionId}/${action}`, {
      method: 'POST',
      body,
    })

    return {
      item: formatSession(response.data),
      source: 'api' as const,
    }
  } catch {
    return useMockFallback(() => {
      const session = getMockSessionById(sessionId)
      const now = new Date().toISOString()

      if (action === 'start') {
        session.status = 'IN_PROGRESS'
        session.started_at = now
      }

      if (action === 'complete') {
        session.status = 'COMPLETED'
        session.completed_at = now
      }

      if (action === 'approve') {
        session.status = 'APPROVED'
        session.approved_at = now
      }

      if (notes) {
        session.notes = notes
      }

      return {
        item: formatSession(clone(session)),
        source: 'mock' as const,
      }
    })
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

  try {
    const response = await apiRequest<ScanEventApi>(`/stocktakes/${payload.sessionId}/scan`, {
      method: 'POST',
      body: requestBody,
    })

    return {
      event: toScanEventFromApi(response.data),
      source: 'api' as const,
    }
  } catch {
    return useMockFallback<TrackingScanSubmission>(() => {
      const session = getMockSessionById(payload.sessionId)
      const normalized = requestBody.raw_tag_uid
      const existing = (session.results || []).some((item) => {
        const knownCode = item.asset?.tag_number || item.asset?.asset_code
        return knownCode?.toUpperCase() === normalized
      })

      let resultType: StocktakeResultType = 'UNKNOWN_TAG'
      let assetCode = normalized
      let assetName = 'Unknown asset tag'
      let note = 'Belum ada padanan master asset atau lokasi tidak cocok.'

      if (existing) {
        resultType = 'DUPLICATE_TAG'
        assetName = 'Already scanned asset'
        note = 'Tag ini sudah masuk ke sesi stocktake saat ini.'
      } else if ((session.expected_items || []).some((item) => {
        const knownCode = item.asset?.tag_number || item.asset?.asset_code
        return knownCode?.toUpperCase() === normalized
      })) {
        const matched = (session.expected_items || []).find((item) => {
          const knownCode = item.asset?.tag_number || item.asset?.asset_code
          return knownCode?.toUpperCase() === normalized
        })
        resultType = 'FOUND'
        assetCode = matched?.asset?.asset_code || normalized
        assetName = matched?.asset?.asset_name || normalized
        note = 'QR cocok dengan master asset dan lokasi aktif.'
      } else if (normalized.startsWith('AST-')) {
        resultType = 'UNEXPECTED'
        assetCode = normalized
        assetName = 'Unexpected asset outside expected scope'
        note = 'Aset dikenali, tetapi tidak termasuk snapshot expected session ini.'
      }

      const createdAt = new Date().toISOString()
      const result: StocktakeResult = {
        id: generateId(),
        result_type: resultType,
        created_at: createdAt,
        notes: note,
        asset: {
          asset_code: assetCode,
          asset_name: assetName,
          tag_number: normalized,
        },
      }

      session.results = [result, ...(session.results || [])]
      session.result_count = (session.result_count || 0) + (resultType === 'DUPLICATE_TAG' ? 0 : 1)

      return {
        event: toTrackingEvent(result),
        source: 'mock' as const,
      }
    })
  }
}
