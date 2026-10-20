import { BookOpen, Compass, GraduationCap, Palette, PlayCircle, Presentation, Rocket, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SectionHeading } from '@/common/components/SectionHeading'
import { StepCard, type StepTone } from '@/common/components/StepCard'
import { Button } from '@/common/ui/button'
import { cn } from '@/common/lib/utils'

interface Step {
  title: string
  description: string
  icon: LucideIcon
}

const STUDENT_STEPS: Step[] = [
  {
    title: 'Discover a course',
    description: 'Browse categories and find the subject that matches your goals.',
    icon: Compass,
  },
  {
    title: 'Explore course details',
    description: 'Review the curriculum, outcomes, and what you will learn.',
    icon: BookOpen,
  },
  {
    title: 'Enroll and learn',
    description: 'Join the course and start learning at your own pace.',
    icon: PlayCircle,
  },
]

const TEACHER_STEPS: Step[] = [
  {
    title: 'Create your account',
    description: 'Set up your teacher profile in just a few simple steps.',
    icon: UserPlus,
  },
  {
    title: 'Build your course',
    description: 'Organize lessons, resources, and materials into a clear path.',
    icon: Palette,
  },
  {
    title: 'Publish and teach',
    description: 'Go live and start inspiring students from around the world.',
    icon: Rocket,
  },
]

interface JourneyCardProps {
  tone: StepTone
  icon: LucideIcon
  title: string
  subtitle: string
  ctaLabel: string
  to: string
  steps: Step[]
}

function JourneyCard({ tone, icon: Icon, title, subtitle, ctaLabel, to, steps }: JourneyCardProps) {
  const isStudent = tone === 'student'

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-3xl border bg-card p-7 shadow-sm transition-shadow duration-300 sm:p-8',
        isStudent ? 'border-primary/15 hover:shadow-lg hover:shadow-primary/10' : 'border-secondary/15 hover:shadow-lg hover:shadow-secondary/10',
      )}
    >
      <div className="mb-7 flex items-center gap-4">
        <span
          aria-hidden="true"
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-2xl shadow-md',
            isStudent ? 'bg-primary text-primary-foreground shadow-primary/25' : 'bg-secondary text-secondary-foreground shadow-secondary/25',
          )}
        >
          <Icon className="size-6" strokeWidth={2} />
        </span>
        <div className="flex flex-col">
          <h3 className="text-xl font-extrabold tracking-tight text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <StepCard
            key={step.title}
            step={index + 1}
            tone={tone}
            icon={step.icon}
            title={step.title}
            description={step.description}
          />
        ))}
      </ol>

      <div className="mt-auto pt-6">
        <Button asChild variant={isStudent ? 'default' : 'secondary'} className="w-full sm:w-auto">
          <Link to={to}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  )
}

export function HowItWorksSection() {
  return (
    <section aria-labelledby="how-it-works-heading" id="how-it-works" className="relative overflow-hidden py-20 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-muted/60" />
        <div className="absolute inset-0 bg-dots opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="how-it-works-heading">
          <SectionHeading
            eyebrow="How it works"
            heading="Two Paths. One Platform."
            description="Whether you are here to learn or to teach, getting started takes only a few simple steps."
            gradientFrom={11}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <JourneyCard
            tone="student"
            icon={GraduationCap}
            title="For Students"
            subtitle="From discovery to mastery"
            ctaLabel="Explore Courses"
            to="/courses"
            steps={STUDENT_STEPS}
          />
          <JourneyCard
            tone="teacher"
            icon={Presentation}
            title="For Teachers"
            subtitle="From idea to classroom"
            ctaLabel="Start Teaching"
            to="/for-teachers"
            steps={TEACHER_STEPS}
          />
        </div>
      </div>
    </section>
  )
}