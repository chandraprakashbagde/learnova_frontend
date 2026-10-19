import { apiGet, apiPost, http } from '@/common/api/http'

/**
 * Admin API service for subject and qualification master data.
 *
 * ⚠️ Backend status: the FastAPI backend currently exposes NO subject or
 * qualification endpoints — a code search for `subject`/`qualification`
 * returns nothing, and only `/auth/*` is registered in `main.py`. The types
 * and endpoints below are the contract this service expects. Until the
 * backend implements them, calls return 404 and the UI shows its error
 * state — no mock data is substituted.
 *
 * Endpoints consumed:
 *   GET  /admin/subjects                -> MasterDataListResponse<MasterDataItem>
 *   POST /admin/subjects                -> MasterDataItem      (create)
 *   PUT  /admin/subjects/{id}           -> MasterDataItem      (edit)
 *   GET  /admin/qualifications          -> MasterDataListResponse<MasterDataItem>
 *   POST /admin/qualifications          -> MasterDataItem      (create)
 *   PUT  /admin/qualifications/{id}     -> MasterDataItem      (edit)
 *
 * Data-integrity note: there is intentionally NO delete endpoint here. The
 * spec forbids permanently deleting subjects/qualification types that are
 * referenced by teacher records without an explicit backend business rule,
 * so the UI offers create + edit only.
 */

/** A subject or qualification type record. */
export interface MasterDataItem {
  id: number
  name: string
  /** ISO-8601 creation timestamp, when the backend provides it. */
  created_at?: string | null
  /** Number of teachers referencing this record, when the backend provides it. */
  teacher_count?: number | null
}

/** Paginated list envelope shared by subjects and qualifications. */
export interface MasterDataListResponse {
  items: MasterDataItem[]
  total: number
  page: number
  page_size: number
}

/** Query params for list endpoints. */
export interface MasterDataListParams {
  page?: number
  page_size?: number
  /** Free-text search over the name, handled server-side. */
  search?: string
  order_by?: string
  order?: 'asc' | 'desc'
}

/** Payload for create/edit — the name is the only required field. */
export interface MasterDataInput {
  name: string
}

/** Which collection a service instance targets. */
export type MasterDataKind = 'subjects' | 'qualifications'

/** GET the paginated list for a collection. */
export async function listMasterData(
  kind: MasterDataKind,
  params: MasterDataListParams = {},
): Promise<MasterDataListResponse> {
  const response = await apiGet<MasterDataListResponse>(`/admin/${kind}`, { params })
  return response.data
}

/** POST a new record into a collection. */
export async function createMasterData(
  kind: MasterDataKind,
  input: MasterDataInput,
): Promise<MasterDataItem> {
  const response = await apiPost<MasterDataItem>(`/admin/${kind}`, input)
  return response.data
}

/** PUT an edit to an existing record. */
export async function updateMasterData(
  kind: MasterDataKind,
  id: number,
  input: MasterDataInput,
): Promise<MasterDataItem> {
  const response = await http.put<MasterDataItem>(`/admin/${kind}/${id}`, input)
  if (response.status >= 400) {
    throw new Error(`Failed to update (HTTP ${response.status}).`)
  }
  return response.data as MasterDataItem
}
