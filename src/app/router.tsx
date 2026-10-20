import { FileText, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { createBrowserRouter } from 'react-router-dom'

import MainLayout from '@/app/layouts/MainLayout'
import ExploreCoursesPage from '@/pages/ExploreCoursesPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import NotFoundPage from '@/pages/NotFoundPage'
import PlaceholderPage, { type PlaceholderPageProps } from '@/pages/PlaceholderPage'
import RegisterPage from '@/pages/RegisterPage'
import ForStudentsPage from '@/pages/ForStudentsPage'
import ForTeachersPage from '@/pages/ForTeachersPage'
import StudentDashboardPage from '@/pages/StudentDashboardPage'
import TeacherDashboardPage from '@/pages/TeacherDashboardPage'

import AdminGuard from '@/features/admin/components/AdminGuard'
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage'
import AdminSettingsPage from '@/features/admin/pages/AdminSettingsPage'
import QualificationsPage from '@/features/admin/pages/QualificationsPage'
import StudentsPage from '@/features/admin/pages/StudentsPage'
import SubjectsPage from '@/features/admin/pages/SubjectsPage'
import TeacherDetailsPage from '@/features/admin/pages/TeacherDetailsPage'
import TeachersPage from '@/features/admin/pages/TeachersPage'
import VerificationQueuePage from '@/features/admin/pages/VerificationQueuePage'

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
      /*
       * Public marketing pages. The role-scoped dashboards live at
       * /student and /teacher (see the guarded routes below), so the
       * informational "journey" pages moved here.
       */
      { path: 'for-students', element: <ForStudentsPage /> },
      { path: 'for-teachers', element: <ForTeachersPage /> },
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
  {
    /*
     * Teacher dashboard — guarded by the reusable RoleGuard, which verifies
     * the bearer token via GET /auth/role and requires the Teacher role.
     */
    path: '/teacher',
    element: <TeacherDashboardPage />,
  },
  {
    /*
     * Student dashboard — guarded by the reusable RoleGuard, which verifies
     * the bearer token via GET /auth/role and requires the Student role.
     */
    path: '/student',
    element: <StudentDashboardPage />,
  },
  {
    /*
     * Admin panel — guarded by AdminGuard (a thin wrapper over RoleGuard),
     * which requires the Admin role before rendering the AdminLayout shell
     * (the layout hosts the <Outlet/> for these children).
     */
    path: '/admin',
    element: <AdminGuard />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'teachers', element: <TeachersPage /> },
      { path: 'teachers/:teacherId', element: <TeacherDetailsPage /> },
      { path: 'verification-queue', element: <VerificationQueuePage /> },
      { path: 'students', element: <StudentsPage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'qualifications', element: <QualificationsPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])