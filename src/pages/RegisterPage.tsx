import { UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { AuthNotice, AuthShell } from '@/common/components/AuthShell'
import { PasswordField, TextField } from '@/common/components/FormTextField'
import { Button } from '@/common/ui/button'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

type RegisterFormErrors = Partial<Record<keyof RegisterForm, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

function validate(form: RegisterForm): RegisterFormErrors {
  const errors: RegisterFormErrors = {}

  if (!form.firstName.trim()) errors.firstName = 'First name is required.'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.'

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!form.password) {
    errors.password = 'Password is required.'
  } else if (form.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const update = (key: keyof RegisterForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    setSubmitted(Object.keys(nextErrors).length === 0)
  }

  return (
    <AuthShell
      icon={UserPlus}
      eyebrow="Join Learnova"
      title="Create your account"
      description="One quick form and you're in — start learning or start teaching, your choice."
      asideHeading="Your learning journey starts with a single step."
      asideBullets={[
        'Free to join as a student or a teacher',
        'First name, last name, email, and a secure password',
        'Switch your journey later — learn today, teach tomorrow',
      ]}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="firstName"
            label="First name"
            placeholder="Ada"
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={update('firstName')}
            error={errors.firstName}
          />
          <TextField
            name="lastName"
            label="Last name"
            placeholder="Lovelace"
            autoComplete="family-name"
            required
            value={form.lastName}
            onChange={update('lastName')}
            error={errors.lastName}
          />
        </div>

        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />

        <PasswordField
          name="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />

        <PasswordField
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          error={errors.confirmPassword}
        />

        <Button type="submit" size="lg" variant="gradient" className="mt-1 w-full">
          Create Account
          <UserPlus aria-hidden="true" className="size-4" />
        </Button>

        {submitted ? (
          <AuthNotice>
            Account details validated successfully (demo only). No backend is connected yet, so nothing was stored or
            sent anywhere.
          </AuthNotice>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Demo form — submissions stay in your browser until a backend is connected.
          </p>
        )}
      </form>
    </AuthShell>
  )
}