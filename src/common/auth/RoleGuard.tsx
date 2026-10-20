import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'

import { getMe, getRole } from '@/common/api/auth.api'
import { clearAccessToken, getAccessToken, isApiError } from '@/common/api/http'
import { Button } from '@/common/ui/button'
import {
  dashboardForRole,
  evaluateRoleAccess,
  parseRoleResponse,
  type RoleAccessState,
} from '@/common/auth/roles'

/** Shape of the decoded JWT returned by GET /auth/me (identity only). */
export interface GuardSession {
  user_id: string
  email: string
  role: string
  exp?: number
}

export interface RoleGuardProps {
  /** The role this route requires (e.g. `Admin`, `Teacher`, `Student`). */
  requiredRole: string
  /**
   * Content to render once authorized. Either a ReactNode, or a render
   * function receiving the session + logout for layouts that need them.
   */
  children: ReactNode | ((ctx: { session: GuardSession; onLogout: () => void }) => ReactNode)
  /** Optional label for the loading state. */
  loadingLabel?: string
}

/**
 * Reusable role-based route guard for `/admin/*`, `/teacher/*`, `/student/*`.
 *
 * Flow (pure decision logic in `roles.ts`):
 *  1. No token -> redirect to the existing login flow (carrying `from`).
 *  2. Request the role once per mount from `GET /auth/role` (a plain string).
 *  3. Required role -> render the protected content.
 *  4. Another role -> redirect to that user's own dashboard (no dead end).
 *  5. Role endpoint failure -> never grant access; show a retry.
 *
 * Protected content is never rendered before the role check resolves. This
 * guard is UX only — the backend must independently enforce authorization on
 * every protected endpoint (`require_role` / `require_admin`).
 */
export default function RoleGuard({ requiredRole, children, loadingLabel }: RoleGuardProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const [hasToken, setHasToken] = useState(() => Boolean(getAccessToken()))
  const [role, setRole] = useState<string | null>(null)
  const [session, setSession] = useState<GuardSession | null>(null)
  const [resolved, setResolved] = useState(false)
  const [error, setError] = useState<{ status?: number; message: string } | null>(null)
  // Bumped by the "Try again" button to re-run the role request.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!hasToken) return

    let cancelled = false

    // Authorization is decided solely by GET /auth/role. We also fetch
    // GET /auth/me once for identity (email/user_id); its role claim is NOT
    // used for the access decision.
    Promise.allSettled([getRole(), getMe<GuardSession>()]).then(([roleResult, meResult]) => {
      if (cancelled) return

      if (roleResult.status === 'rejected') {
        const err: unknown = roleResult.reason
        if (isApiError(err) && (err.status === 401 || err.status === 403)) {
          // Expired/invalid session -> clear the stale token and send to login.
          clearAccessToken()
          setHasToken(false)
          setRole(null)
          setSession(null)
          setResolved(false)
          return
        }
        setError({
          status: isApiError(err) ? err.status : undefined,
          message: isApiError(err) ? err.message : 'Unable to reach the server.',
        })
        setResolved(true)
        return
      }

      const parsedRole = parseRoleResponse(roleResult.value.data)
      setRole(parsedRole)

      if (meResult.status === 'fulfilled' && meResult.value.data) {
        setSession({ ...meResult.value.data, role: parsedRole ?? meResult.value.data.role })
      } else {
        setSession({ user_id: '', email: '', role: parsedRole ?? '' })
      }

      setResolved(true)
    })

    return () => {
      cancelled = true
    }
  }, [hasToken, attempt])

  const access: RoleAccessState = evaluateRoleAccess({ hasToken, role, resolved, requiredRole, error })

  const handleLogout = () => {
    clearAccessToken()
    setHasToken(false)
    setRole(null)
    setSession(null)
    setResolved(false)
    // Route to login via the router (no full reload); `from` lets the login
    // page return the user here after re-authenticating.
    navigate('/login', { replace: true, state: { from: location.pathname } })
  }

  if (access.status === 'checking') {
    return (
      <div className="grid min-h-svh place-items-center bg-background" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">{loadingLabel ?? 'Verifying your access…'}</p>
        </div>
      </div>
    )
  }

  if (access.status === 'unauthenticated') {
    // Redirect to the existing login flow, preserving the intended destination.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (access.status === 'wrongRole') {
    // Authenticated as a different role -> send them to their own dashboard.
    // `replace` keeps this out of history so Back doesn't bounce between roles.
    return <Navigate to={dashboardForRole(access.role)} replace />
  }

  if (access.status === 'error') {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldAlert aria-hidden="true" className="size-6" />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Couldn't verify your access</h1>
          <p className="text-sm text-muted-foreground">{access.message}</p>
          <Button
            onClick={() => {
              // Reset in the click handler (not the effect) so the retry
              // starts from a clean checking state.
              setError(null)
              setResolved(false)
              setAttempt((count) => count + 1)
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  // access.status === 'granted' — only the required role reaches this branch.
  const ctx = {
    session: session ?? { user_id: '', email: '', role: access.role },
    onLogout: handleLogout,
  }
  return <>{typeof children === 'function' ? children(ctx) : children}</>
}
