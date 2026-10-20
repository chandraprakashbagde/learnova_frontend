import { BookOpen, GraduationCap, LogOut, Target, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Logo } from '@/common/components/Logo'
import { Button } from '@/common/ui/button'
import RoleGuard from '@/common/auth/RoleGuard'
import { STUDENT_ROLE } from '@/common/auth/roles'

/** Stat card for the student dashboard overview. */
function StudentStatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
      </div>
      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
    </div>
  )
}

/**
 * `/student` — the student dashboard. Protected by the reusable RoleGuard,
 * which requires the `Student` role (verified via `GET /auth/role`).
 *
 * This is the landing surface for signed-in students; enrolled courses,
 * progress tracking, and recommendations arrive in a later phase.
 */
export default function StudentDashboardPage() {
  return (
    <RoleGuard requiredRole={STUDENT_ROLE} loadingLabel="Verifying your student access…">
      {({ session, onLogout }) => (
        <div className="min-h-svh bg-background">
          <header className="border-b border-border bg-card">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
              <Link to="/student" className="rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
                <Logo size="sm" />
              </Link>
              <div className="flex items-center gap-3">
                <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground sm:block">
                  {session.email || 'Student'}
                </span>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <LogOut aria-hidden="true" className="size-4" />
                  Log out
                </Button>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <GraduationCap aria-hidden="true" className="size-3.5" />
              Student dashboard
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back{session.email ? `, ${session.email.split('@')[0]}` : ''}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Your learning space is ready. Enrolled courses, progress tracking, and personalised recommendations
              will appear here in a later phase.
            </p>

            <section aria-label="Learning overview" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StudentStatCard icon={BookOpen} label="Enrolled courses" value="—" />
              <StudentStatCard icon={Target} label="In progress" value="—" />
              <StudentStatCard icon={Timer} label="Hours learned" value="—" />
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/courses">Explore courses</Link>
              </Button>
            </div>

            <p className="mt-8 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              Course and progress data will populate here once the student APIs are available on the backend.
            </p>
          </main>
        </div>
      )}
    </RoleGuard>
  )
}
