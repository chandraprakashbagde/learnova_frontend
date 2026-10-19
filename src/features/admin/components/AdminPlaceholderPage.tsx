import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Construction } from 'lucide-react'

import { Button } from '@/common/ui/button'
import { Card, CardContent } from '@/common/ui/card'

export interface AdminPlaceholderPageProps {
  icon: LucideIcon
  title: string
  description: string
  /** Concrete capabilities this page will gain in a later phase. */
  bullets: string[]
}

/**
 * Honest placeholder for admin routes whose full UI lands in a later phase.
 * Keeps navigation working without pretending functionality exists.
 */
export default function AdminPlaceholderPage({
  icon: Icon,
  title,
  description,
  bullets,
}: AdminPlaceholderPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-12 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Icon aria-hidden="true" className="size-7" />
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card className="w-full gap-3 text-left">
        <CardContent className="flex flex-col gap-3 px-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Construction aria-hidden="true" className="size-4 text-primary" />
            Planned for a later phase
          </p>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
                {bullet}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link to="/admin">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to overview
        </Link>
      </Button>
    </div>
  )
}
