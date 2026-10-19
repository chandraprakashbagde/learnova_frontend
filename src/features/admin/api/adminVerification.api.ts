import { http, apiGet, apiPost } from '@/common/api/http'

/**
 * Admin verification API service.
 *
 * ⚠️ Backend status: the FastAPI backend currently exposes NO verification
 * endpoints — `app/teacher/teacher_registration/router.py` is empty and not
 * registered in `main.py`, and there are no models for
 * `teacher_verification_documents` or `vrfn_actn_hstry`. The types and
 * endpoints below are the contract this service expects, derived from the
 * documented tables. Until the backend implements them, these calls return
 * 404 and the UI shows its error state — no mock data is substituted.
 *
 * Endpoints consumed:
 *   GET  /admin/verification-documents                 -> VerificationQueueResponse
 *   GET  /admin/verification-documents/{docId}         -> VerificationDocument
 *   GET  /admin/verification-documents/{docId}/history -> VerificationHistoryEntry[]
 *   POST /admin/verification-documents/{docId}/approve -> VerificationDocument
 *   POST /admin/verification-documents/{docId}/reject  -> VerificationDocument
 *   GET  /admin/verification-documents/{docId}/file    -> binary (authenticated)
 *   GET  /admin/teachers/{id}/qualifications/{qid}/verification-history
 *                                                      -> QualificationHistoryResponse
 *
 * History is read-only on the frontend: entries are never overwritten,
 * edited, or deleted from the client. Superseded uploads stay retrievable
 * for authorised historical review.
 *
 * Security notes:
 * - Status changes are authoritative on the backend; the frontend only
 *   submits the request and re-reads the returned state. It never flips
 *   local status to pretend an action succeeded.
 * - Document files are fetched through the authenticated `http` client
 *   (Bearer token attached) and turned into short-lived blob URLs for
 *   preview/download — no public/permanent file URL is ever rendered.
 */

/** `teacher_verification_documents.current_status`. */
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/** `vrfn_actn_hstry.action_type`. */
export type DocumentActionType =
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_REUPLOADED'

/** A row from `teacher_verification_documents`, joined with teacher/qualification info. */
export interface VerificationDocument {
  /** `teacher_verification_documents.doc_id`. */
  doc_id: number
  /** `teacher_verification_documents.teacher_id`. */
  teacher_id: number
  teacher_name: string
  teacher_email: string
  /** `teacher_verification_documents.qualification_id`. */
  qualification_id: number
  qualification_name: string
  /**
   * Storage reference only. Never rendered directly as a public URL — the
   * file must be fetched via the authenticated `/file` endpoint.
   */
  document_url: string | null
  /** `teacher_verification_documents.current_status`. */
  current_status: DocumentStatus
  /** `teacher_verification_documents.supersedes_document_id`. */
  supersedes_document_id: number | null
  /** ISO-8601 upload timestamp (`created_at`). */
  created_at: string
  /** ISO-8601 (`updated_at`). */
  updated_at: string
  /** Optional file metadata the backend may provide for preview/download. */
  file_name?: string | null
  file_type?: string | null
  file_size?: number | null
}

/** A row from `vrfn_actn_hstry`. */
export interface VerificationHistoryEntry {
  id: number
  doc_id: number
  action_type: DocumentActionType
  /** Rejection reason / review comment. */
  comment: string | null
  /** Admin (or system) identifier who performed the action. */
  action_by: string
  /** ISO-8601. */
  created_at: string
}

/** Query params for the verification queue. */
export interface VerificationQueueParams {
  page?: number
  page_size?: number
  /** Free-text search over teacher name/email. */
  search?: string
  /** Filter by `current_status`. */
  current_status?: DocumentStatus
  /** Filter by qualification id. */
  qualification_id?: number
  /**
   * Include superseded uploads. The UI keeps this off by default so
   * re-uploads don't show as active review requests.
   */
  include_superseded?: boolean
  order_by?: string
  order?: 'asc' | 'desc'
}

/** Paginated queue envelope. */
export interface VerificationQueueResponse {
  items: VerificationDocument[]
  total: number
  page: number
  page_size: number
}

/** Payload for the reject endpoint — a non-empty reason is required. */
export interface RejectDocumentInput {
  reason: string
}

/**
 * One upload attempt in a qualification's history, carrying its OWN current
 * status (never inherited from the document it supersedes) plus the action
 * events recorded against it.
 */
