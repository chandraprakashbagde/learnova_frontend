import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/ui/card'
import { cn } from '@/common/lib/utils'
import type { AdminActivityEvent } from '@/features/admin/types'

export interface ActivityTimelineProps {
  events: AdminActivityEvent[]
  className?: string
}

/** Vertical timeline of recent admin actions. */
export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <p className={cn('px-6 py-8 text-center text-sm text-muted-foreground', className)}>
        No recent activity to show.
      </p>
    )
  }

  return (
    <ol className={cn('relative flex flex-col gap-6 px-6 py-2', className)}>
      {events.map((event, index) => {
        const Icon = event.icon
        const isLast = index === events.length - 1
        return (
          <li key={event.id} className="relative flex gap-4">
            {!isLast ? (
              <span
                aria-hidden="true"
                className="absolute left-[19px] top-10 h-[calc(100%-0.5rem)] w-px bg-border"
              />
            ) : null}
            <span
              aria-hidden="true"
              className="z-10 grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card shadow-sm"
            >
              <Icon className="size-4.5 text-primary" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
              <p className="text-sm font-semibold text-foreground">{event.action}</p>
              {event.detail ? <p className="truncate text-sm text-muted-foreground">{event.detail}</p> : null}
              <p className="text-xs text-muted-foreground">
                {event.actor} · {event.timeLabel}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Card wrapper that pairs the ActivityTimeline with a standard header. */
export function ActivityTimelineCard({ events, className }: ActivityTimelineProps) {
  return (
    <Card className={cn('gap-4', className)}>
      <CardHeader>
        <CardTitle>Recent Admin Activity</CardTitle>
        <CardDescription>Latest actions taken across the admin panel.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ActivityTimeline events={events} />
      </CardContent>
    </Card>
  )
}
