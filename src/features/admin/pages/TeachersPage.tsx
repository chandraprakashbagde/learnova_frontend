import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'

import { isApiError } from '@/common/api/http'
import { Button } from '@/common/ui/button'
import { Card, CardContent } from '@/common/ui/card'
import { Input } from '@/common/ui/input'
import { DataTable, type DataTableColumn } from '@/features/admin/components/DataTable'
import { TeacherStatusBadge } from '@/features/admin/components/TeacherStatusBadge'
import { listTeachers, type AdminTeacher, type TeacherListResponse } from '@/features/admin/api/adminTeacher.api'
import { formatDate } from '@/features/admin/lib/format'
import {
  TEACHER_STATUS_FILTER_OPTIONS,
  type TeacherStatusValue,
} from '@/features/admin/lib/teacherStatus'

const PAGE_SIZE = 10

/** Formats the teacher's full name from the backend's split name fields. */
function fullName(teacher: AdminTeacher): string {
  return `${teacher.first_name} ${teacher.last_name}`.trim()
}

function SubjectsCell({ teacher }: { teacher: AdminTeacher }) {
  if (!teacher.subjects || teacher.subjects.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <ul className="flex max-w-[14rem] flex-wrap gap-1.5">
      {teacher.subjects.map((subject) => (
        <li
          key={subject}
          className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground"
        >
          {subject}
        </li>
      ))}
    </ul>
  )
}

function QualificationsCell({ teacher }: { teacher: AdminTeacher }) {
  if (!teacher.qualifications) return <span className="text-muted-foreground">—</span>
  return <span className="line-clamp-2 max-w-[16rem] text-muted-foreground">{teacher.qualifications}</span>
}

/** `/admin/teachers` — searchable, filterable, paginated teacher directory. */
export default function TeachersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState<TeacherListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const search = searchParams.get('search') ?? ''
  const statusFilter = (searchParams.get('status') ?? '') as TeacherStatusValue | ''
  const subjectFilter = searchParams.get('subject') ?? ''
  const page = Number(searchParams.get('page') ?? '1') || 1
  const hasFilters = Boolean(search || statusFilter || subjectFilter)

  // Local input so typing is instant; synced to the URL on submit.
  // When the URL search changes externally (clear filters, back/forward),
  // adjust the input during render rather than in an effect.
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

  // Re-enter the loading state when the query changes. Done during render
  // (not in the effect body) to avoid a synchronous setState in an effect.
  const queryKey = `${page}|${search}|${statusFilter}|${subjectFilter}|${attempt}`
  const [activeQueryKey, setActiveQueryKey] = useState(queryKey)
  if (queryKey !== activeQueryKey) {
    setActiveQueryKey(queryKey)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    let cancelled = false

    listTeachers({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      account_status: statusFilter || undefined,
      subject: subjectFilter || undefined,
    })
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setData(null)
        if (isApiError(err) && err.status === 404) {
          setError(
            'The teacher list endpoint (GET /admin/teachers) is not available yet on the backend.',
          )
        } else if (isApiError(err)) {
          setError(err.message)
        } else {
          setError('Something went wrong while loading teachers.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, search, statusFilter, subjectFilter, attempt])

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const columns: DataTableColumn<AdminTeacher>[] = [
    {
      key: 'name',
      header: 'Teacher',
      cell: (teacher) => (
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
          >
            {fullName(teacher)
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </span>
          <Link
            to={`/admin/teachers/${teacher.id}`}
            className="truncate font-semibold text-foreground transition-colors hover:text-primary"
          >
            {fullName(teacher)}
          </Link>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      cell: (teacher) => <span className="text-muted-foreground">{teacher.email}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (teacher) =>
        teacher.phone ? <span className="whitespace-nowrap text-muted-foreground">{teacher.phone}</span> : <span className="text-muted-foreground">—</span>,
    },
    { key: 'subjects', header: 'Subjects', cell: (teacher) => <SubjectsCell teacher={teacher} /> },
    {
      key: 'qualifications',
      header: 'Qualifications',
      cell: (teacher) => <QualificationsCell teacher={teacher} />,
    },
    {
      key: 'created_at',
      header: 'Registered',
      cell: (teacher) => (
        <span className="whitespace-nowrap text-muted-foreground">{formatDate(teacher.created_at)}</span>
      ),
    },
    { key: 'status', header: 'Status', cell: (teacher) => <TeacherStatusBadge status={teacher.account_status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (teacher) => (
        <Button asChild variant="outline" size="sm">
          <Link to={`/admin/teachers/${teacher.id}`}>View</Link>
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
                placeholder="Search by name or email…"
                aria-label="Search teachers by name or email"
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
                <option value="">All statuses</option>
                {TEACHER_STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Subject</span>
              <Input
                value={subjectFilter}
                onChange={(event) => updateParams({ subject: event.target.value, page: '' })}
                placeholder="Any subject"
                aria-label="Filter by subject"
                className="h-9 w-40 rounded-full text-sm"
              />
            </label>

            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X aria-hidden="true" className="size-4" />
                Clear filters
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        caption="Teachers"
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(teacher) => String(teacher.id)}
        loading={loading}
        error={error}
        onRetry={() => setAttempt((count) => count + 1)}
        emptyMessage={
          hasFilters
            ? 'No teachers match your search and filters. Try clearing them.'
            : 'No teachers have registered yet.'
        }
      />

      {/* Pagination */}
      {!loading && !error && total > PAGE_SIZE ? (
        <nav aria-label="Teacher list pagination" className="flex items-center justify-between gap-3">
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
