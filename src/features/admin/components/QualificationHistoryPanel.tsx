import { useEffect, useState } from 'react'
import { History, Loader2, RefreshCw } from 'lucide-react'

import { isApiError } from '@/common/api/http'
import { Button } from '@/common/ui/button'
import { ReplacementChain } from '@/features/admin/components/ReplacementChain'
import { VerificationHistoryTimeline } from '@/features/admin/components/VerificationHistoryTimeline'
import {
  getQualificationVerificationHistory,
  type QualificationHistoryResponse,
} from '@/features/admin/api/adminVerification.api'

export interface QualificationHistoryPanelProps {
  teacherId: number | string
  qualificationId: number | string
  qualificationName?: string
}

/**
 * Loads and displays the full verification history for one qualification:
 * every upload attempt (original + replacements) via the replacement chain,
 * plus the merged chronological action timeline. History is read-only —
 * nothing here mutates or overwrites backend records.
 */
export function QualificationHistoryPanel({
  teacherId,
  qualificationId,
  qualificationName,
}: QualificationHistoryPanelProps) {
  const [history, setHistory] = useState<QualificationHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)

  // Re-enter loading when the qualification or retry counter changes
  // (render-time adjustment, not a synchronous setState in an effect).
  const requestKey = `${teacherId}|${qualificationId}|${attempt}`
  const [activeRequestKey, setActiveRequestKey] = useState(requestKey)
  if (requestKey !== activeRequestKey) {
    setActiveRequestKey(requestKey)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    let cancelled = false

    getQualificationVerificationHistory(teacherId, qualificationId)
      .then((data) => {
        if (cancelled) return
        setHistory(data)
        // Default the selection to the most recent upload.
        setSelectedDocId(data.uploads.length > 0 ? data.uploads[data.uploads.length - 1].doc_id : null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setHistory(null)
        if (isApiError(err) && err.status === 404) {
          setError(
            'The verification history endpoint is not available yet on the backend for this qualification.',
          )
        } else if (isApiError(err)) {
          setError(err.message)
        } else {
          setError('Something went wrong while loading this history.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [teacherId, qualificationId, attempt])

  const retry = () => setAttempt((count) => count + 1)

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-6 text-muted-foreground" role="status" aria-live="polite">
        <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading verification history…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p role="alert" className="max-w-md text-sm text-muted-foreground">
          {error}
        </p>
        <Button variant="outline" size="sm" onClick={retry}>
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      </div>
    )
  }

  if (!history || history.uploads.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        No document uploads recorded for this qualification yet.
      </p>
    )
  }

  // Events for the selected upload, or the full merged timeline when nothing
  // is specifically selected.
  const selectedUpload = history.uploads.find((upload) => upload.doc_id === selectedDocId) ?? null
  const timelineEntries = selectedUpload ? selectedUpload.events : history.timeline

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Upload chain">
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Upload attempts
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({history.uploads.length} {history.uploads.length === 1 ? 'upload' : 'uploads'}
            {qualificationName ? ` for ${qualificationName}` : ''})
          </span>
        </h4>
        <ReplacementChain
          uploads={history.uploads}
          selectedDocId={selectedDocId}
          onSelectUpload={(docId) => setSelectedDocId((current) => (current === docId ? null : docId))}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Select an upload to filter the timeline below, or select it again to show all merged events.
        </p>
      </section>

      <section aria-label="Action history timeline">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <History aria-hidden="true" className="size-4.5 text-primary" />
          {selectedUpload ? `Events for doc #${selectedUpload.doc_id}` : 'Full history timeline'}
        </h4>
        <VerificationHistoryTimeline entries={timelineEntries} />
      </section>
    </div>
  )
}
