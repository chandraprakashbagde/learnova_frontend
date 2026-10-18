import { Link } from 'react-router-dom'

import { Logo } from '@/common/components/Logo'
import { BRAND_TAGLINE, BRAND_NAME, FOOTER_COLUMNS } from '@/common/constants/navigation'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link to="/" aria-label={`${BRAND_NAME} home`} className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
              <Logo />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{BRAND_TAGLINE}</p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={`${column.title} links`} className="flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{column.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}-${link.to}`}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {year} {BRAND_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/80">
            Built for learners. Powered by passionate teachers.
          </p>
        </div>
      </div>
    </footer>
  )
}