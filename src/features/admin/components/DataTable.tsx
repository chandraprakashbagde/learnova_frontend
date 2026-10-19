import type { ReactNode } from 'react'

import { Inbox, RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/common/ui/button'
import { cn } from '@/common/lib/utils'

export interface DataTableColumn<T> {
  key: string
  header: string
  /** Renders the cell content for a row. */
  cell: (row: T) => ReactNode
  /** Extra classes for the <th>/<td> (e.g. to widen a column). */
  className?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  /** Stable key for each row. */
  rowKey: (row: T) => string
  /** Accessible description of the table. */
  caption: string
  /** Renders skeleton rows instead of data. */
  loading?: boolean
  /** When set, renders an error state with an optional retry action. */
  error?: string | null
  onRetry?: () => void
  /** Message shown when there are no rows. */
  emptyMessage?: string
  /** Number of skeleton rows shown while loading. */
  skeletonRowCount?: number
  className?: string
}

/**
 * Generic table with loading (skeleton), empty, and error states.
 * Accepts typed rows and column renderers so it can consume API
 * responses directly in a later phase.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = 'Nothing here yet.',
  skeletonRowCount = 4,
  className,
}: DataTableProps<T>) {
  const showSkeleton = loading && !error
  const showEmpty = !loading && !error && rows.length === 0

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border', className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground', column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showSkeleton
            ? Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b border-border last:border-b-0">
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3.5', column.className)}>
                      <span aria-hidden="true" className="block h-4 animate-pulse rounded-md bg-muted" />
                      <span className="sr-only">Loading…</span>
                    </td>
                  ))}
                </tr>
              ))
            : null}

          {error ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <TriangleAlert aria-hidden="true" className="size-8 text-destructive" />
                  <p className="font-medium text-foreground">Something went wrong</p>
                  <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
                  {onRetry ? (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      <RefreshCw aria-hidden="true" className="size-4" />
                      Try again
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ) : null}

          {!error && showEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Inbox aria-hidden="true" className="size-8" />
                  <p className="text-sm font-medium text-foreground">No records found</p>
                  <p className="max-w-sm text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : null}

          {!error && !showSkeleton && !showEmpty
            ? rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/40"
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3.5 align-middle text-foreground', column.className)}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  )
}
