import { BadgeCheck, Clock3, FileX } from 'lucide-react'

import { Badge } from '@/common/ui/badge'
import { cn } from '@/common/lib/utils'
import type { DocumentStatus } from '@/features/admin/api/adminVerification.api'

const STATUS_STYLES: Record<
  DocumentStatus,
  { label: string; className: string; icon: typeof BadgeCheck }
> = {
  PENDING: { label: 'Pending', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: Clock3 },
  APPROVED: { label: 'Approved', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: BadgeCheck },
  REJECTED: { label: 'Rejected', className: 'border-rose-200 bg-rose-50 text-rose-700', icon: FileX },
}

/** Coloured pill for a verification document's `current_status`. */
export function DocumentStatusBadge({
  status,
  className,
}: {
  status: DocumentStatus
  className?: string
}) {
  const { label, className: statusClassName, icon: Icon } = STATUS_STYLES[status]
  return (
    <Badge variant="outline" className={cn(statusClassName, className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  )
}
