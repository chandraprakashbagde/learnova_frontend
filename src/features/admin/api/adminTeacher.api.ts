import { apiGet } from '@/common/api/http'
import type { TeacherStatusValue } from '@/features/admin/lib/teacherStatus'

/**
 * Admin teacher API service.
 *
 * ⚠️ Backend status: the FastAPI teacher module
 * (`app/teacher/teacher_registration/router.py`) currently exposes NO
 * endpoints — the router file is empty and not registered in `main.py`.
 * The types below are the contract this service expects, derived from the
 * existing `Teacher` model / `TeacherOut` schema plus the fields the admin
 * panel needs. The endpoints this service calls are:
 *
 *   GET /admin/teachers                 -> TeacherListResponse
 *   GET /admin/teachers/{teacherId}     -> TeacherDetail
 *
 * Until the backend implements them, these calls return 404 and the UI
 * shows its error state. No mock data is substituted for live data.
 */

/** A teacher as returned in the list/detail payloads. */
export interface AdminTeacher {
  id: number
  first_name: string
  last_name: string
  email: string
  /** Not in the current backend model — optional until it is added. */
  phone?: string | null
  /** Not in the current backend model — optional until it is added. */
  subjects?: string[] | null
  /** Not in the current backend model — optional until it is added. */
  qualifications?: string | null
  /** Mirrors `Teacher.is_verfied` (note the backend's spelling). */
  is_verfied: boolean
  /** Mirrors the backend `AccountStatus` enum. */
  account_status: TeacherStatusValue
  /** ISO-8601; mirrors `Teacher.created_at`. */
  created_at: string
  /** ISO-8601; mirrors `Teacher.updated_at`. */
  updated_at?: string
}

/** A verification document attached to a teacher (future backend contract). */
export interface AdminTeacherDocument {
  id: number
  name: string
  status: TeacherStatusValue
  /** ISO-8601 upload timestamp. */
  uploaded_at?: string
  /**
   * Qualification this document belongs to — needed to open its history
   * chain. Optional until the backend includes it in the teacher payload.
   */
  qualification_id?: number | null
  qualification_name?: string | null
}

/** Detailed teacher payload — extends the list shape with profile fields. */
export interface AdminTeacherDetail extends AdminTeacher {
  /** Not in the current backend model — optional until it is added. */
  bio?: string | null
  /** Not in the current backend model — optional until it is added. */
  experience_years?: number | null
  /** Not in the current backend model — optional until it is added. */
  documents?: AdminTeacherDocument[] | null
  /**
   * Qualifications this teacher holds, with stable IDs so their document
   * history chains can be opened. Optional until the backend returns
   * structured qualifications (Phase 2 exposes them as a plain string).
   */
  qualification_records?: { id: number; name: string }[] | null
}

/** Query params accepted by the teacher list endpoint. */
export interface TeacherListParams {
  page?: number
  page_size?: number
  /** Free-text search over name/email, handled server-side. */
  search?: string
  /** Filter by `account_status`. */
  account_status?: TeacherStatusValue
  /** Filter by subject; only supported once the backend adds subjects. */
  subject?: string
  /** Sort field, e.g. created_at. */
  order_by?: string
  /** Sort direction. */
  order?: 'asc' | 'desc'
}

/** Paginated list envelope. */
export interface TeacherListResponse {
  items: AdminTeacher[]
  total: number
  page: number
  page_size: number
}

/** GET /admin/teachers — paginated, searchable, filterable teacher list. */
export async function listTeachers(params: TeacherListParams = {}): Promise<TeacherListResponse> {
  // `apiGet` returns the { status, data } envelope; unwrap the `data` payload.
  const response = await apiGet<TeacherListResponse>('/admin/teachers', { params })
  return response.data
}

/** GET /admin/teachers/{teacherId} — full detail for one teacher. */
export async function getTeacher(teacherId: number | string): Promise<AdminTeacherDetail> {
  const response = await apiGet<AdminTeacherDetail>(`/admin/teachers/${teacherId}`)
  return response.data
}
