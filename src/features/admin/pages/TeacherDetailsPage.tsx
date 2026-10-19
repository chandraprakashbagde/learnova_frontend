import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  FileText,
  Mail,
  Phone,
  ChevronDown,
  History,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import { isApiError } from '@/common/api/http'
import { Button } from '@/common/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/ui/card'
import { TeacherStatusBadge } from '@/features/admin/components/TeacherStatusBadge'
import { QualificationHistoryPanel } from '@/features/admin/components/QualificationHistoryPanel'
import { getTeacher, type AdminTeacherDetail } from '@/features/admin/api/adminTeacher.api'
import { formatDateTime } from '@/features/admin/lib/format'

/** A labelled row of information inside a detail card. */
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

function SkeletonBlock({ className }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-md bg-muted ${className ?? 'h-4'}`} />
}

/**
 * Collapsible history section for one qualification. Admins open it to
 * inspect every upload attempt and its action timeline.
 */
function QualificationHistoryItem({
  teacherId,
  qualification,
}: {
  teacherId: number | string
  qualification: { id: number; name: string }
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="flex min-w-0 items-center gap-3">
          <History aria-hidden="true" className="size-4.5 shrink-0 text-primary" />
          <span className="truncate text-sm font-semibold text-foreground">{qualification.name}</span>
        </span>
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {open ? 'Hide history' : 'View history'}
          <ChevronDown
            aria-hidden="true"
            className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {open ? (
        <div className="border-t border-border px-4 py-4">
          <QualificationHistoryPanel
            teacherId={teacherId}
            qualificationId={qualification.id}
            qualificationName={qualification.name}
          />
        </div>
      ) : null}
    </div>
  )
}

/** `/admin/teachers/:teacherId` — full teacher profile from the backend. */
export default function TeacherDetailsPage() {
  const { teacherId } = useParams<{ teacherId: string }>()
  const [teacher, setTeacher] = useState<AdminTeacherDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const fullName = teacher ? `${teacher.first_name} ${teacher.last_name}`.trim() : ''

  // Re-enter the loading state when the target teacher or the retry counter
  // changes. Done during render (not in an effect body) to avoid a
  // synchronous setState inside an effect.
  const requestKey = `${teacherId ?? ''}|${attempt}`
  const [activeRequestKey, setActiveRequestKey] = useState(requestKey)
  if (requestKey !== activeRequestKey) {
    setActiveRequestKey(requestKey)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    if (!teacherId) return
    let cancelled = false

    getTeacher(teacherId)
      .then((data) => {
        if (!cancelled) setTeacher(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setTeacher(null)
        if (isApiError(err) && err.status === 404) {
          setError(
            `The teacher detail endpoint (GET /admin/teachers/${teacherId}) is not available yet on the backend.`,
          )
        } else if (isApiError(err)) {
          setError(err.message)
        } else {
          setError('Something went wrong while loading this teacher.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [teacherId, attempt])

  const retry = () => setAttempt((count) => count + 1)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/teachers">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to teachers
          </Link>
        </Button>
        {teacher ? <TeacherStatusBadge status={teacher.account_status} /> : null}
      </div>

      {loading ? (
        <div className="flex flex-col gap-6" role="status" aria-live="polite">
          <span className="sr-only">Loading teacher details…</span>
          <Card>
            <CardContent className="flex items-center gap-4 px-5">
              <SkeletonBlock className="size-16 rounded-full" />
              <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-6 w-48" />
                <SkeletonBlock className="h-4 w-64" />
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-3 px-5">
                <SkeletonBlock className="h-5 w-40" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-3 px-5">
                <SkeletonBlock className="h-5 w-40" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 px-5 py-12 text-center">
            <ShieldCheck aria-hidden="true" className="size-8 text-destructive" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-foreground">Couldn't load this teacher</p>
              <p className="max-w-md text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={retry}>
              <RefreshCw aria-hidden="true" className="size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : teacher ? (
        <>
          {/* Header card */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-5 px-5">
              <span
                aria-hidden="true"
                className="gradient-cta grid size-16 shrink-0 place-items-center rounded-2xl text-xl font-bold text-primary-foreground"
              >
                {fullName
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">{fullName}</h2>
                <p className="break-all text-sm text-muted-foreground">{teacher.email}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${
                    teacher.is_verfied
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  <ShieldCheck aria-hidden="true" className="size-3.5" />
                  {teacher.is_verfied ? 'Verified account' : 'Not verified'}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic information */}
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound aria-hidden="true" className="size-4.5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <InfoRow icon={UserRound} label="Full name" value={fullName} />
                <InfoRow icon={Mail} label="Email" value={teacher.email} />
                <InfoRow icon={Phone} label="Phone" value={teacher.phone ?? 'Not provided'} />
              </CardContent>
            </Card>

            {/* Registration information */}
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar aria-hidden="true" className="size-4.5 text-primary" />
                  Registration
                </CardTitle>
                <CardDescription>Account and onboarding timeline.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <InfoRow icon={Calendar} label="Registered" value={formatDateTime(teacher.created_at)} />
                {teacher.updated_at ? (
                  <InfoRow icon={RefreshCw} label="Last updated" value={formatDateTime(teacher.updated_at)} />
                ) : null}
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Onboarding status
                  </p>
                  <TeacherStatusBadge status={teacher.account_status} />
                </div>
              </CardContent>
            </Card>

            {/* Experience & bio */}
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen aria-hidden="true" className="size-4.5 text-primary" />
                  Experience & Bio
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <InfoRow
                  icon={Award}
                  label="Experience"
                  value={
                    teacher.experience_years != null
                      ? `${teacher.experience_years} ${teacher.experience_years === 1 ? 'year' : 'years'}`
                      : 'Not provided'
                  }
                />
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</p>
                  <p className="text-sm text-foreground">
                    {teacher.bio?.trim() ? teacher.bio : 'No bio provided yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Subjects & qualifications */}
            <Card className="gap-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen aria-hidden="true" className="size-4.5 text-primary" />
                  Subjects & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Subjects taught
                  </p>
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject) => (
                        <li
                          key={subject}
                          className="rounded-full border border-border bg-muted/60 px-3 py-1 text-sm font-medium text-foreground"
                        >
                          {subject}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No subjects recorded yet.</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Qualifications
                  </p>
                  <p className="text-sm text-foreground">
                    {teacher.qualifications?.trim() ? teacher.qualifications : 'No qualifications recorded yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification documents */}
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText aria-hidden="true" className="size-4.5 text-primary" />
                Verification Documents
              </CardTitle>
              <CardDescription>Documents submitted for this teacher's verification.</CardDescription>
            </CardHeader>
            <CardContent>
              {teacher.documents && teacher.documents.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {teacher.documents.map((document) => (
                    <li
                      key={document.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <FileText aria-hidden="true" className="size-4.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium text-foreground">{document.name}</span>
                      </span>
                      <TeacherStatusBadge status={document.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No verification documents are linked to this teacher yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Verification history by qualification */}
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History aria-hidden="true" className="size-4.5 text-primary" />
                Verification History
              </CardTitle>
              <CardDescription>
                Open a qualification to inspect every upload attempt, its replacement chain, and the full action
                timeline. Historical records are preserved and read-only.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {(() => {
                // Prefer structured qualification records; fall back to any
                // qualification IDs carried on the teacher's documents.
                const qualifications =
                  teacher.qualification_records && teacher.qualification_records.length > 0
                    ? teacher.qualification_records
                    : Array.from(
                        new Map(
                          (teacher.documents ?? [])
                            .filter(
                              (document): document is typeof document & { qualification_id: number } =>
                                document.qualification_id != null,
                            )
                            .map((document) => [
                              document.qualification_id,
                              {
                                id: document.qualification_id,
                                name: document.qualification_name ?? `Qualification #${document.qualification_id}`,
                              },
                            ]),
                        ).values(),
                      )

                if (qualifications.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground">
                      No qualifications are linked to this teacher yet, so there is no verification history to show.
                    </p>
                  )
                }

                return qualifications.map((qualification) => (
                  <QualificationHistoryItem
                    key={qualification.id}
                    teacherId={teacher.id}
                    qualification={qualification}
                  />
                ))
              })()}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
