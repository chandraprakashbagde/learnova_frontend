import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/common/ui/card'
import { cn } from '@/common/lib/utils'

export interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  index?: number
  className?: string
}

export function FeatureCard({ icon: Icon, title, description, index, className }: FeatureCardProps) {
  return (
    <Card
      className={cn(
        'group gap-4 py-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10',
        className,
      )}
    >
      <CardContent className="flex flex-col gap-4 px-8">
        <span className="relative grid size-13 place-items-center rounded-2xl bg-accent text-accent-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-6" strokeWidth={2} aria-hidden="true" />
          {typeof index === 'number' ? (
            <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-highlight text-[10px] font-bold text-highlight-foreground">
              {index + 1}
            </span>
          ) : null}
        </span>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}