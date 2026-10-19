import { Link } from 'react-router-dom'
import { ClipboardCheck, Eye, FileText, TriangleAlert, Users, UserCheck, ArrowRight } from 'lucide-react'

import { Button } from '@/common/ui/button'
import { ActivityTimelineCard } from '@/features/admin/components/ActivityTimeline'
import { DataTable, type DataTableColumn } from '@/features/admin/components/DataTable'
import { StatCard } from '@/features/admin/components/StatCard'
import { StatusBadge } from '@/features/admin/components/StatusBadge'
import {
  MOCK_ADMIN_ACTIVITY,
  MOCK_RECENT_TEACHERS,
  MOCK_STATS,
  MOCK_VERIFICATION_QUEUE,
} from '@/features/admin/data/mock'
import { formatDate } from '@/features/admin/lib/format'
import type { TeacherSummary, VerificationQueueItem } from '@/features/admin/types'

const RECENT_TEACHER_COLUMNS: DataTableColumn<TeacherSummary>[] = [
  {
    key: 'teacher',
    header: 'Teacher',
    cell: (teacher) => (
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
        >
          {teacher.name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)}
        </span>
        <div className="min-w-0">
          <Link
            to={`/admin/teachers/${teacher.id}`}
            className="block truncate font-semibold text-foreground transition-colors hover:text-primary"
          >
            {teacher.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{teacher.subject}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    cell: (teacher) => <span className="text-muted-foreground">{teacher.email}</span>,
  },
  {
    key: 'registeredAt',
    header: 'Registration Date',
    cell: (teacher) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(teacher.registeredAt)}</span>,
  },
  {
    key: 'status',
    header: 'Verification Status',
    cell: (teacher) => <StatusBadge status={teacher.status} />,
  },
  {
    key: 'action',
    header: 'Action',
    cell: (teacher) => (
      <Button asChild variant="outline" size="sm">
        <Link to={`/admin/teachers/${teacher.id}`}>View</Link>
      </Button>
    ),
  },
]

const VERIFICATION_QUEUE_COLUMNS: DataTableColumn<VerificationQueueItem>[] = [
  {
    key: 'teacher',
    header: 'Teacher',
    cell: (item) => (
      <Link
        to={`/admin/teachers/${item.teacherId}`}
        className="font-semibold text-foreground transition-colors hover:text-primary"
      >
        {item.teacherName}
      </Link>
    ),
  },
  {
    key: 'documents',
    header: 'Pending Documents',
    cell: (item) => (
      <ul className="flex flex-wrap gap-1.5">
        {item.pendingDocuments.map((document) => (
          <li
            key={document}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground"
          >
            <FileText aria-hidden="true" className="size-3 text-muted-foreground" />
            {document}
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: 'submittedAt',
    header: 'Submission Date',
    cell: (item) => (
      <span className="whitespace-nowrap text-muted-foreground">{formatDate(item.submittedAt)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (item) => <StatusBadge status={item.status} />,
  },
  {
    key: 'view',
    header: 'View Details',
    cell: (item) => (
      <Button asChild variant="outline" size="sm">
        <Link to={`/admin/teachers/${item.teacherId}`}>
          <Eye aria-hidden="true" className="size-4" />
          Details
        </Link>
      </Button>
    ),
  },
]

/** Admin dashboard overview — phase 1 UI built on clearly labelled mock data. */
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Honest labelling: these numbers are mock data, not live backend stats. */}
      <p className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        <TriangleAlert aria-hidden="true" className="mr-1.5 inline size-4 text-primary" />
        Dashboard statistics below are <strong className="font-semibold text-foreground">sample data</strong> used to
        build the UI — they are not live figures from the backend. Real data arrives with the admin APIs in a later
        phase.
      </p>

      {/* Summary cards */}
      <section aria-label="Teacher statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Teachers"
          value={MOCK_STATS.totalTeachers}
          icon={Users}
          hint="All registered teacher accounts"
          tone="indigo"
        />
        <StatCard
          label="Pending Verifications"
          value={MOCK_STATS.pendingVerifications}
          icon={ClipboardCheck}
          hint="Awaiting document review"
          tone="amber"
        />
        <StatCard
          label="Verified Teachers"
          value={MOCK_STATS.verifiedTeachers}
          icon={UserCheck}
          hint="Approved and fully active"
          tone="emerald"
        />
        <StatCard
          label="Teachers Requiring Action"
          value={MOCK_STATS.requiringAction}
          icon={TriangleAlert}
          hint="Rejected or needs follow-up"
          tone="violet"
        />
      </section>

      {/* Recent registrations */}
      <section aria-labelledby="recent-registrations-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="recent-registrations-heading" className="text-base font-semibold text-foreground">
              Recent Teacher Registrations
            </h2>
            <p className="text-sm text-muted-foreground">The newest teachers to join the platform.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/teachers">
              View all teachers
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
        <DataTable
          caption="Recent teacher registrations"
          columns={RECENT_TEACHER_COLUMNS}
          rows={MOCK_RECENT_TEACHERS}
          rowKey={(teacher) => teacher.id}
          emptyMessage="No teachers have registered yet."
        />
      </section>

      {/* Queue preview + activity */}
      <div className="grid gap-6 xl:grid-cols-5">
        <section aria-labelledby="verification-preview-heading" className="flex flex-col gap-4 xl:col-span-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="verification-preview-heading" className="text-base font-semibold text-foreground">
                Verification Queue Preview
              </h2>
              <p className="text-sm text-muted-foreground">Teachers waiting on document review.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/verification-queue">
                Open queue
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
          <DataTable
            caption="Teachers in the verification queue"
            columns={VERIFICATION_QUEUE_COLUMNS}
            rows={MOCK_VERIFICATION_QUEUE}
            rowKey={(item) => item.id}
            emptyMessage="The verification queue is empty — nothing is waiting for review."
          />
        </section>

        <ActivityTimelineCard events={MOCK_ADMIN_ACTIVITY} className="xl:col-span-2" />
      </div>
    </div>
  )
}
