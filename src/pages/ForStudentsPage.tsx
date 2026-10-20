import { ArrowRight, BookOpen, GraduationCap, Target, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SectionHeading } from '@/common/components/SectionHeading'
import { FeatureCard } from '@/common/components/FeatureCard'
import { Badge } from '@/common/ui/badge'
import { Button } from '@/common/ui/button'

const STUDENT_HIGHLIGHTS = [
  {
    icon: BookOpen,
    title: 'Explore Courses',
    description: 'Browse sample categories and find the subjects that fit your goals.',
  },
  {
    icon: Timer,
    title: 'Learn Anytime',
    description: 'Study at your own pace with resources available when you need them.',
  },
  {
    icon: Target,
    title: 'Stay on Track',
    description: 'Follow structured lessons and monitor your learning journey.',
  },
]

export default function ForStudentsPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span className="absolute -left-24 -top-16 size-80 rounded-full bg-primary/15 blur-3xl" />
          <span className="absolute right-10 top-10 size-64 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute inset-0 bg-dots opacity-50" />
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-16 pt-32 text-center sm:px-6 lg:pt-40">
          <Badge variant="soft">Student journey</Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Learning that moves <span className="text-gradient">at your pace.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            This is where your student dashboard will live — with enrolled courses, progress tracking, and
            personalised recommendations. For now, browse what the platform will offer.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/courses">
                Explore Courses
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <GraduationCap aria-hidden="true" className="size-6 text-primary" />
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">What you will get</h2>
          </div>

          <SectionHeading
            level="h2"
            heading="Everything for your learning goals"
            description="A preview of the student experience we are building."
            className="mt-6 mb-10"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STUDENT_HIGHLIGHTS.map((item) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}