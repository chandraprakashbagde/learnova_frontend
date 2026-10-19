import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/common/ui/card'
import { cn } from '@/common/lib/utils'

const TONE_STYLES: Record<'indigo' | 'violet' | 'emerald' | 'amber', string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  violet: 'bg-violet-50 text-violet-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
}

export interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  /** Short supporting line, e.g. "+6 this week". */
  hint?: string
  tone?: keyof typeof TONE_STYLES
  className?: string
}

/** Dashboard summary card showing one statistic with an icon and hint line. */
export function StatCard({ label, value, icon: Icon, hint, tone = 'indigo', className }: StatCardProps) {
  return (
    <Card className={cn('gap-4 py-5', className)}>
      <CardContent className="flex items-start justify-between gap-4 px-5">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="text-3xl font-bold tracking-tight text-foreground">{value.toLocaleString('en-IN')}</span>
          {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </div>
        <span
          aria-hidden="true"
          className={cn('grid size-11 shrink-0 place-items-center rounded-xl', TONE_STYLES[tone])}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  )
}
