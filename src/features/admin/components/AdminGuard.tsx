import RoleGuard from '@/common/auth/RoleGuard'
import { ADMIN_ROLE } from '@/common/auth/roles'
import AdminLayout from '@/app/layouts/AdminLayout'

/**
 * Protects every `/admin/*` route by requiring the `Admin` role.
 *
 * All authentication/role logic lives in the reusable `RoleGuard` (which
 * calls `GET /auth/role` and never trusts the client). This wrapper only
 * supplies the required role and renders the `AdminLayout` shell once
 * authorized; the routed admin pages render through the layout's `<Outlet/>`.
 *
 * Frontend guards are UX only — the backend must still enforce permissions
 * on every admin endpoint (`require_admin`).
 */
export default function AdminGuard() {
  return (
    <RoleGuard requiredRole={ADMIN_ROLE} loadingLabel="Verifying your admin access…">
      {({ session, onLogout }) => <AdminLayout session={session} onLogout={onLogout} />}
    </RoleGuard>
  )
}
