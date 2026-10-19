import { useParams } from 'react-router-dom'
import { UserRound } from 'lucide-react'

import AdminPlaceholderPage from '@/features/admin/components/AdminPlaceholderPage'

export default function TeacherDetailsPage() {
  const { teacherId } = useParams<{ teacherId: string }>()

  return (
    <AdminPlaceholderPage
      icon={UserRound}
      title="Teacher Details"
      description={`Full profile, submitted documents, and verification controls for teacher ${teacherId ?? '—'}. This page arrives with the teacher detail API.`}
      bullets={[
        'Profile overview: name, email, subjects, qualifications',
        'Submitted document viewer with approve/reject controls',
        'Verification decision history with admin audit trail',
        'Contact and account-status management',
      ]}
    />
  )
}
