import { ArrowRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SmartImage } from '@/common/components/SmartImage'
import { Button } from '@/common/ui/button'
import { cn } from '@/common/lib/utils'

export type RoleTone = 'student' | 'teacher'

export interface RoleCardProps {
  role: RoleTone
  /** Small label such as "For learners". */
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  ctaLabel: string
  to: string
  /** Optional card image; both cards should use the same aspect ratio. */
  image?: { src: string; avifSrc?: string; alt: string }
  className?: string
}

const toneStyles: Record<RoleTone, { label: string; labelMuted: string; border: string; icon: string; ring: string }> = {
  student: {
    label: 'from-primary via-primary/70 to-cyan-400',
    labelMuted: 'text-primary',
    border: 'group-hover:shadow-primary/20',
    icon: 'bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground',
    ring: 'ring-primary/15 group-hover:ring-primary/30',
  },
  teacher: {
    label: 'from-secondary via-secondary/70 to-fuchsia-400',
    labelMuted: 'text-secondary',
    border: 'group-hover:shadow-secondary/20',
    icon: 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground',
    ring: 'ring-secondary/15 group-hover:ring-secondary/30',
  },
}

export function RoleCard({ role, eyebrow, title, description, icon: Icon, ctaLabel, to, image, className }: RoleCardProps) {
  const styles = toneStyles[role]

  return (
    <article
      className={cn(
        'group relative rounded-[1.4rem] bg-gradient-to-br p-px transition-shadow duration-300',
        styles.label,
        styles.border,
        'shadow-lg shadow-slate-900/5 hover:shadow-xl',
        className,
      )}
    >
      <div className="relative flex h-full flex-col gap-5 overflow-hidden rounded-[1.35rem] bg-card p-7 sm:p-8">
        {/* Decorative background glow */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -right-10 -top-12 size-40 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60',
            role === 'student' ? 'bg-primary' : 'bg-secondary',
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-dots opacity-40"
        />

        {image ? (
          <SmartImage
            src={image.src}
            sources={image.avifSrc ? [{ type: 'image/avif', src: image.avifSrc }] : undefined}
            alt={image.alt}
            aspectClassName="aspect-[16/10]"
            className="relative rounded-2xl"
            imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}

        <div className="relative flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className={cn(
              'grid size-14 place-items-center rounded-2xl transition-colors duration-300',
              styles.icon,
            )}
          >
            <Icon className="size-7" strokeWidth={2} />
          </span>
          <span
            className={cn(
              'rounded-full border border-border bg-background px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground',
            )}
          >
            {eyebrow}
          </span>
        </div>

        <div className="relative flex flex-col gap-2">
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        </div>

        <div className="relative mt-auto pt-2">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to={to}>
              {ctaLabel}
              <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}