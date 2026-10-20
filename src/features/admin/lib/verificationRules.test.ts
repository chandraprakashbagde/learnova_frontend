import { describe, expect, it } from 'vitest'

import type { QualificationUpload } from '@/features/admin/api/adminVerification.api'
import {
  activeUploadDocId,
  classifyChainRole,
  MIN_REJECTION_REASON_LENGTH,
  validateRejectionReason,
} from '@/features/admin/lib/verificationRules'

/** Builds a minimal upload for chain tests. */
function upload(doc_id: number, supersedes_document_id: number | null = null): QualificationUpload {
  return {
    doc_id,
    current_status: 'PENDING',
    supersedes_document_id,
    created_at: '2026-10-01T00:00:00Z',
    events: [],
  }
}

describe('validateRejectionReason — reject workflow', () => {
  it('rejects an empty reason', () => {
    expect(validateRejectionReason('')).not.toBeNull()
    expect(validateRejectionReason('   ')).not.toBeNull()
  })

  it('rejects a reason shorter than the minimum', () => {
    expect(validateRejectionReason('abc')).not.toBeNull()
    expect(validateRejectionReason('a'.repeat(MIN_REJECTION_REASON_LENGTH - 1))).not.toBeNull()
  })

  it('accepts a reason at or above the minimum (trimmed)', () => {
    expect(validateRejectionReason('a'.repeat(MIN_REJECTION_REASON_LENGTH))).toBeNull()
    expect(validateRejectionReason('  The ID scan is unreadable.  ')).toBeNull()
  })

  it('uses a minimum of at least 1 character', () => {
    expect(MIN_REJECTION_REASON_LENGTH).toBeGreaterThanOrEqual(1)
  })
})

describe('classifyChainRole — replacement relationships', () => {
  it('marks the first upload as original', () => {
    const uploads = [upload(101)]
    expect(classifyChainRole(uploads[0], uploads)).toBe('original')
  })

  it('marks a superseding upload as replacement and the old one as superseded', () => {
    // Doc 102 replaces doc 101 (the Phase 4 spec example).
    const uploads = [upload(101), upload(102, 101)]
    expect(classifyChainRole(uploads[0], uploads)).toBe('superseded')
    expect(classifyChainRole(uploads[1], uploads)).toBe('replacement')
  })

  it('handles a multi-step chain (original -> replacement -> replacement)', () => {
    const uploads = [upload(101), upload(102, 101), upload(103, 102)]
    expect(classifyChainRole(uploads[0], uploads)).toBe('superseded')
    expect(classifyChainRole(uploads[1], uploads)).toBe('superseded')
    expect(classifyChainRole(uploads[2], uploads)).toBe('replacement')
  })

  it('does not inherit status from a superseded document', () => {
    // A replacement stays PENDING even if the original was APPROVED —
    // status is per-upload and never inherited.
    const original: QualificationUpload = { ...upload(101), current_status: 'APPROVED' }
    const replacement: QualificationUpload = { ...upload(102, 101), current_status: 'PENDING' }
    const uploads = [original, replacement]

    expect(classifyChainRole(replacement, uploads)).toBe('replacement')
    expect(replacement.current_status).toBe('PENDING')
    expect(original.current_status).toBe('APPROVED')
  })
})

describe('activeUploadDocId', () => {
  it('returns the only upload when there is a single one', () => {
    expect(activeUploadDocId([upload(101)])).toBe(101)
  })

  it('returns the newest non-superseded upload in a chain', () => {
    const uploads = [upload(101), upload(102, 101)]
    expect(activeUploadDocId(uploads)).toBe(102)
  })

  it('returns null for an empty chain', () => {
    expect(activeUploadDocId([])).toBeNull()
  })
})
