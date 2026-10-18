import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CategoryCard } from '@/common/components/CategoryCard'
import { SectionHeading } from '@/common/components/SectionHeading'
import { LEARNING_CATEGORIES } from '@/common/constants/categories'
import { Button } from '@/common/ui/button'

export function CategoriesSection() {
  return (
    <section aria-labelledby="categories-heading" id="categories" className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="categories-heading">
          <SectionHeading
            eyebrow="Sample categories"
            heading="Featured Learning Categories"
            description="Explore a sample of the subjects you can learn and teach on Learnova. Full course listings are coming soon."
            gradientFrom={18}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-12 flex justify-center">
          <Button asChild variant="gradient" size="lg">
            <Link to="/courses">
              Explore All Courses
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}