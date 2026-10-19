import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, GraduationCap } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/common/ui/sheet'
import { Button } from '@/common/ui/button'
import { Logo } from '@/common/components/Logo'
import { AdminHeader } from '@/features/admin/components/AdminHeader'
import { AdminSidebarNav } from '@/features/admin/components/AdminSidebar'
import { BRAND_NAME } from '@/common/constants/navigation'
import type { AdminSessionUser } from '@/features/admin/types'
import { cn } from '@/common/lib/utils'

export interface AdminLayoutProps {
  /** Authenticated admin returned by GET /auth/me. */
  session: AdminSessionUser
  /** Clears the access token and sends the user to the login page. */
  onLogout: () => void
}

/**
 * Shell shared by every admin route: collapsible desktop sidebar,
 * mobile drawer, and a sticky header with breadcrumbs and profile menu.
 */
export default function AdminLayout({ session, onLogout }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside
        aria-label="Admin sidebar"
        className={cn(
          'sticky top-0 hidden h-svh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 lg:flex',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-border', collapsed ? 'justify-center px-3' : 'justify-between px-5')}>
          <Link
            to="/admin"
            aria-label={`${BRAND_NAME} admin overview`}
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
          >
            {collapsed ? (
              <span
                aria-hidden="true"
                className="gradient-cta grid size-9 place-items-center rounded-xl text-primary-foreground shadow-md shadow-primary/25"
              >
                <GraduationCap className="size-5" strokeWidth={2.25} />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                  Admin
                </span>
              </span>
            )}
          </Link>
          {!collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Collapse sidebar"
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftClose aria-hidden="true" className="size-4.5" />
            </Button>
          ) : null}
        </div>

        {collapsed ? (
          <Button
            variant="ghost"
            size="icon"
            className="mx-auto mt-3 size-8"
            aria-label="Expand sidebar"
            onClick={() => setCollapsed(false)}
          >
            <PanelLeftOpen aria-hidden="true" className="size-4.5" />
          </Button>
        ) : null}

        <div className="flex-1 overflow-y-auto py-4">
          <AdminSidebarNav collapsed={collapsed} />
        </div>

        {!collapsed ? (
          <div className="border-t border-border p-4">
            <p className="text-xs text-muted-foreground">
              Learnova Admin Panel — phase 1 foundation.
            </p>
          </div>
        ) : null}
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="gap-0 p-0">
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <SheetDescription className="sr-only">Jump to an admin page.</SheetDescription>
            <span className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                Admin
              </span>
            </span>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <AdminSidebarNav onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader session={session} onLogout={onLogout} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main id="admin-main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