export interface QualificationUpload {
  doc_id: number
  /** `current_status` of THIS upload — approval is never inherited. */
  current_status: DocumentStatus
  /** The doc this upload replaces, or null for the original upload. */
  supersedes_document_id: number | null
  /** ISO-8601 upload timestamp. */
  created_at: string
  file_name?: string | null
  file_type?: string | null
  /** Action history events for this specific upload. */
  events: VerificationHistoryEntry[]
}

/**
 * Full verification history for one qualification of one teacher: every
 * upload attempt (original + replacements) with its own status and events,
 * plus a merged chronological timeline across all uploads.
 */
export interface QualificationHistoryResponse {
  teacher_id: number
  qualification_id: number
  qualification_name: string
  /** Every upload attempt, ordered oldest-first. */
  uploads: QualificationUpload[]
  /** All events across every upload, merged and ordered oldest-first. */
  timeline: VerificationHistoryEntry[]
}

/** GET /admin/verification-documents — paginated review queue. */
export async function listVerificationDocuments(
  params: VerificationQueueParams = {},
): Promise<VerificationQueueResponse> {
  const response = await apiGet<VerificationQueueResponse>('/admin/verification-documents', { params })
  return response.data
}

/** GET /admin/verification-documents/{docId} — a single document for review. */
export async function getVerificationDocument(docId: number | string): Promise<VerificationDocument> {
  const response = await apiGet<VerificationDocument>(`/admin/verification-documents/${docId}`)
  return response.data
}

/** GET /admin/verification-documents/{docId}/history — superseded uploads + action trail. */
export async function getVerificationDocumentHistory(
  docId: number | string,
): Promise<VerificationHistoryEntry[]> {
  const response = await apiGet<VerificationHistoryEntry[]>(
    `/admin/verification-documents/${docId}/history`,
  )
  return response.data
}

/**
 * GET /admin/teachers/{teacherId}/qualifications/{qualificationId}/verification-history
 * — every upload attempt (original + replacements) for a qualification,
 * each with its own status and action events, plus a merged timeline.
 *
 * This is the shape the backend must return so the UI can identify
 * individual uploads and their history events. See QualificationHistoryResponse.
 */
export async function getQualificationVerificationHistory(
  teacherId: number | string,
  qualificationId: number | string,
): Promise<QualificationHistoryResponse> {
  const response = await apiGet<QualificationHistoryResponse>(
    `/admin/teachers/${teacherId}/qualifications/${qualificationId}/verification-history`,
  )
  return response.data
}

/**
 * POST /admin/verification-documents/{docId}/approve.
 * The backend flips `current_status` to APPROVED and writes a
 * `DOCUMENT_APPROVED` history event atomically; we return the updated doc.
 */
export async function approveVerificationDocument(docId: number | string): Promise<VerificationDocument> {
  const response = await apiPost<VerificationDocument>(
    `/admin/verification-documents/${docId}/approve`,
  )
  return response.data
}

/**
 * POST /admin/verification-documents/{docId}/reject.
 * The backend flips `current_status` to REJECTED and writes a
 * `DOCUMENT_REJECTED` history event carrying the comment.
 */
export async function rejectVerificationDocument(
  docId: number | string,
  input: RejectDocumentInput,
): Promise<VerificationDocument> {
  const response = await apiPost<VerificationDocument>(
    `/admin/verification-documents/${docId}/reject`,
    input,
  )
  return response.data
}

/**
 * Securely fetches a verification document through the authenticated client
 * (Bearer token attached) and returns a short-lived blob URL for
 * preview/download. Throws on failure so callers can surface an error.
 *
 * The blob URL is only valid until the page is unloaded or `revokeBlobUrl`
 * is called — it is never a public URL.
 */
export async function fetchVerificationDocumentFile(
  docId: number | string,
): Promise<{ blobUrl: string; mimeType: string }> {
  const response = await http.get(`/admin/verification-documents/${docId}/file`, {
    responseType: 'blob',
  })
  if (response.status >= 400) {
    throw new Error(`Failed to load the document file (HTTP ${response.status}).`)
  }
  const blob = response.data as Blob
  return { blobUrl: URL.createObjectURL(blob), mimeType: blob.type }
}

/** Releases a blob URL created by `fetchVerificationDocumentFile`. */
export function revokeBlobUrl(blobUrl: string): void {
  URL.revokeObjectURL(blobUrl)
}
