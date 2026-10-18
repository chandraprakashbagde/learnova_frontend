import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/common/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition-colors [&_svg]:pointer-events-none [&_svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow-sm',
        secondary: 'border-transparent bg-secondary text-secondary-foreground shadow-sm',
        outline: 'border-border bg-card text-foreground',
        soft: 'border-primary/15 bg-accent text-accent-foreground',
        highlight: 'border-transparent bg-highlight text-highlight-foreground shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }