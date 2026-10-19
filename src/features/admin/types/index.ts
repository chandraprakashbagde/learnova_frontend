import type { LucideIcon } from 'lucide-react'

/** Verification lifecycle of a teacher registration. */
export type VerificationStatus = 'Pending' | 'Verified' | 'Action Required'

/**
 * Shape returned by GET /auth/me — the decoded JWT payload the backend
 * signs at login (`app/auth/utilities.py`).
 */
export interface AdminSessionUser {
  user_id: string
  email: string
  role: string
  exp?: number
}

/** A single entry in the admin sidebar navigation. */
export interface AdminNavItem {
  label: string
  to: string
  /** Match the route exactly (used for the `/admin` overview link). */
  end?: boolean
  icon: LucideIcon
}

/** Summary statistics shown on the dashboard overview. */
export interface DashboardStats {
  totalTeachers: number
  pendingVerifications: number
  verifiedTeachers: number
  requiringAction: number
}

/** A teacher as listed in admin tables. */
export interface TeacherSummary {
  id: string
  name: string
  email: string
  subject: string
  /** ISO-8601 timestamp of the registration. */
  registeredAt: string
  status: VerificationStatus
}

/** An entry in the teacher verification queue. */
export interface VerificationQueueItem {
  id: string
  teacherId: string
  teacherName: string
  /** Document names still awaiting review. */
  pendingDocuments: string[]
  /** ISO-8601 timestamp of the submission. */
  submittedAt: string
  status: VerificationStatus
}

/** A single entry in the recent admin activity timeline. */
export interface AdminActivityEvent {
  id: string
  actor: string
  action: string
  /** Optional secondary line describing the action's target. */
  detail?: string
  /** Human-readable timestamp label (mock data only; APIs supply ISO dates). */
  timeLabel: string
  icon: LucideIcon
}
