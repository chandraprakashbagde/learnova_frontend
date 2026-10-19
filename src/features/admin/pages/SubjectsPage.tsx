import { BookOpen } from 'lucide-react'

import AdminPlaceholderPage from '@/features/admin/components/AdminPlaceholderPage'

export default function SubjectsPage() {
  return (
    <AdminPlaceholderPage
      icon={BookOpen}
      title="Subjects"
      description="Manage the subject catalogue teachers can be assigned to."
      bullets={[
        'Create, rename, and archive subjects',
        'Assign subject categories and difficulty levels',
        'See how many teachers cover each subject',
        'Reorder subjects for the public course explorer',
      ]}
    />
  )
}
