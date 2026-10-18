import { GraduationCap, Presentation, Sparkles, Timer, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import heroStudentsAvif from '@/assets/images/hero-students.avif'
import heroStudentsJpg from '@/assets/images/hero-students.jpg'
import studentCardAvif from '@/assets/images/student-card.avif'
import studentCardJpg from '@/assets/images/student-card.jpg'
import teacherCardAvif from '@/assets/images/teacher-card.avif'
import teacherCardJpg from '@/assets/images/teacher-card.jpg'
import { RoleCard } from '@/common/components/RoleCard'
import { SmartImage } from '@/common/components/SmartImage'
import { cn } from '@/common/lib/utils'

const HERO_ROLES = [
  {
    role: 'student' as const,
    eyebrow: 'For learners',
    title: 'I am a Student',
    description: 'Discover courses, learn from expert teachers, and achieve your goals.',
    icon: GraduationCap,
    ctaLabel: 'Explore Courses',
    to: '/courses',
    image: {
      src: studentCardJpg,
      avifSrc: studentCardAvif,
      alt: 'Students studying together with notebooks and a laptop',
    },
  },
  {
    role: 'teacher' as const,
    eyebrow: 'For educators',
    title: 'I am a Teacher',
    description: 'Share your knowledge, create courses, and inspire the next generation.',
    icon: Presentation,
    ctaLabel: 'Start Teaching',
    to: '/teacher',
    image: {
      src: teacherCardJpg,
      avifSrc: teacherCardAvif,
      alt: 'A teacher leading a lesson for students in a classroom',
    },
  },
]

export function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -left-32 -top-24 size-96 rounded-full bg-primary/15 blur-3xl" />
        <span className="absolute -right-24 top-10 size-80 rounded-full bg-secondary/15 blur-3xl" />
        <span className="absolute right-1/3 bottom-0 size-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-full bg-dots opacity-60" />
        <span className="absolute left-1/12 top-1/3 hidden size-3 rotate-12 rounded-sm bg-highlight/70 lg:block" />
        <span className="absolute right-1/10 top-1/4 hidden size-2.5 rounded-full bg-brand-accent/70 lg:block" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-36">
        {/* Two-column hero: copy + image (stacked on mobile) */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-card px-4 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm">
              <Sparkles aria-hidden="true" className="size-3.5 text-highlight" />
              Premium online tuition for students and teachers
            </span>

            <h1
              id="hero-heading"
              className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl"
            >
              Your Learning Journey <span className="text-gradient">Starts Here.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Discover expert teachers, explore engaging courses, and learn at your own pace. Whether you're here to
              learn or teach, your next opportunity starts with us.
            </p>

            {/* Quick journey links */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm lg:justify-start">
              <Link
                to="/student"
                className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
              >
                I'm here to learn →
              </Link>
              <Link
                to="/teacher"
                className="font-semibold text-secondary underline-offset-4 transition-colors hover:underline"
              >
                I'm here to teach →
              </Link>
            </div>
          </div>

          {/* Hero image with gradient frame and floating chips */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <span
              aria-hidden="true"
              className="absolute -right-6 -top-6 -z-10 size-28 rounded-full bg-highlight/30 blur-2xl"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-6 -left-6 -z-10 size-32 rounded-full bg-brand-accent/30 blur-2xl"
            />
            <div className="rounded-[1.75rem] bg-gradient-to-br from-primary via-secondary to-cyan-400 p-1.5 shadow-2xl shadow-primary/25">
              <div className="overflow-hidden rounded-[1.35rem] bg-card">
                <SmartImage
                  src={heroStudentsJpg}
                  sources={[{ type: 'image/avif', src: heroStudentsAvif }]}
                  alt="Students learning together on laptops during an online study session"
                  aspectClassName="aspect-[16/10] lg:aspect-[4/3]"
                  className="rounded-none"
                  eager
                />
              </div>
            </div>

            {/* Floating info chips */}
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm sm:left-5 sm:top-5">
              <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-accent text-primary">
                <Users className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-foreground">Expert teachers</span>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm sm:bottom-5 sm:right-5">
              <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-accent text-primary">
                <Timer className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-foreground">Learn at your pace</span>
            </div>
          </div>
        </div>

        {/* Two journeys — both clearly visible */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:gap-6">
          {HERO_ROLES.map((item) => (
            <RoleCard
              key={item.role}
              role={item.role}
              eyebrow={item.eyebrow}
              title={item.title}
              description={item.description}
              icon={item.icon}
              ctaLabel={item.ctaLabel}
              to={item.to}
              image={item.image}
            />
          ))}
        </div>

        {/* Trust indicator */}
        <p
          className={cn(
            'mt-8 text-center text-sm font-medium text-muted-foreground',
            'inline-flex w-full items-center justify-center gap-2 rounded-full',
          )}
        >
          <span aria-hidden="true" className="h-px w-8 bg-border" />
          Built for learners. Powered by passionate teachers.
          <span aria-hidden="true" className="h-px w-8 bg-border" />
        </p>
      </div>
    </section>
  )
}