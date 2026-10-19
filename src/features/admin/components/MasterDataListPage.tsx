import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Plus, RefreshCw, Search } from 'lucide-react'

import { isApiError } from '@/common/api/http'
import { Button } from '@/common/ui/button'
import { Input } from '@/common/ui/input'
import { DataTable, type DataTableColumn } from '@/features/admin/components/DataTable'
import { MasterDataFormDialog } from '@/features/admin/components/MasterDataFormDialog'
import {
  listMasterData,
  type MasterDataItem,
  type MasterDataKind,
  type MasterDataListResponse,
} from '@/features/admin/api/adminMasterData.api'
import { formatDate } from '@/features/admin/lib/format'

const PAGE_SIZE = 10

export interface MasterDataListPageProps {
  kind: MasterDataKind
  /** Human-readable singular noun, e.g. "subject". */
  noun: string
  /** Accessible table caption. */
  caption: string
  /** Placeholder for the search input. */
  searchPlaceholder: string
  /** Name of the created column header, e.g. "Subject". */
  nameHeader: string
}

/**
 * Shared list page for subject and qualification master data. Handles
 * search, pagination, create, and edit against the master-data API, with
 * loading (skeleton), empty, and error states. There is deliberately no
 * delete action — the backend forbids deleting referenced records without
 * an explicit business rule.
 */
export function MasterDataListPage({
  kind,
  noun,
  caption,
  searchPlaceholder,
  nameHeader,
}: MasterDataListPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<MasterDataListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  // Dialog state — `createOpen` toggles the new-record dialog; `editing`
  // holds the record being edited (null when closed).
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<MasterDataItem | null>(null)

  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1') || 1

  const [searchInput, setSearchInput] = useState(search)
  const [prevSearch, setPrevSearch] = useState(search)
  if (search !== prevSearch) {
    setPrevSearch(search)
    setSearchInput(search)
  }

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  // Re-enter loading when the query changes (render-time, not in an effect).
  const queryKey = `${page}|${search}|${attempt}`
  const [activeQueryKey, setActiveQueryKey] = useState(queryKey)
  if (queryKey !== activeQueryKey) {
    setActiveQueryKey(queryKey)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    let cancelled = false

    listMasterData(kind, { page, page_size: PAGE_SIZE, search: search || undefined })
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setData(null)
        if (isApiError(err) && err.status === 404) {
          setError(
            `The ${kind} endpoint (GET /admin/${kind}) is not available yet on the backend.`,
          )
        } else if (isApiError(err)) {
          setError(err.message)
        } else {
          setError(`Something went wrong while loading ${kind}.`)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [kind, page, search, attempt])

  const refresh = () => setAttempt((count) => count + 1)

  const columns: DataTableColumn<MasterDataItem>[] = [
    {
      key: 'name',
      header: nameHeader,
      cell: (item) => <span className="font-semibold text-foreground">{item.name}</span>,
    },
    {
      key: 'teacher_count',
      header: 'Teachers',
      cell: (item) =>
        item.teacher_count != null ? (
          <span className="text-muted-foreground">{item.teacher_count}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (item) =>
        item.created_at ? (
          <span className="whitespace-nowrap text-muted-foreground">{formatDate(item.created_at)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (item) => (
        <Button variant="outline" size="sm" onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}>
          <Pencil aria-hidden="true" className="size-4" />
          Edit
        </Button>
      ),
    },
  ]

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Create and edit {kind === 'subjects' ? 'subjects' : 'qualification types'}. Records referenced by teachers
          cannot be deleted here.
        </p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" className="size-4" />
          New {noun}
        </Button>
      </div>

      {/* Search */}
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
            placeholder={searchPlaceholder}
            aria-label={`Search ${kind}`}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {search ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchInput('')
              setSearchParams(new URLSearchParams(), { replace: true })
            }}
          >
            Clear
          </Button>
        ) : null}
        <Button type="button" variant="ghost" onClick={refresh} aria-label={`Refresh ${kind}`}>
          <RefreshCw aria-hidden="true" className="size-4" />
        </Button>
      </form>

      {/* Table */}
      <DataTable
        caption={caption}
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(item) => String(item.id)}
        loading={loading}
        error={error}
        onRetry={refresh}
        emptyMessage={
          search
            ? `No ${kind} match your search. Try a different term.`
            : `No ${kind} have been created yet.`
        }
      />

      {/* Pagination */}
      {!loading && !error && total > PAGE_SIZE ? (
        <nav aria-label={`${caption} pagination`} className="flex items-center justify-between gap-3">
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

      {/* Create dialog */}
      <MasterDataFormDialog
        kind={kind}
        item={null}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={refresh}
      />

      {/* Edit dialog */}
      <MasterDataFormDialog
        kind={kind}
        item={editing}
        open={editing != null}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
        onSaved={refresh}
      />
    </div>
  )
}
