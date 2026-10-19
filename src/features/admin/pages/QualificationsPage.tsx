import { MasterDataListPage } from '@/features/admin/components/MasterDataListPage'

export default function QualificationsPage() {
  return (
    <MasterDataListPage
      kind="qualifications"
      noun="qualification type"
      caption="Qualification types"
      searchPlaceholder="Search qualifications by name…"
      nameHeader="Qualification"
    />
  )
}
