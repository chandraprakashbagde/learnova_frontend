import { MasterDataListPage } from '@/features/admin/components/MasterDataListPage'

export default function SubjectsPage() {
  return (
    <MasterDataListPage
      kind="subjects"
      noun="subject"
      caption="Subjects"
      searchPlaceholder="Search subjects by name…"
      nameHeader="Subject"
    />
  )
}
