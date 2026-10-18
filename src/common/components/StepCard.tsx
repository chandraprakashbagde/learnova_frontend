import type { LucideIcon } from 'lucide-react'

import { cn } from '@/common/lib/utils'

export type StepTone = 'student' | 'teacher'

export interface StepCardProps {
  step: number
  title: string
  description: string
  /** Optional icon shown inside the step marker. */
  icon?: LucideIcon
  /** Distinguishes the student path from the teacher path. */
  tone: StepTone
  className?: string
}

const toneStyles: Record<StepTone, { marker: string; line: string }> = {
  student: {
    marker: 'bg-primary text-primary-foreground shadow-md shadow-primary/25',
    line: 'bg-primary/25',
  },
  teacher: {
    marker: 'bg-secondary text-secondary-foreground shadow-md shadow-secondary/25',
    line: 'bg-secondary/25',
  },
}

export function StepCard({ step, title, description, icon: Icon, tone, className }: StepCardProps) {
  const styles = toneStyles[tone]

  return (
    <li className={cn('group relative flex gap-4 pb-8 last:pb-0', className)}>
      <div className="flex flex-col items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold transition-transform duration-300 group-hover:scale-105',
            styles.marker,
          )}
        >
          {Icon ? <Icon className="size-5" strokeWidth={2} /> : step}
        </span>
        <span aria-hidden="true" className={cn('w-px flex-1 rounded-full', styles.line)} />
      </div>
      <div className="flex flex-col gap-1 pt-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {step}</p>
        <h4 className="font-bold text-foreground">{title}</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </li>
  )
}