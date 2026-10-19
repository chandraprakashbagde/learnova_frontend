import { Settings } from 'lucide-react'

import AdminPlaceholderPage from '@/features/admin/components/AdminPlaceholderPage'

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholderPage
      icon={Settings}
      title="Settings"
      description="Panel preferences and administrative configuration."
      bullets={[
        'Admin profile and password management',
        'Verification policy configuration',
        'Notification and email template settings',
        'Admin activity audit log',
      ]}
    />
  )
}
