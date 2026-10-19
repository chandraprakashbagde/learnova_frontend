import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ClipboardCheck, Eye, RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react'

import { isApiError } from '@/common/api/http'
import { Button } from '@/common/ui/button'
import { Card, CardContent } from '@/common/ui/card'
import { Input } from '@/common/ui/input'
import { DataTable, type DataTableColumn } from '@/features/admin/components/DataTable'
import { DocumentStatusBadge } from '@/features/admin/components/DocumentStatusBadge'
import { DocumentReviewPanel } from '@/features/admin/components/DocumentReviewPanel'
import {
  listVerificationDocuments,
  type DocumentStatus,
  type VerificationDocument,
  type VerificationQueueResponse,
} from '@/features/admin/api/adminVerification.api'
import { formatDate } from '@/features/admin/lib/format'

const PAGE_SIZE = 10

const STATUS_OPTIONS: { value: DocumentStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

/** `/admin/verification-queue` — review and action teacher verification documents. */
export default function VerificationQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<VerificationQueueResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const search = searchParams.get('search') ?? ''
  const statusFilter = (searchParams.get('status') ?? '') as DocumentStatus | ''
  const includeSuperseded = searchParams.get('superseded') === '1'
  const page = Number(searchParams.get('page') ?? '1') || 1
  const selectedDocId = searchParams.get('doc')
  const hasFilters = Boolean(search || statusFilter || includeSuperseded)

  const [searchInput, setSearchInput] = useState(search)
  const [prevSearch, setPrevSearch] = useState(search)
  if (search !== prevSearch) {
    setPrevSearch(search)
    setSearchInput(search)
  }

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  // Re-enter loading when the query changes (render-time, not in the effect).
  const queryKey = `${page}|${search}|${statusFilter}|${includeSuperseded}|${attempt}`
  const [activeQueryKey, setActiveQueryKey] = useState(queryKey)
  if (queryKey !== activeQueryKey) {
    setActiveQueryKey(queryKey)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    let cancelled = false

    listVerificationDocuments({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      current_status: statusFilter || undefined,
      include_superseded: includeSuperseded,
    })
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setData(null)
        if (isApiError(err) && err.status === 404) {
          setError(
            'The verification queue endpoint (GET /admin/verification-documents) is not available yet on the backend.',
          )
        } else if (isApiError(err)) {
          setError(err.message)
        } else {
          setError('Something went wrong while loading the verification queue.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, search, statusFilter, includeSuperseded, attempt])

  // The currently reviewed document (from ?doc=<id>).
  const selectedDocument = data?.items.find((item) => item.doc_id === Number(selectedDocId)) ?? null

  const refresh = () => setAttempt((count) => count + 1)

  const columns: DataTableColumn<VerificationDocument>[] = [
    {
      key: 'teacher',
      header: 'Teacher',
      cell: (doc) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{doc.teacher_name}</p>
          <p className="truncate text-xs text-muted-foreground">{doc.teacher_email}</p>
        </div>
      ),
    },
    {
      key: 'qualification',
      header: 'Qualification',
      cell: (doc) => <span className="text-muted-foreground">{doc.qualification_name}</span>,
    },
    {
      key: 'doc_id',
      header: 'Document ID',
      cell: (doc) => <span className="font-medium text-foreground">#{doc.doc_id}</span>,
    },
    {
      key: 'created_at',
      header: 'Uploaded',
      cell: (doc) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(doc.created_at)}</span>,
    },
    { key: 'status', header: 'Status', cell: (doc) => <DocumentStatusBadge status={doc.current_status} /> },
    {
      key: 'review',
      header: 'Review',
      cell: (doc) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateParams({ doc: String(doc.doc_id) })}
          aria-label={`Review document ${doc.doc_id} from ${doc.teacher_name}`}
        >
          <Eye aria-hidden="true" className="size-4" />
          Review
        </Button>
      ),
    },
  ]

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <Card className="gap-4 py-4">
        <CardContent className="flex flex-col gap-3 px-4">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(event) => {
              event.preventDefault()
              updateParams({ search: searchInput.trim(), page: '' })
            }}
          >
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by teacher name or email…"
                aria-label="Search the verification queue"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Filters
            </span>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => updateParams({ status: event.target.value, page: '' })}
                className="h-9 rounded-full border border-input bg-card px-3 text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-ring"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={includeSuperseded}
                onChange={(event) => updateParams({ superseded: event.target.checked ? '1' : '', page: '' })}
                className="size-4 rounded-sm border-input accent-[#4F46E5]"
              />
              Include superseded uploads
            </label>

            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput('')
                  setSearchParams(new URLSearchParams(selectedDocId ? { doc: selectedDocId } : {}), { replace: true })
                }}
              >
                <X aria-hidden="true" className="size-4" />
                Clear filters
              </Button>
            ) : null}

            <Button variant="ghost" size="sm" onClick={refresh} className="sm:ml-auto">
              <RefreshCw aria-hidden="true" className="size-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review panel for the selected document */}
      {selectedDocument ? (
        <section aria-label={`Review document ${selectedDocument.doc_id}`} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <ClipboardCheck aria-hidden="true" className="size-5 text-primary" />
              Reviewing document #{selectedDocument.doc_id}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => updateParams({ doc: '' })}>
              <X aria-hidden="true" className="size-4" />
              Close review
            </Button>
          </div>
          <DocumentReviewPanel document={selectedDocument} onStatusChanged={refresh} />
        </section>
      ) : null}

      {/* Queue table */}
      <DataTable
        caption="Verification queue"
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(doc) => String(doc.doc_id)}
        loading={loading}
        error={error}
        onRetry={refresh}
        emptyMessage={
          hasFilters
            ? 'No documents match your search and filters. Try clearing them.'
            : 'The verification queue is empty — nothing is waiting for review.'
        }
      />

      {/* Pagination */}
      {!loading && !error && total > PAGE_SIZE ? (
        <nav aria-label="Verification queue pagination" className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
