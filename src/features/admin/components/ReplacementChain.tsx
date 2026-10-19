import { FileText, GitCompareArrows, Undo2 } from 'lucide-react'

import { cn } from '@/common/lib/utils'
import { formatDateTime } from '@/features/admin/lib/format'
import { DocumentStatusBadge } from '@/features/admin/components/DocumentStatusBadge'
import type { QualificationUpload } from '@/features/admin/api/adminVerification.api'

export interface ReplacementChainProps {
  /** Upload attempts, expected oldest-first. */
  uploads: QualificationUpload[]
  /** Called when an admin selects an upload to inspect its events. */
  onSelectUpload?: (docId: number) => void
  /** Currently selected upload, highlighted in the chain. */
  selectedDocId?: number | null
  className?: string
}

/** Classifies an upload within its replacement chain. */
function chainRole(
  upload: QualificationUpload,
  uploads: QualificationUpload[],
): 'original' | 'replacement' | 'superseded' {
  // Superseded if a later upload points at this doc_id.
  const isSuperseded = uploads.some((other) => other.supersedes_document_id === upload.doc_id)
  if (isSuperseded) return 'superseded'
  if (upload.supersedes_document_id != null) return 'replacement'
  return 'original'
}

const ROLE_BADGE: Record<'original' | 'replacement' | 'superseded', { label: string; className: string }> = {
  original: { label: 'Original', className: 'border-border bg-muted text-muted-foreground' },
  replacement: { label: 'Replacement', className: 'border-violet-200 bg-violet-50 text-violet-700' },
  superseded: { label: 'Superseded', className: 'border-amber-200 bg-amber-50 text-amber-700' },
}

/**
 * Renders a qualification's upload attempts as an ordered chain so admins
 * can see which upload replaced which. Every upload shows its OWN
 * `current_status` — approval is never inherited from a superseded document.
 * Selecting an upload surfaces its action events to the parent.
 */
export function ReplacementChain({ uploads, onSelectUpload, selectedDocId, className }: ReplacementChainProps) {
  if (uploads.length === 0) {
    return <p className={cn('px-1 py-4 text-sm text-muted-foreground', className)}>No uploads recorded yet.</p>
  }

  return (
    <ol className={cn('flex flex-col gap-3', className)}>
      {uploads.map((upload) => {
        const role = chainRole(upload, uploads)
        const roleBadge = ROLE_BADGE[role]
        const isSelected = selectedDocId === upload.doc_id
        return (
          <li key={upload.doc_id}>
            <button
              type="button"
              onClick={() => onSelectUpload?.(upload.doc_id)}
              aria-label={`Inspect history for document ${upload.doc_id}`}
              className={cn(
                'flex w-full items-start gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:bg-muted/40',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg',
                  role === 'superseded'
                    ? 'bg-amber-50 text-amber-600'
                    : role === 'replacement'
                      ? 'bg-violet-50 text-violet-600'
                      : 'bg-accent text-accent-foreground',
                )}
              >
                {role === 'replacement' ? (
                  <GitCompareArrows className="size-4.5" />
                ) : role === 'superseded' ? (
                  <Undo2 className="size-4.5" />
                ) : (
                  <FileText className="size-4.5" />
                )}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">Doc #{upload.doc_id}</span>
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                      roleBadge.className,
                    )}
                  >
                    {roleBadge.label}
                  </span>
                  <DocumentStatusBadge status={upload.current_status} />
                </div>

                <p className="text-xs text-muted-foreground">
                  Uploaded {formatDateTime(upload.created_at)}
                  {upload.supersedes_document_id != null
                    ? ` · supersedes doc #${upload.supersedes_document_id}`
                    : ''}
                </p>

                {upload.events.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {upload.events.length} recorded {upload.events.length === 1 ? 'event' : 'events'}
                  </p>
                ) : null}
              </div>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
