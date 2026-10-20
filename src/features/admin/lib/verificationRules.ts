import type { QualificationUpload } from '@/features/admin/api/adminVerification.api'

/**
 * Pure, framework-free rules for the document verification workflow.
 *
 * Kept free of React so the approve/reject validation and the
 * original/replacement/superseded classification can be unit-tested
 * directly. These mirror what the backend enforces — the backend remains
 * authoritative for status changes and history.
 */

/** Minimum characters required for a rejection reason (backend + client). */
export const MIN_REJECTION_REASON_LENGTH = 4

/**
 * Validates a rejection reason. Returns an error message, or `null` when
 * valid. The backend also requires a non-empty reason, so this is enforced
 * on both sides.
 */
export function validateRejectionReason(reason: string): string | null {
  if (reason.trim().length < MIN_REJECTION_REASON_LENGTH) {
    return `Please provide a rejection reason (at least ${MIN_REJECTION_REASON_LENGTH} characters).`
  }
  return null
}

/** The role an upload plays within its replacement chain. */
export type ChainRole = 'original' | 'replacement' | 'superseded'

/**
 * Classifies an upload within a qualification's replacement chain.
 *
 * - `superseded`: a later upload points at this `doc_id` (it was replaced).
 * - `replacement`: this upload supersedes an earlier `doc_id`.
 * - `original`: neither — the first upload for the qualification.
 *
 * Each upload keeps its OWN `current_status`; a replacement never inherits
 * approval from the document it supersedes.
 */
export function classifyChainRole(upload: QualificationUpload, allUploads: QualificationUpload[]): ChainRole {
  // Superseded if a later upload points at this doc_id.
  const isSuperseded = allUploads.some((other) => other.supersedes_document_id === upload.doc_id)
  if (isSuperseded) return 'superseded'
  if (upload.supersedes_document_id != null) return 'replacement'
  return 'original'
}

/**
 * Returns the `doc_id` of the active (non-superseded) upload in a chain —
 * i.e. the one a replacement points to, or the only/original upload. Useful
 * to surface the "current" document while keeping older ones accessible.
 */
export function activeUploadDocId(uploads: QualificationUpload[]): number | null {
  for (const upload of uploads) {
    if (classifyChainRole(upload, uploads) !== 'superseded') return upload.doc_id
  }
  return uploads.length > 0 ? uploads[uploads.length - 1].doc_id : null
}
