import { ArrowRight, Lightbulb, Presentation, Users, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'

import { FeatureCard } from '@/common/components/FeatureCard'
import { SectionHeading } from '@/common/components/SectionHeading'
import { Badge } from '@/common/ui/badge'
import { Button } from '@/common/ui/button'

const TEACHER_HIGHLIGHTS = [
  {
    icon: Lightbulb,
    title: 'Build a Course',
    description: 'Turn your expertise into structured lessons with an intuitive course builder.',
  },
  {
    icon: Presentation,
    title: 'Teach Your Way',
    description: 'Share knowledge through content and formats that match your style.',
  },
  {
    icon: Workflow,
    title: 'Publish in Steps',
    description: 'Draft, review, and publish — a clear path from idea to classroom.',
  },
  {
    icon: Users,
    title: 'Reach Learners',
    description: 'Connect with students who are ready to learn what you love teaching.',
  },
]

export default function TeacherPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span className="absolute -right-24 -top-16 size-80 rounded-full bg-secondary/15 blur-3xl" />
          <span className="absolute left-10 top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-dots opacity-50" />
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-16 pt-32 text-center sm:px-6 lg:pt-40">
          <Badge variant="secondary">Teacher journey</Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Teach, inspire, and <span className="text-gradient">make an impact.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            This is where your teacher dashboard will live — course creation, publishing tools, and student
            insights. For now, see how you will get started.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link to="/signup">
                Start Teaching
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            level="h2"
            heading="From idea to classroom"
            description="A preview of the teaching experience we are building."
            className="mb-10"
            gradientFrom={13}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            {TEACHER_HIGHLIGHTS.map((item) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} description={item.description} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}