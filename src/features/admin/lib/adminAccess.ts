/**
 * Pure, framework-free authorization logic for the admin route guard.
 *
 * Kept free of React/axios so it can be unit-tested directly. The source of
 * truth for the role is always the backend (`GET /auth/role`) — never a
 * hardcoded value, localStorage, or a frontend role variable.
 */

/**
 * The admin role value, matching the backend's `Role` enum exactly
 * (`app/auth/schemas.py`: `ADMIN = "Admin"`). Compared case-sensitively
 * against the value the API returns.
 */
export const ADMIN_ROLE = 'Admin'

/** Roles the backend can return for a signed-in user. */
export const NON_ADMIN_ROLES = ['Student', 'Teacher', 'Staff'] as const

/**
 * Parses the payload from `GET /role` into a role string.
 *
 * The backend currently returns a **plain string** (`"Admin"`). This also
 * tolerates `{ role: "Admin" }` and `{ data: "Admin" }` shapes defensively
 * so a future envelope change doesn't silently break authorization, but it
 * never invents a role that isn't present.
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

/** True when the parsed role grants admin access. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === ADMIN_ROLE
}

/** The outcome of the guard's access check. */
export type AdminAccessState =
  /** Role request still in flight — no protected content may render. */
  | { status: 'checking' }
  /** No token, or the backend rejected it (401). */
  | { status: 'unauthenticated' }
  /** Authenticated but the role is not admin — deny and redirect. */
  | { status: 'denied'; role: string }
  /** Authenticated as admin — safe to render admin routes. */
  | { status: 'granted'; role: string }
  /** Transient failure (network/5xx) — neither grant nor redirect. */
  | { status: 'error'; message: string }

export interface AdminAccessInput {
  /** Whether an access token is present (existing auth mechanism). */
  hasToken: boolean
  /** Parsed role from `GET /role`; null while loading or when unparsable. */
  role: string | null
  /** Whether the role request has settled (success or failure). */
  resolved: boolean
  /** Error from the role request, if it failed. */
  error?: { status?: number; message?: string } | null
}

/**
 * Decides admin access from the current auth + role-request state.
 *
 * Ordering matters: a 401 always means "unauthenticated" (expired session),
 * a non-401 error never grants access, and a missing/unparsed role keeps the
 * guard in `checking`/`denied` rather than leaking protected content.
 */
export function evaluateAdminAccess({ hasToken, role, resolved, error }: AdminAccessInput): AdminAccessState {
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

  if (isAdminRole(role)) return { status: 'granted', role: role as string }

  // Authenticated but not an admin (or role unparsable) -> deny.
  return { status: 'denied', role: role ?? 'unknown' }
}
