import { FileCheck2, FilePlus2, FileX2, RefreshCw } from 'lucide-react'

import { cn } from '@/common/lib/utils'
import { formatDateTime } from '@/features/admin/lib/format'
import type {
  DocumentActionType,
  VerificationHistoryEntry,
} from '@/features/admin/api/adminVerification.api'

const ACTION_STYLES: Record<
  DocumentActionType,
  { icon: typeof FilePlus2; ring: string; label: string }
> = {
  DOCUMENT_UPLOADED: { icon: FilePlus2, ring: 'bg-sky-50 text-sky-600', label: 'Document uploaded' },
  DOCUMENT_APPROVED: { icon: FileCheck2, ring: 'bg-emerald-50 text-emerald-600', label: 'Document approved' },
  DOCUMENT_REJECTED: { icon: FileX2, ring: 'bg-rose-50 text-rose-600', label: 'Document rejected' },
  DOCUMENT_REUPLOADED: { icon: RefreshCw, ring: 'bg-violet-50 text-violet-600', label: 'Document reuploaded' },
}

const UNKNOWN_ACTION_STYLE = { icon: FilePlus2, ring: 'bg-muted text-muted-foreground' }

export interface VerificationHistoryTimelineProps {
  /** Action-history entries, expected oldest-first (newest last). */
  entries: VerificationHistoryEntry[]
  className?: string
}

/**
 * Read-only chronological timeline of `vrfn_actn_hstry` entries. Renders the
 * actor, timestamp, comment/rejection reason, and related document ID for
 * each event. This never mutates history — it is display-only.
 */
export function VerificationHistoryTimeline({ entries, className }: VerificationHistoryTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className={cn('px-1 py-4 text-sm text-muted-foreground', className)}>
        No history events recorded yet.
      </p>
    )
  }

  return (
    <ol className={cn('relative flex flex-col gap-5', className)}>
      {entries.map((entry, index) => {
        const style = ACTION_STYLES[entry.action_type] ?? {
          ...UNKNOWN_ACTION_STYLE,
          label: entry.action_type.replaceAll('_', ' '),
        }
        const Icon = style.icon
        const isLast = index === entries.length - 1
        return (
          <li key={entry.id} className="relative flex gap-4">
            {!isLast ? (
              <span
                aria-hidden="true"
                className="absolute left-[19px] top-10 h-[calc(100%-0.25rem)] w-px bg-border"
              />
            ) : null}
            <span
              aria-hidden="true"
              className={cn('z-10 grid size-10 shrink-0 place-items-center rounded-full border border-border', style.ring)}
            >
              <Icon className="size-4.5" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
              <p className="text-sm font-semibold text-foreground">{style.label}</p>
              <p className="text-xs text-muted-foreground">
                {entry.action_by} · {formatDateTime(entry.created_at)} · doc #{entry.doc_id}
              </p>
              {entry.comment ? (
                <p className="mt-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                  {entry.comment}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
