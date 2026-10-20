/**
 * Shared, framework-free role-based routing logic.
 *
 * Used by the admin, teacher, and student route guards. Kept free of
 * React/axios so it is unit-testable. The source of truth for the role is
 * always the backend (`GET /auth/role`) — never a hardcoded value,
 * localStorage, or a frontend role variable.
 */

/**
 * Role values, matching the backend `Role` enum exactly
 * (`app/auth/schemas.py`: `ADMIN="Admin"`, `TEACHER="Teacher"`,
 * `STUDENT="Student"`). Compared case-sensitively against the API value.
 */
export const ADMIN_ROLE = 'Admin'
export const TEACHER_ROLE = 'Teacher'
export const STUDENT_ROLE = 'Student'

/** Any of the three role-scoped dashboards. */
export type RoleScopedPath = '/admin' | '/teacher' | '/student'

/** The dashboard path for each role. */
export const ROLE_DASHBOARD: Record<string, RoleScopedPath> = {
  [ADMIN_ROLE]: '/admin',
  [TEACHER_ROLE]: '/teacher',
  [STUDENT_ROLE]: '/student',
}

/** Returns the dashboard path for a role, or `/` for unknown roles. */
export function dashboardForRole(role: string | null | undefined): string {
  if (role && ROLE_DASHBOARD[role]) return ROLE_DASHBOARD[role]
  return '/'
}

/**
 * Parses the payload from `GET /role` into a role string.
 *
 * The backend returns a **plain string** (`"Admin"`). This also tolerates
 * `{ role }` and a wrapped `{ data }` shape defensively, but never invents a
 * role that isn't present.
 */
export function parseRoleResponse(data: unknown): string | null {
  if (typeof data === 'string') {
    const trimmed = data.trim()
    return trimmed === '' ? null : trimmed
  }

  if (data !== null && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (typeof record.role === 'string' && record.role.trim() !== '') return record.role.trim()
    // Tolerate a wrapped payload: { data: "Admin" }.
    if (record.data !== undefined) return parseRoleResponse(record.data)
  }

  return null
}

/** The outcome of a role guard's access check. */
export type RoleAccessState =
  /** Role request still in flight — no protected content may render. */
  | { status: 'checking' }
  /** No token, or the backend rejected it (401). */
  | { status: 'unauthenticated' }
  /** Authenticated but the role is not the one this route requires. */
  | { status: 'wrongRole'; role: string }
  /** Authenticated with the required role — safe to render. */
  | { status: 'granted'; role: string }
  /** Transient failure (network/5xx) — neither grant nor redirect. */
  | { status: 'error'; message: string }

export interface RoleAccessInput {
  /** Whether an access token is present (existing auth mechanism). */
  hasToken: boolean
  /** Parsed role from `GET /role`; null while loading or when unparsable. */
  role: string | null
  /** Whether the role request has settled (success or failure). */
  resolved: boolean
  /** The role this route requires (e.g. `Admin`). */
  requiredRole: string
  /** Error from the role request, if it failed. */
  error?: { status?: number; message?: string } | null
}

/**
 * Decides access to a role-scoped route from the current auth + role state.
 *
 * Ordering matters: a 401 always means "unauthenticated" (expired session),
 * a non-401 error never grants access, and a missing/unparsed role is treated
 * as a wrong role rather than leaking protected content.
 */
export function evaluateRoleAccess({
  hasToken,
  role,
  resolved,
  requiredRole,
  error,
}: RoleAccessInput): RoleAccessState {
  if (!hasToken) return { status: 'unauthenticated' }

  if (!resolved) return { status: 'checking' }

  if (error) {
    // 401 = expired/invalid session -> send the user to login.
    if (error.status === 401) return { status: 'unauthenticated' }
    // Any other failure must NOT grant access; surface it for a retry.
    return {
      status: 'error',
      message: error.message && error.message.trim() !== '' ? error.message : 'Unable to verify your access.',
    }
  }

  if (role === requiredRole) return { status: 'granted', role: role as string }

  // Authenticated but not the required role (or role unparsable) -> wrong role.
  return { status: 'wrongRole', role: role ?? 'unknown' }
}

/**
 * Resolves where to send a user right after a successful login.
 *
 * Honours the originally requested `from` path only when it is a safe,
 * internal path that is valid for the user's role (i.e. under their own
 * dashboard). Otherwise falls back to the role's dashboard — so a student
 * sent to /admin is redirected to /student, never into another role's area.
 */
export function postLoginRedirectTarget(role: string | null, from: string | null | undefined): string {
  const dashboard = dashboardForRole(role)

  // Only same-origin, absolute-path targets are honoured (open-redirect guard).
  if (!from || !from.startsWith('/') || from.startsWith('//')) return dashboard

  // The destination is valid for this role only if it lives under their
  // dashboard (or is the dashboard itself). Public pages are also allowed.
  if (from === dashboard || from.startsWith(`${dashboard}/`)) return from

  // `from` points at another role's area (or an unknown path) -> own dashboard.
  return dashboard
}
