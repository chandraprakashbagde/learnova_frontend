import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, LogOut, Menu, Search, Settings, ShieldCheck } from 'lucide-react'

import { Button } from '@/common/ui/button'
import { Input } from '@/common/ui/input'
import { ADMIN_NAV_ITEMS } from '@/features/admin/constants'
import type { AdminSessionUser } from '@/features/admin/types'
import { cn } from '@/common/lib/utils'

/** Resolves the page title and breadcrumb trail for the current admin route. */
function usePageMeta(): { title: string; breadcrumbs: { label: string; to?: string }[] } {
  const { pathname } = useLocation()

  if (/^\/admin\/teachers\/[^/]+$/.test(pathname)) {
    return {
      title: 'Teacher Details',
      breadcrumbs: [
        { label: 'Admin', to: '/admin' },
        { label: 'Teachers', to: '/admin/teachers' },
        { label: 'Details' },
      ],
    }
  }

  // Longest matching nav prefix wins, so /admin/teachers matches "Teachers".
  const match = ADMIN_NAV_ITEMS.filter(
    ({ to }) => to !== '/admin' && pathname.startsWith(to),
  ).sort((a, b) => b.to.length - a.to.length)[0]

  if (match) {
    return {
      title: match.label,
      breadcrumbs: [{ label: 'Admin', to: '/admin' }, { label: match.label }],
    }
  }

  const overview = ADMIN_NAV_ITEMS[0]
  return { title: overview.label, breadcrumbs: [{ label: overview.label, to: overview.to }] }
}

export interface AdminHeaderProps {
  session: AdminSessionUser
  onLogout: () => void
  /** Opens the mobile navigation drawer. */
  onOpenMobileNav: () => void
}

export function AdminHeader({ session, onLogout, onOpenMobileNav }: AdminHeaderProps) {
  const navigate = useNavigate()
  const { title, breadcrumbs } = usePageMeta()

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close the profile menu on outside click or Escape.
  useEffect(() => {
    if (!profileOpen) return

    const onPointerDown = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [profileOpen])

  const handleLogout = () => {
    setProfileOpen(false)
    onLogout()
    navigate('/login', { replace: true })
  }

  const initials = session.email.slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          aria-label="Open navigation menu"
          onClick={onOpenMobileNav}
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>

        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">{title}</h1>
          <nav aria-label="Breadcrumb" className="hidden sm:block">
            <ol className="flex items-center gap-1 text-xs text-muted-foreground">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <li key={crumb.label} className="flex items-center gap-1">
                    {index > 0 ? <ChevronRight aria-hidden="true" className="size-3" /> : null}
                    {isLast || !crumb.to ? (
                      <span aria-current="page" className="font-medium text-foreground">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link to={crumb.to} className="transition-colors hover:text-foreground">
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Search — UI only until the admin search API lands. */}
          <div className="relative hidden md:block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Search teachers, students…"
              aria-label="Search the admin panel"
              className="h-10 w-56 rounded-full pl-9 text-sm lg:w-72"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative shrink-0"
            aria-label="Notifications (3 unread)"
          >
            <Bell aria-hidden="true" className="size-5" />
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card"
            />
          </Button>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
              className="flex cursor-pointer items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span
                aria-hidden="true"
                className="gradient-cta grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-primary-foreground"
              >
                {initials}
              </span>
              <span className="hidden flex-col items-start leading-tight sm:flex">
                <span className="max-w-[10rem] truncate text-sm font-semibold text-foreground">
                  {session.email.split('@')[0]}
                </span>
                <span className="text-xs text-muted-foreground">{session.role}</span>
              </span>
            </button>

            {profileOpen ? (
              <div
                role="menu"
                aria-label="Admin account"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-60 rounded-2xl border border-border bg-card p-1.5 shadow-lg"
              >
                <div className="flex flex-col gap-0.5 px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-foreground">{session.email}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck aria-hidden="true" className="size-3.5 text-primary" />
                    {session.role} account
                  </p>
                </div>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false)
                    navigate('/admin/settings')
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Settings aria-hidden="true" className="size-4 text-muted-foreground" />
                  Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    'text-destructive hover:bg-destructive/10',
                  )}
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
