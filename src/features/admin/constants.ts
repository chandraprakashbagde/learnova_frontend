import {
  Award,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'

import type { AdminNavItem } from '@/features/admin/types'

/** Sidebar navigation for every admin route. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: 'Overview',
    to: '/admin',
    end: true,
    icon: LayoutDashboard,
  },
  {
    label: 'Teachers',
    to: '/admin/teachers',
    icon: Users,
  },
  {
    label: 'Verification Queue',
    to: '/admin/verification-queue',
    icon: ClipboardCheck,
  },
  {
    label: 'Students',
    to: '/admin/students',
    icon: GraduationCap,
  },
  {
    label: 'Subjects',
    to: '/admin/subjects',
    icon: BookOpen,
  },
  {
    label: 'Qualifications',
    to: '/admin/qualifications',
    icon: Award,
  },
  {
    label: 'Settings',
    to: '/admin/settings',
    icon: Settings,
  },
]
