import { GraduationCap } from 'lucide-react'

import AdminPlaceholderPage from '@/features/admin/components/AdminPlaceholderPage'

export default function StudentsPage() {
  return (
    <AdminPlaceholderPage
      icon={GraduationCap}
      title="Students"
      description="Browse and manage student accounts across the platform."
      bullets={[
        'Searchable student directory',
        'Account status and enrollment overview',
        'Support actions: suspend, reinstate, reset',
        'Export student records as CSV',
      ]}
    />
  )
}
