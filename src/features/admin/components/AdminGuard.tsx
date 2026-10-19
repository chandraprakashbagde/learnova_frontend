import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Loader2, Lock, ShieldAlert } from 'lucide-react'

import { getMe } from '@/common/api/auth.api'
import { clearAccessToken, getAccessToken, isApiError } from '@/common/api/http'
import { Button } from '@/common/ui/button'
import AdminLayout from '@/app/layouts/AdminLayout'
import type { AdminSessionUser } from '@/features/admin/types'

type GuardState =
  | { status: 'checking' }
  | { status: 'unauthenticated' }
  | { status: 'forbidden' }
  | { status: 'error'; message: string }
  | { status: 'ready'; session: AdminSessionUser }

/**
 * ⚠️ TEMPORARY DEV BYPASS — remove before shipping.
 *
 * While `true`, every `/admin/*` route renders without a token or an
 * Admin-role account, using `DEV_ADMIN_SESSION` as the fake identity.
 * Set back to `false` to restore the real /auth/me authorization check.
 */
const BYPASS_ADMIN_AUTH = true

/** Fake identity shown in the header while the bypass is active. */
const DEV_ADMIN_SESSION: AdminSessionUser = {
  user_id: 'dev-admin',
  email: 'admin@learnova.dev',
  role: 'Admin',
}

/**
 * Protects every `/admin/*` route.
 *
 * Authorization is enforced by the backend: GET /auth/me validates the
 * bearer token (`validate_token`) and returns its signed claims, which
 * include the role. Only an `Admin` role is allowed through; anything
 * else sees an explanatory screen instead of the admin UI.
 */
export default function AdminGuard({ children }: { children?: ReactNode }) {
  const location = useLocation()
  const [state, setState] = useState<GuardState>(() => {
    if (BYPASS_ADMIN_AUTH) return { status: 'ready', session: DEV_ADMIN_SESSION }
    return getAccessToken() ? { status: 'checking' } : { status: 'unauthenticated' }
  })
  // Bumped by the "Try again" button to re-run the access check.
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Bypass active: never call the API.
    if (BYPASS_ADMIN_AUTH) return
    // Initial state already covers the missing-token case.
    if (!getAccessToken()) return

    let cancelled = false

    getMe<AdminSessionUser>()
      .then(({ data }) => {
        if (cancelled) return
        if (data && data.role === 'Admin') {
          setState({ status: 'ready', session: data })
        } else {
          setState({ status: 'forbidden' })
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (isApiError(error) && (error.status === 401 || error.status === 403)) {
          setState({ status: 'unauthenticated' })
        } else {
          setState({
            status: 'error',
            message: isApiError(error) ? error.message : 'Unable to reach the server.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const handleLogout = () => {
    clearAccessToken()
    // With the bypass on, "logging out" just returns to the panel itself.
    setState(
      BYPASS_ADMIN_AUTH
        ? { status: 'ready', session: DEV_ADMIN_SESSION }
        : { status: 'unauthenticated' },
    )
  }

  if (state.status === 'checking') {
    return (
      <div className="grid min-h-svh place-items-center bg-background" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Verifying your admin access…</p>
        </div>
      </div>
    )
  }

  if (state.status === 'unauthenticated') {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <Lock aria-hidden="true" className="size-6" />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Admin sign-in required</h1>
          <p className="text-sm text-muted-foreground">
            You need to be signed in before you can access the admin panel.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/login" state={{ from: location.pathname }}>
                Log in
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <Home aria-hidden="true" className="size-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (state.status === 'forbidden') {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert aria-hidden="true" className="size-6" />
          </span>
          <h1 className="text-xl font-semibold text-foreground">You don't have admin access</h1>
          <p className="text-sm text-muted-foreground">
            This account isn't authorised for the admin panel. If you believe this is a mistake,
            contact another administrator.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" onClick={handleLogout}>
              <Link to="/login">Sign in with another account</Link>
            </Button>
            <Button asChild variant="ghost" onClick={handleLogout}>
              <Link to="/">
                <Home aria-hidden="true" className="size-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldAlert aria-hidden="true" className="size-6" />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Couldn't verify your access</h1>
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => {
                setState({ status: 'checking' })
                setAttempt((count) => count + 1)
              }}
            >
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <Home aria-hidden="true" className="size-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // `children` lets the guard wrap a standalone element; otherwise it hosts
  // the admin layout with the routed child rendered through <Outlet />.
  return children ? <>{children}</> : <AdminLayout session={state.session} onLogout={handleLogout} />
}
