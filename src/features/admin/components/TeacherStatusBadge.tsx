import { Badge } from '@/common/ui/badge'
import { cn } from '@/common/lib/utils'
import { getTeacherStatusMeta } from '@/features/admin/lib/teacherStatus'

/**
 * Pill that renders a teacher's account/onboarding status using the
 * backend enum value. The raw value is never altered — only the display
 * label, colour, and icon come from the mapping.
 */
export function TeacherStatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const meta = getTeacherStatusMeta(status)
  const Icon = meta.icon
  return (
    <Badge variant="outline" className={cn(meta.className, className)}>
      <Icon aria-hidden="true" />
      {meta.label}
    </Badge>
  )
}
