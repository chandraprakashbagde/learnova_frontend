import {
  BadgeCheck,
  ClipboardCheck,
  FilePenLine,
  LogIn,
  UserPlus,
  UserX,
} from 'lucide-react'

import type {
  AdminActivityEvent,
  DashboardStats,
  TeacherSummary,
  VerificationQueueItem,
} from '@/features/admin/types'

/**
 * Mock data for the admin UI only.
 *
 * These values are NOT fetched from the backend and must not be presented as
 * live data. When the admin APIs land (later phase), replace the exports
 * below with typed API responses — the dashboard components already consume
 * these exact shapes.
 */

export const MOCK_STATS: DashboardStats = {
  totalTeachers: 128,
  pendingVerifications: 14,
  verifiedTeachers: 96,
  requiringAction: 18,
}

export const MOCK_RECENT_TEACHERS: TeacherSummary[] = [
  {
    id: 't-1042',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    subject: 'Mathematics',
    registeredAt: '2026-10-18T09:24:00Z',
    status: 'Pending',
  },
  {
    id: 't-1041',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    subject: 'Physics',
    registeredAt: '2026-10-17T15:02:00Z',
    status: 'Verified',
  },
  {
    id: 't-1040',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@example.com',
    subject: 'Chemistry',
    registeredAt: '2026-10-17T11:47:00Z',
    status: 'Action Required',
  },
  {
    id: 't-1039',
    name: 'Karan Mehta',
    email: 'karan.mehta@example.com',
    subject: 'English Literature',
    registeredAt: '2026-10-16T08:15:00Z',
    status: 'Pending',
  },
  {
    id: 't-1038',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    subject: 'Biology',
    registeredAt: '2026-10-15T17:30:00Z',
    status: 'Verified',
  },
]

export const MOCK_VERIFICATION_QUEUE: VerificationQueueItem[] = [
  {
    id: 'v-512',
    teacherId: 't-1042',
    teacherName: 'Priya Sharma',
    pendingDocuments: ['Government ID', 'Degree Certificate'],
    submittedAt: '2026-10-18T09:26:00Z',
    status: 'Pending',
  },
  {
    id: 'v-511',
    teacherId: 't-1039',
    teacherName: 'Karan Mehta',
    pendingDocuments: ['Teaching Certificate'],
    submittedAt: '2026-10-16T08:20:00Z',
    status: 'Pending',
  },
  {
    id: 'v-510',
    teacherId: 't-1040',
    teacherName: 'Ananya Iyer',
    pendingDocuments: ['Government ID', 'Address Proof', 'Degree Certificate'],
    submittedAt: '2026-10-17T11:50:00Z',
    status: 'Action Required',
  },
  {
    id: 'v-509',
    teacherId: 't-1037',
    teacherName: 'Vikram Singh',
    pendingDocuments: ['Degree Certificate'],
    submittedAt: '2026-10-15T13:05:00Z',
    status: 'Pending',
  },
]

export const MOCK_ADMIN_ACTIVITY: AdminActivityEvent[] = [
  {
    id: 'a-301',
    actor: 'Admin',
    action: 'Approved teacher verification',
    detail: 'Rahul Verma · Physics',
    timeLabel: '2 hours ago',
    icon: BadgeCheck,
  },
  {
    id: 'a-300',
    actor: 'Admin',
    action: 'Requested additional documents',
    detail: 'Ananya Iyer · Chemistry',
    timeLabel: '5 hours ago',
    icon: FilePenLine,
  },
  {
    id: 'a-299',
    actor: 'Admin',
    action: 'Removed a teacher account',
    detail: 'Duplicate registration',
    timeLabel: 'Yesterday',
    icon: UserX,
  },
  {
    id: 'a-298',
    actor: 'System',
    action: 'New teacher registered',
    detail: 'Priya Sharma · Mathematics',
    timeLabel: 'Yesterday',
    icon: UserPlus,
  },
  {
    id: 'a-297',
    actor: 'Admin',
    action: 'Signed in to the admin panel',
    timeLabel: '2 days ago',
    icon: LogIn,
  },
  {
    id: 'a-296',
    actor: 'System',
    action: 'Verification documents submitted',
    detail: 'Karan Mehta · English Literature',
    timeLabel: '3 days ago',
    icon: ClipboardCheck,
  },
]
