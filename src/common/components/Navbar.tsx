import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { Logo } from '@/common/components/Logo'
import { AUTH_LINKS, BRAND_NAME, NAV_LINKS } from '@/common/constants/navigation'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/common/ui/sheet'

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])


  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border bg-card/90 shadow-sm backdrop-blur-md'
          : 'border-b border-transparent bg-card/60 backdrop-blur-sm',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link to="/" aria-label={`${BRAND_NAME} home`} className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
          <Logo />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClassName}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost">
            <Link to={AUTH_LINKS.login}>Login</Link>
          </Button>
          <Button asChild variant="gradient">
            <Link to={AUTH_LINKS.getStarted}>Get Started</Link>
          </Button>
        </div>

        {/* Mobile navigation */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation menu">
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="gap-0 p-0">
            <SheetHeader className="border-b border-border pb-4">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <SheetDescription className="sr-only">Jump to a page on Learnova.</SheetDescription>
              <Logo size="sm" />
            </SheetHeader>

            <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent/60',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 border-t border-border px-6 py-6">
              <SheetClose asChild>
                <Button asChild variant="outline" className="w-full">
                  <Link to={AUTH_LINKS.login}>Login</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="gradient" className="w-full">
                  <Link to={AUTH_LINKS.getStarted}>Get Started</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}