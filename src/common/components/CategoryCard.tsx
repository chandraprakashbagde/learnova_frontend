import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SmartImage } from '@/common/components/SmartImage'
import { cn } from '@/common/lib/utils'

export type CategoryTone = 'indigo' | 'violet' | 'cyan' | 'amber' | 'emerald' | 'rose'

export interface CategoryCardProps {
  icon: LucideIcon
  title: string
  description?: string
  /** Sample metadata such as "Sample track". */
  meta?: string
  tone?: CategoryTone
  /** Optional category thumbnail; keep the same aspect ratio across cards. */
  image?: { src: string; avifSrc?: string; alt: string }
  to?: string
  className?: string
}

const toneStyles: Record<CategoryTone, { icon: string; glow: string }> = {
  indigo: { icon: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground', glow: 'group-hover:shadow-primary/15' },
  violet: { icon: 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground', glow: 'group-hover:shadow-secondary/15' },
  cyan: { icon: 'bg-cyan-50 text-cyan-700 group-hover:bg-brand-accent group-hover:text-white', glow: 'group-hover:shadow-cyan-500/15' },
  amber: { icon: 'bg-amber-50 text-amber-600 group-hover:bg-highlight group-hover:text-highlight-foreground', glow: 'group-hover:shadow-highlight/25' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white', glow: 'group-hover:shadow-emerald-500/15' },
  rose: { icon: 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white', glow: 'group-hover:shadow-rose-500/15' },
}

export function CategoryCard({ icon: Icon, title, description, meta, tone = 'indigo', image, to = '/courses', className }: CategoryCardProps) {
  const styles = toneStyles[tone]

  return (
    <Link
      to={to}
      aria-label={`Explore ${title} courses`}
      className={cn(
        'group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl',
        styles.glow,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute -right-8 -top-8 size-24 rounded-full opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-70',
          tone === 'indigo' && 'bg-primary/30',
          tone === 'violet' && 'bg-secondary/30',
          tone === 'cyan' && 'bg-cyan-300',
          tone === 'amber' && 'bg-amber-300',
          tone === 'emerald' && 'bg-emerald-300',
          tone === 'rose' && 'bg-rose-300',
        )}
      />
      {image ? (
        <SmartImage
          src={image.src}
          sources={image.avifSrc ? [{ type: 'image/avif', src: image.avifSrc }] : undefined}
          alt={image.alt}
          aspectClassName="aspect-[16/9]"
          className="relative rounded-xl"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : null}
      <span className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'grid size-11 place-items-center rounded-xl transition-colors duration-300',
            styles.icon,
          )}
        >
          <Icon className="size-5" strokeWidth={2} />
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100"
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-bold text-foreground">{title}</span>
        {description ? <span className="text-sm leading-relaxed text-muted-foreground">{description}</span> : null}
        {meta ? (
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{meta}</span>
        ) : null}
      </span>
    </Link>
  )
}