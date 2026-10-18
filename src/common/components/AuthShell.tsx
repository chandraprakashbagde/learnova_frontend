import { BadgeCheck, CheckCircle2, GraduationCap, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Logo } from '@/common/components/Logo'
import { cn } from '@/common/lib/utils'

const DEFAULT_BULLETS = [
  'Learn from expert teachers across a wide range of subjects',
  'Follow structured courses and track your progress',
  'Switch between student and teacher journeys any time',
]

export interface AuthShellProps {
  icon: LucideIcon
  eyebrow: string
  /** Rendered as the page's h1 inside the form card. */
  title: string
  description: string
  children: ReactNode
  /** Link row rendered under the form card. */
  footer: ReactNode
  asideHeading?: string
  asideBullets?: string[]
}

export function AuthShell({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
  footer,
  asideHeading = 'One platform for learners and teachers.',
  asideBullets = DEFAULT_BULLETS,
}: AuthShellProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -left-24 -top-20 size-80 rounded-full bg-primary/15 blur-3xl" />
        <span className="absolute -right-16 top-24 size-72 rounded-full bg-secondary/12 blur-3xl" />
        <span className="absolute bottom-0 left-1/3 size-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-dots opacity-50" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-24 pt-28 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-36">
        {/* Marketing aside */}
        <aside className="hidden flex-col gap-6 lg:flex">
          <Link to="/" aria-label="Learnova home" className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
            <Logo />
          </Link>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">
            <span className="text-gradient">{asideHeading}</span>
          </h2>
          <ul className="flex flex-col gap-3">
            {asideBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                {bullet}
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BadgeCheck aria-hidden="true" className="size-4.5 text-highlight" />
            Built for learners. Powered by passionate teachers.
          </p>
        </aside>

        {/* Form card */}
        <div className="flex flex-col gap-6">
          <Link to="/" aria-label="Learnova home" className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-ring lg:hidden">
            <Logo />
          </Link>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-xl shadow-slate-900/5 sm:p-9">
            <span
              aria-hidden="true"
              className="gradient-cta grid size-12 place-items-center rounded-2xl text-primary-foreground shadow-md shadow-primary/25"
            >
              <Icon className="size-6" strokeWidth={2} />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

            <div className="mt-7">{children}</div>
          </div>

          <div className="text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </section>
  )
}

/** Success notice shown after a valid submit. */
export function AuthNotice({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-2 rounded-xl border border-primary/20 bg-accent px-4 py-3 text-sm font-medium text-accent-foreground',
        className,
      )}
    >
      <GraduationCap aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-primary" />
      <span>{children}</span>
    </p>
  )
}