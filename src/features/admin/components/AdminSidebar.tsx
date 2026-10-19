import { NavLink } from 'react-router-dom'

import { ADMIN_NAV_ITEMS } from '@/features/admin/constants'
import { cn } from '@/common/lib/utils'

export interface AdminSidebarNavProps {
  /** Collapse to an icon-only rail (desktop). */
  collapsed?: boolean
  /** Called after a link is clicked (used to close the mobile drawer). */
  onNavigate?: () => void
}

/** The navigation list itself, shared by the desktop sidebar and the mobile drawer. */
export function AdminSidebarNav({ collapsed = false, onNavigate }: AdminSidebarNavProps) {
  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-1.5 px-3">
      {ADMIN_NAV_ITEMS.map(({ label, to, end, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ring',
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-y-2 left-0 w-1 rounded-full bg-primary',
                    collapsed && 'inset-y-1',
                  )}
                />
              ) : null}
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              {!collapsed ? <span className="truncate">{label}</span> : <span className="sr-only">{label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
