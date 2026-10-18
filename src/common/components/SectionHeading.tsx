import { cn } from '@/common/lib/utils'

export interface SectionHeadingProps {
  /** Small pill label above the heading. */
  eyebrow?: string
  heading: string
  description?: string
  align?: 'center' | 'left'
  /** Semantic heading level — use `h1` on standalone pages. */
  level?: 'h1' | 'h2'
  /** Render part of the heading with the brand gradient. */
  gradientFrom?: number
  className?: string
}

export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = 'center',
  level = 'h2',
  gradientFrom,
  className,
}: SectionHeadingProps) {
  const [head, tail] =
    gradientFrom !== undefined && gradientFrom < heading.length
      ? [heading.slice(0, gradientFrom), heading.slice(gradientFrom)]
      : [heading, undefined]
  const Heading = level

  return (
    <div
      className={cn(
        'mb-12 flex max-w-3xl flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center rounded-full border border-primary/15 bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-foreground">
          {eyebrow}
        </span>
      ) : null}
      <Heading className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
        {head}
        {tail ? <span className="text-gradient">{tail}</span> : null}
      </Heading>
      {description ? <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p> : null}
    </div>
  )
}