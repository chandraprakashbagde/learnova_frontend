import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Check,
  Download,
  Eye,
  FileText,
  History,
  Loader2,
  Mail,
  RotateCcw,
  User,
  XCircle,
} from 'lucide-react'

import { isApiError } from '@/common/api/http'
import { Button } from '@/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/ui/dialog'
import { Textarea } from '@/common/ui/textarea'
import { DocumentStatusBadge } from '@/features/admin/components/DocumentStatusBadge'
import {
  approveVerificationDocument,
  fetchVerificationDocumentFile,
  getVerificationDocumentHistory,
  rejectVerificationDocument,
  revokeBlobUrl,
  type VerificationDocument,
  type VerificationHistoryEntry,
} from '@/features/admin/api/adminVerification.api'
import { formatDateTime } from '@/features/admin/lib/format'
import {
  MIN_REJECTION_REASON_LENGTH,
  validateRejectionReason,
} from '@/features/admin/lib/verificationRules'
import { cn } from '@/common/lib/utils'

export interface DocumentReviewPanelProps {
  document: VerificationDocument
  /** Called after a successful approve/reject so the caller can refresh. */
  onStatusChanged: () => void
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

/**
 * Reusable review surface for one verification document. Submitting an
 * approve/reject sends the request to the backend and re-reads the
 * authoritative state it returns — local status is never flipped to fake a
 * result. Buttons are disabled while a request is in flight.
 */
export function DocumentReviewPanel({ document, onStatusChanged }: DocumentReviewPanelProps) {
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Secure file preview/download — fetched via the authenticated client and
  // held as a short-lived blob URL, never a public file URL.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  // Document history (previous/superseded uploads + action trail).
  const [history, setHistory] = useState<VerificationHistoryEntry[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const isPending = document.current_status === 'PENDING'

  // Revoke blob URLs on unmount or when the preview changes.
  useEffect(() => {
    return () => {
      if (previewUrl) revokeBlobUrl(previewUrl)
    }
  }, [previewUrl])

  const loadPreview = useCallback(async () => {
    setFileLoading(true)
    setFileError(null)
    try {
      const { blobUrl } = await fetchVerificationDocumentFile(document.doc_id)
      setPreviewUrl((previous) => {
        if (previous) revokeBlobUrl(previous)
        return blobUrl
      })
    } catch (error) {
      setFileError(
        isApiError(error)
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to load the document file.',
      )
    } finally {
      setFileLoading(false)
    }
  }, [document.doc_id])

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const entries = await getVerificationDocumentHistory(document.doc_id)
      setHistory(entries)
    } catch (error) {
      setHistoryError(isApiError(error) ? error.message : 'Failed to load document history.')
    } finally {
      setHistoryLoading(false)
    }
  }, [document.doc_id])

  const resetActionFeedback = () => {
    setActionError(null)
    setSuccessMessage(null)
  }

  const handleApprove = async () => {
    setSubmitting(true)
    resetActionFeedback()
    try {
      await approveVerificationDocument(document.doc_id)
      setSuccessMessage('Document approved.')
      setApproveOpen(false)
      onStatusChanged()
    } catch (error) {
      setActionError(isApiError(error) ? error.message : 'Failed to approve the document.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const reasonError = validateRejectionReason(rejectReason)
    if (reasonError) {
      setActionError(reasonError)
      return
    }
    setSubmitting(true)
    resetActionFeedback()
    try {
      await rejectVerificationDocument(document.doc_id, { reason: rejectReason.trim() })
      setSuccessMessage('Document rejected.')
      setRejectOpen(false)
      setRejectReason('')
      onStatusChanged()
    } catch (error) {
      setActionError(isApiError(error) ? error.message : 'Failed to reject the document.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Teacher + qualification info */}
      <div className="grid gap-6 md:grid-cols-2">
        <section aria-label="Teacher details" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <User aria-hidden="true" className="size-4.5 text-primary" />
            Teacher
          </h3>
          <div className="flex flex-col gap-4">
            <InfoRow icon={User} label="Name" value={document.teacher_name} />
            <InfoRow icon={Mail} label="Email" value={document.teacher_email} />
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Profile</p>
              <Link
                to={`/admin/teachers/${document.teacher_id}`}
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                View teacher profile
              </Link>
            </div>
          </div>
        </section>

        <section aria-label="Qualification and document" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Award aria-hidden="true" className="size-4.5 text-primary" />
            Qualification &amp; Document
          </h3>
          <div className="flex flex-col gap-4">
            <InfoRow icon={Award} label="Qualification" value={document.qualification_name} />
            <InfoRow icon={FileText} label="Document ID" value={`#${document.doc_id}`} />
            <InfoRow icon={RotateCcw} label="Uploaded" value={formatDateTime(document.created_at)} />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <DocumentStatusBadge status={document.current_status} className="mt-1" />
              </div>
              {document.supersedes_document_id != null ? (
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Replaces doc</p>
                  <Link
                    to={`/admin/verification-queue?doc=${document.supersedes_document_id}`}
                    className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    #{document.supersedes_document_id}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {/* Secure document preview */}
      <section aria-label="Document file" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText aria-hidden="true" className="size-4.5 text-primary" />
            Document File
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadPreview} disabled={fileLoading}>
              {fileLoading ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
              Preview
            </Button>
            {previewUrl && document.file_name ? (
              <Button asChild variant="outline" size="sm">
                <a href={previewUrl} download={document.file_name}>
                  <Download aria-hidden="true" className="size-4" />
                  Download
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {fileError ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {fileError}
          </p>
        ) : null}

        {previewUrl ? (
          previewUrl.match(/application\/pdf/) || document.file_type === 'application/pdf' ? (
            <iframe
              src={previewUrl}
              title="Verification document preview"
              className="h-96 w-full rounded-xl border border-border"
            />
          ) : (
            <img
              src={previewUrl}
              alt={`Verification document ${document.doc_id}`}
              className="max-h-96 w-full rounded-xl border border-border object-contain"
            />
          )
        ) : !fileError ? (
          <p className="text-sm text-muted-foreground">
            Load a secure preview to review this document. The file is fetched with your admin credentials and is not
            publicly accessible.
          </p>
        ) : null}
      </section>

      {/* Document history */}
      <section aria-label="Document history" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <History aria-hidden="true" className="size-4.5 text-primary" />
            Document History
          </h3>
          {!history ? (
            <Button variant="outline" size="sm" onClick={loadHistory} disabled={historyLoading}>
              {historyLoading ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
              Load history
            </Button>
          ) : null}
        </div>

        {historyError ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {historyError}
          </p>
        ) : null}

        {history && history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history entries for this document yet.</p>
        ) : null}

        {history && history.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {history.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 rounded-xl border border-border px-4 py-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full',
                    entry.action_type === 'DOCUMENT_APPROVED'
                      ? 'bg-emerald-50 text-emerald-600'
                      : entry.action_type === 'DOCUMENT_REJECTED'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-accent text-accent-foreground',
                  )}
                >
                  {entry.action_type === 'DOCUMENT_APPROVED' ? (
                    <Check className="size-4" />
                  ) : entry.action_type === 'DOCUMENT_REJECTED' ? (
                    <XCircle className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{entry.action_type.replaceAll('_', ' ')}</p>
                  {entry.comment ? <p className="text-sm text-muted-foreground">{entry.comment}</p> : null}
                  <p className="text-xs text-muted-foreground">
                    {entry.action_by} · {formatDateTime(entry.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      {/* Feedback + actions */}
      {successMessage ? (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </p>
      ) : null}
      {actionError ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {actionError}
        </p>
      ) : null}

      {isPending ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => { resetActionFeedback(); setApproveOpen(true) }}>
            <Check aria-hidden="true" className="size-4" />
            Approve
          </Button>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => { resetActionFeedback(); setRejectOpen(true) }}
          >
            <XCircle aria-hidden="true" className="size-4" />
            Reject
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          This document has already been reviewed ({document.current_status.toLowerCase()}) and can no longer be
          actioned.
        </p>
      )}

      {/* Approve confirmation */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve this document?</DialogTitle>
            <DialogDescription>
              You're approving the {document.qualification_name} document from {document.teacher_name}. This action is
              recorded in the document history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={submitting}>
              {submitting ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Check aria-hidden="true" className="size-4" />}
              {submitting ? 'Approving…' : 'Approve document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <form onSubmit={handleReject} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Reject this document</DialogTitle>
              <DialogDescription>
                A reason is required — it is stored in the document history and shown to the teacher.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reject-reason" className="text-sm font-semibold text-foreground">
                Rejection reason <span aria-hidden="true" className="text-destructive">*</span>
              </label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="e.g. The uploaded ID is unreadable — please re-scan in better lighting."
                rows={4}
                disabled={submitting}
                aria-describedby="reject-reason-hint"
              />
              <p id="reject-reason-hint" className="text-xs text-muted-foreground">
                Minimum {MIN_REJECTION_REASON_LENGTH} characters.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRejectOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                disabled={submitting || validateRejectionReason(rejectReason) !== null}
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                {submitting ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <XCircle aria-hidden="true" className="size-4" />}
                {submitting ? 'Rejecting…' : 'Reject document'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
