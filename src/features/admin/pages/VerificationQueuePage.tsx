import { ClipboardCheck } from 'lucide-react'

import AdminPlaceholderPage from '@/features/admin/components/AdminPlaceholderPage'

export default function VerificationQueuePage() {
  return (
    <AdminPlaceholderPage
      icon={ClipboardCheck}
      title="Verification Queue"
      description="Every teacher waiting on document review, ordered by submission time."
      bullets={[
        'Queue of pending teacher verifications',
        'Document review with inline previews',
        'Approve, reject, or request additional documents',
        'Bulk actions and assignment to reviewers',
      ]}
    />
  )
}
