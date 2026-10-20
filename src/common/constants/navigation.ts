/**
 * Central place for navigation data and branding.
 * Change `BRAND_NAME` here to rebrand the whole app.
 */
export const BRAND_NAME = 'Learnova'
export const BRAND_TAGLINE = 'Online tuition that fits your goals.'

export interface NavLinkItem {
  label: string
  to: string
  /** Match the route exactly (used for the `/` home link). */
  end?: boolean
}

/** Primary links shown in the navbar and mobile sheet. */
export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Home', to: '/', end: true },
  { label: 'Explore Courses', to: '/courses' },
  { label: 'For Students', to: '/for-students' },
  { label: 'For Teachers', to: '/for-teachers' },
  { label: 'About Us', to: '/about' },
]

/** Account-related actions on the right side of the navbar. */
export const AUTH_LINKS = {
  login: '/login',
  getStarted: '/signup',
} as const

export interface FooterColumn {
  title: string
  links: NavLinkItem[]
}

/** Footer link columns. All destinations are valid internal routes. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Explore',
    links: [
      { label: 'All Courses', to: '/courses' },
      { label: 'For Students', to: '/for-students' },
      { label: 'For Teachers', to: '/for-teachers' },
      { label: 'About Us', to: '/about' },
    ],
  },
  {
    title: 'Student Resources',
    links: [
      { label: 'Start Learning', to: '/for-students' },
      { label: 'Explore Categories', to: '/courses' },
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'Student Login', to: '/login' },
    ],
  },
  {
    title: 'Teacher Resources',
    links: [
      { label: 'Start Teaching', to: '/for-teachers' },
      { label: 'Create an Account', to: '/signup' },
      { label: 'Teaching Guidelines', to: '/about' },
      { label: 'Teacher Login', to: '/login' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
]