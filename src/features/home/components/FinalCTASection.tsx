import { ArrowRight, Presentation } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/common/ui/button'

export function FinalCTASection() {
  return (
    <section aria-labelledby="final-cta-heading" className="pb-20 pt-4 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] gradient-cta px-6 py-16 shadow-2xl shadow-secondary/25 sm:px-12 lg:py-20">
          {/* Decorative shapes */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <span className="absolute -left-16 -top-16 size-64 rounded-full bg-white/15 blur-2xl" />
            <span className="absolute -bottom-20 -right-10 size-72 rounded-full bg-cyan-300/30 blur-3xl" />
            <span className="absolute right-1/4 top-6 size-24 rounded-full border border-white/25" />
            <span className="absolute bottom-10 left-1/4 size-14 rotate-12 rounded-xl border border-white/25" />
          </div>

          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Presentation aria-hidden="true" className="size-9 text-white/85" />
            <h2
              id="final-cta-heading"
              className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Your Next Chapter Starts Today.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Join a learning community where students grow and teachers make a difference.
            </p>

            <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-white text-primary shadow-lg shadow-black/15 hover:bg-white/90 sm:w-auto"
              >
                <Link to="/student">
                  Start Learning
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Link to="/teacher">Become a Teacher</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}