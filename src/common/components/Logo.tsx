import { GraduationCap } from 'lucide-react'

import { BRAND_NAME } from '@/common/constants/navigation'
import { cn } from '@/common/lib/utils'

export interface LogoProps {
  className?: string
  /** Size variant used to fit different containers. */
  size?: 'sm' | 'md'
}

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'gradient-cta grid place-items-center rounded-xl text-primary-foreground shadow-md shadow-primary/25',
          size === 'sm' ? 'size-8' : 'size-10',
        )}
      >
        <GraduationCap className={size === 'sm' ? 'size-4.5' : 'size-5.5'} strokeWidth={2.25} />
      </span>
      <span
        className={cn(
          'font-extrabold tracking-tight text-foreground',
          size === 'sm' ? 'text-lg' : 'text-xl',
        )}
      >
        {BRAND_NAME.slice(0, Math.max(BRAND_NAME.length - 3))}
        <span className="text-gradient">{BRAND_NAME.slice(-3)}</span>
      </span>
    </span>
  )
}