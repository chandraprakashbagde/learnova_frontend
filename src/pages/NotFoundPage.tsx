import { Compass, GraduationCap, Presentation } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/common/ui/button'

export default function NotFoundPage() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -left-20 top-0 size-72 rounded-full bg-primary/10 blur-3xl" />
        <span className="absolute -right-16 bottom-10 size-72 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute inset-0 bg-dots opacity-50" />
      </div>

      <div
        role="main"
        className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-32 text-center sm:px-6"
      >
        <p
          className="text-gradient text-7xl font-extrabold tracking-tight sm:text-8xl"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground" aria-live="polite">
          The page you are looking for doesn't exist or may have moved. Let's get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/">
              <GraduationCap aria-hidden="true" className="size-4" />
              Go to Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/courses">
              <Compass aria-hidden="true" className="size-4" />
              Explore Courses
            </Link>
          </Button>
        </div>

        <nav aria-label="Quick links" className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link to="/for-students" className="font-semibold text-primary underline-offset-4 hover:underline">
            For Students
          </Link>
          <Link to="/for-teachers" className="font-semibold text-secondary underline-offset-4 hover:underline">
            <Presentation aria-hidden="true" className="mr-1 inline size-4" />
            For Teachers
          </Link>
          <Link to="/about" className="font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            About Us
          </Link>
        </nav>
      </div>
    </section>
  )
}