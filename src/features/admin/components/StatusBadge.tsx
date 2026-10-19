import { BadgeCheck, Clock3, TriangleAlert } from 'lucide-react'

import { Badge } from '@/common/ui/badge'
import { cn } from '@/common/lib/utils'
import type { VerificationStatus } from '@/features/admin/types'

const STATUS_STYLES: Record<
  VerificationStatus,
  { className: string; icon: typeof BadgeCheck }
> = {
  Verified: {
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: BadgeCheck,
  },
  Pending: {
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: Clock3,
  },
  'Action Required': {
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: TriangleAlert,
  },
}

/** Coloured pill communicating a teacher's verification status. */
export function StatusBadge({
  status,
  className,
}: {
  status: VerificationStatus
  className?: string
}) {
  const { className: statusClassName, icon: Icon } = STATUS_STYLES[status]
  return (
    <Badge variant="outline" className={cn(statusClassName, className)}>
      <Icon aria-hidden="true" />
      {status}
    </Badge>
  )
}
