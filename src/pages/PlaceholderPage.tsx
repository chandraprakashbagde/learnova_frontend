import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/common/ui/badge'
import { Button } from '@/common/ui/button'

export interface PlaceholderPageProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  primaryAction: { label: string; to: string }
  secondaryAction?: { label: string; to: string }
}

/**
 * Destination page for routes that are registered but not designed yet
 * (login, about, privacy, ...). Every link has a real, complete URL.
 */
export default function PlaceholderPage({
  icon: Icon,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: PlaceholderPageProps) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -left-24 top-0 size-80 rounded-full bg-primary/10 blur-3xl" />
        <span className="absolute -right-16 bottom-0 size-72 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute inset-0 bg-dots opacity-50" />
      </div>

      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-32 text-center sm:px-6">
        <span
          aria-hidden="true"
          className="gradient-cta grid size-16 place-items-center rounded-2xl text-primary-foreground shadow-lg shadow-primary/25"
        >
          <Icon className="size-8" strokeWidth={2} />
        </span>

        <Badge variant="soft" className="mt-6">
          {eyebrow}
        </Badge>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>

        <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to={primaryAction.to}>
              {primaryAction.label}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          {secondaryAction ? (
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to={secondaryAction.to}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                {secondaryAction.label}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}