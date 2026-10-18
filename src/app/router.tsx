import { FileText, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { createBrowserRouter } from 'react-router-dom'

import MainLayout from '@/app/layouts/MainLayout'
import ExploreCoursesPage from '@/pages/ExploreCoursesPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
import PlaceholderPage, { type PlaceholderPageProps } from '@/pages/PlaceholderPage'
import RegisterPage from '@/pages/RegisterPage'
import StudentPage from '@/pages/StudentPage'
import TeacherPage from '@/pages/TeacherPage'

/**
 * Routes that are linked from the navbar/footer but whose full designs
 * land in a later milestone. They render an honest placeholder page.
 */
const placeholderRoutes: { path: string; props: PlaceholderPageProps }[] = [
  {
    path: '/about',
    props: {
      icon: Sparkles,
      eyebrow: 'About us',
      title: 'Learnova is being built',
      description:
        'Learnova is an online tuition platform with one goal: connect passionate teachers with curious learners. Our full story page is on the way.',
      primaryAction: { label: 'Explore Courses', to: '/courses' },
      secondaryAction: { label: 'Back to Home', to: '/' },
    },
  },
  {
    path: '/contact',
    props: {
      icon: Mail,
      eyebrow: 'Contact',
      title: 'Get in touch',
      description:
        'Our contact page is under construction. Until then, you can keep exploring the platform and its two journeys.',
      primaryAction: { label: 'Back to Home', to: '/' },
    },
  },
  {
    path: '/privacy',
    props: {
      icon: ShieldCheck,
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      description:
        'This placeholder marks the future location of the Learnova Privacy Policy. No data is collected on this landing page.',
      primaryAction: { label: 'Back to Home', to: '/' },
    },
  },
  {
    path: '/terms',
    props: {
      icon: FileText,
      eyebrow: 'Legal',
      title: 'Terms of Service',
      description:
        'This placeholder marks the future location of the Learnova Terms of Service.',
      primaryAction: { label: 'Back to Home', to: '/' },
    },
  },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'student', element: <StudentPage /> },
      { path: 'teacher', element: <TeacherPage /> },
      { path: 'courses', element: <ExploreCoursesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <RegisterPage /> },
      { path: 'register', element: <RegisterPage /> },
      ...placeholderRoutes.map(({ path, props }) => ({
        path: path.slice(1),
        element: <PlaceholderPage {...props} />,
      })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])