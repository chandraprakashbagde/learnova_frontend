import { Users } from 'lucide-react'

import AdminPlaceholderPage from '@/features/admin/components/AdminPlaceholderPage'

export default function TeachersPage() {
  return (
    <AdminPlaceholderPage
      icon={Users}
      title="Teachers"
      description="A searchable directory of every teacher on the platform, with profile and verification history."
      bullets={[
        'Searchable, filterable teacher directory',
        'Per-teacher profile with qualifications and subjects',
        'Verification history and status timeline',
        'Actions to approve, reject, or archive accounts',
      ]}
    />
  )
}
