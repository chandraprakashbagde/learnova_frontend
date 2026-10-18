import { CalendarClock, ListChecks, Route, Users } from 'lucide-react'

import { FeatureCard } from '@/common/components/FeatureCard'
import { SectionHeading } from '@/common/components/SectionHeading'

const BENEFITS = [
  {
    icon: Users,
    title: 'Expert Teachers',
    description: 'Learn from experienced educators who bring clarity and confidence to every lesson.',
  },
  {
    icon: CalendarClock,
    title: 'Flexible Learning',
    description: 'Access learning resources at your convenience and study on a schedule that works for you.',
  },
  {
    icon: Route,
    title: 'Structured Courses',
    description: 'Follow organized lessons and learning paths that build skills step by step.',
  },
  {
    icon: ListChecks,
    title: 'Track Your Progress',
    description: 'Stay motivated and monitor your learning journey from first lesson to final goal.',
  },
]

export function BenefitsSection() {
  return (
    <section aria-labelledby="benefits-heading" className="relative py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="benefits-heading">
          <SectionHeading
            eyebrow="Why Learnova"
            heading="Everything You Need to Learn and Grow"
            description="A complete learning experience designed to keep students focused, motivated, and moving forward."
            gradientFrom={23}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, index) => (
            <FeatureCard
              key={benefit.title}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}