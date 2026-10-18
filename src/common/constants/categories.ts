import { Code2, FlaskConical, MessagesSquare, School, Sigma, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import categoryEnglishAvif from '@/assets/images/category-english.avif'
import categoryEnglishJpg from '@/assets/images/category-english.jpg'
import categoryExamsAvif from '@/assets/images/category-exams.avif'
import categoryExamsJpg from '@/assets/images/category-exams.jpg'
import categoryMathematicsAvif from '@/assets/images/category-mathematics.avif'
import categoryMathematicsJpg from '@/assets/images/category-mathematics.jpg'
import categoryProgrammingAvif from '@/assets/images/category-programming.avif'
import categoryProgrammingJpg from '@/assets/images/category-programming.jpg'
import categorySchoolAvif from '@/assets/images/category-school.avif'
import categorySchoolJpg from '@/assets/images/category-school.jpg'
import categoryScienceAvif from '@/assets/images/category-science.avif'
import categoryScienceJpg from '@/assets/images/category-science.jpg'
import type { CategoryTone } from '@/common/components/CategoryCard'

export interface CategoryImage {
  src: string
  avifSrc: string
  alt: string
}

export interface LearningCategory {
  title: string
  description: string
  meta: string
  tone: CategoryTone
  icon: LucideIcon
  image: CategoryImage
}

/**
 * Sample learning categories shown on the homepage and the courses page.
 * Images are local, optimized assets (AVIF + JPEG fallback).
 */
export const LEARNING_CATEGORIES: LearningCategory[] = [
  {
    title: 'School Education',
    description: 'Build strong foundations across core school subjects.',
    meta: 'Sample category',
    tone: 'indigo',
    icon: School,
    image: {
      src: categorySchoolJpg,
      avifSrc: categorySchoolAvif,
      alt: 'A classroom with desks arranged for a school lesson',
    },
  },
  {
    title: 'Mathematics',
    description: 'From fundamentals to advanced problem solving.',
    meta: 'Sample category',
    tone: 'violet',
    icon: Sigma,
    image: {
      src: categoryMathematicsJpg,
      avifSrc: categoryMathematicsAvif,
      alt: 'Mathematical equations written across a blackboard',
    },
  },
  {
    title: 'Science',
    description: 'Physics, chemistry, and biology made approachable.',
    meta: 'Sample category',
    tone: 'cyan',
    icon: FlaskConical,
    image: {
      src: categoryScienceJpg,
      avifSrc: categoryScienceAvif,
      alt: 'Laboratory glassware set up for a science experiment',
    },
  },
  {
    title: 'Programming',
    description: 'Learn to code with guided, project-based tracks.',
    meta: 'Sample category',
    tone: 'emerald',
    icon: Code2,
    image: {
      src: categoryProgrammingJpg,
      avifSrc: categoryProgrammingAvif,
      alt: 'Source code open in an editor on a laptop screen',
    },
  },
  {
    title: 'Competitive Exams',
    description: 'Focused preparation with structured practice.',
    meta: 'Sample category',
    tone: 'amber',
    icon: Target,
    image: {
      src: categoryExamsJpg,
      avifSrc: categoryExamsAvif,
      alt: 'An open notebook and study notes used for exam preparation',
    },
  },
  {
    title: 'English and Communication',
    description: 'Speak, write, and present with confidence.',
    meta: 'Sample category',
    tone: 'rose',
    icon: MessagesSquare,
    image: {
      src: categoryEnglishJpg,
      avifSrc: categoryEnglishAvif,
      alt: 'Stacked open books for reading and language learning',
    },
  },
]