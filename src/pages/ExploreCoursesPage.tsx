import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CategoryCard } from '@/common/components/CategoryCard'
import { SectionHeading } from '@/common/components/SectionHeading'
import { LEARNING_CATEGORIES } from '@/common/constants/categories'
import { Badge } from '@/common/ui/badge'
import { Button } from '@/common/ui/button'

export default function ExploreCoursesPage() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -left-24 -top-16 size-80 rounded-full bg-primary/10 blur-3xl" />
        <span className="absolute -right-16 top-40 size-72 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute inset-0 bg-dots opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-40">
        <div className="flex flex-col gap-6">
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link to="/">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to Home
            </Link>
          </Button>

          <SectionHeading
            align="left"
            level="h1"
            eyebrow="Explore courses"
            heading="Find your next subject"
            description="Browse a sample of the categories coming to Learnova. Course listings are not live yet — these are example categories to preview the experience."
            gradientFrom={15}
            className="mb-4"
          />

          <Badge variant="highlight" className="w-fit">
            Sample categories — full listings coming soon
          </Badge>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              description={category.description}
              meta={category.meta}
              tone={category.tone}
              icon={category.icon}
              image={category.image}
            />
          ))}
        </div>
      </div>
    </section>
  )
}