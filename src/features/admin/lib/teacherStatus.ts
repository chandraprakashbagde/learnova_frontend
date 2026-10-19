import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  CircleCheckBig,
  FileClock,
  FileText,
  RefreshCw,
  TriangleAlert,
  UserPlus,
  UserX,
} from 'lucide-react'

/**
 * Statuses the backend can currently send (`AccountStatus` in
 * `app/teacher/teacher_registration/schemas.py`), plus the onboarding
 * statuses from the admin spec. Both sets are mapped so the UI stays
 * correct whichever contract the backend settles on — the raw value is
 * always what we send back to the API, never the display label.
 */
export type TeacherStatusValue =
  // Actual backend enum today.
  | 'Pending'
  | 'Approved'
  | 'Change Requested'
  | 'Rejected'
  // Onboarding statuses from the admin spec (not yet in the backend).
  | 'ACCOUNT_CREATED'
  | 'PROFILE_COMPLETED'
  | 'DOCUMENTS_PENDING'
  | 'UNDER_VERIFICATION'
  | 'ACTION_REQUIRED'
  | 'VERIFIED'

export interface TeacherStatusMeta {
  /** Human-readable label shown in the UI. */
  label: string
  /** Tailwind classes for the status pill. */
  className: string
  icon: LucideIcon
}

const STATUS_META: Record<TeacherStatusValue, TeacherStatusMeta> = {
  // Backend enum today.
  Pending: { label: 'Pending', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: FileClock },
  Approved: { label: 'Approved', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: BadgeCheck },
  'Change Requested': {
    label: 'Change Requested',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
    icon: RefreshCw,
  },
  Rejected: { label: 'Rejected', className: 'border-rose-200 bg-rose-50 text-rose-700', icon: UserX },
  // Spec onboarding statuses.
  ACCOUNT_CREATED: { label: 'Account Created', className: 'border-indigo-200 bg-indigo-50 text-indigo-700', icon: UserPlus },
  PROFILE_COMPLETED: {
    label: 'Profile Completed',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
    icon: CircleCheckBig,
  },
  DOCUMENTS_PENDING: {
    label: 'Documents Pending',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: FileText,
  },
  UNDER_VERIFICATION: {
    label: 'Under Verification',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
    icon: RefreshCw,
  },
  ACTION_REQUIRED: {
    label: 'Action Required',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: TriangleAlert,
  },
  VERIFIED: { label: 'Verified', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: BadgeCheck },
}

const UNKNOWN_META: TeacherStatusMeta = {
  label: 'Unknown',
  className: 'border-border bg-muted text-muted-foreground',
  icon: FileText,
}

/**
 * Resolves a raw status value from the API to its display metadata.
 * Unknown values fall back to a neutral pill rather than crashing, so a
 * newly added backend status still renders.
 */
export function getTeacherStatusMeta(status: string): TeacherStatusMeta {
  return STATUS_META[status as TeacherStatusValue] ?? { ...UNKNOWN_META, label: status }
}

/**
 * Options for the status filter dropdown. These are the API enum values
 * (not labels) because the value is what gets sent as a query param.
 */
export const TEACHER_STATUS_FILTER_OPTIONS: { value: TeacherStatusValue; label: string }[] = (
  Object.keys(STATUS_META) as TeacherStatusValue[]
).map((value) => ({ value, label: STATUS_META[value].label }))
