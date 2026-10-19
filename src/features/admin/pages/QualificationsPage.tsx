import { Award } from 'lucide-react'

import AdminPlaceholderPage from '@/features/admin/components/AdminPlaceholderPage'

export default function QualificationsPage() {
  return (
    <AdminPlaceholderPage
      icon={Award}
      title="Qualifications"
      description="The qualification types teachers can hold, used during verification."
      bullets={[
        'Manage recognised qualification types',
        'Set required qualifications per subject',
        'Map qualifications to verification rules',
        'Review which teachers hold each qualification',
      ]}
    />
  )
}
