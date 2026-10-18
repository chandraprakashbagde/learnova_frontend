import { LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { AuthNotice, AuthShell } from '@/common/components/AuthShell'
import { PasswordField, TextField } from '@/common/components/FormTextField'
import { Button } from '@/common/ui/button'

interface LoginForm {
  email: string
  password: string
}

type LoginFormErrors = Partial<Record<keyof LoginForm, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form: LoginForm): LoginFormErrors {
  const errors: LoginFormErrors = {}
  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (!form.password) {
    errors.password = 'Password is required.'
  }
  return errors
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const update = (key: keyof LoginForm) => (value: string) => {
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
      icon={LogIn}
      eyebrow="Welcome back"
      title="Log in to Learnova"
      description="Pick up where you left off — your courses, lessons, and progress are waiting."
      footer={
        <>
          New to Learnova?{' '}
          <Link to="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
            <input type="checkbox" name="remember" className="size-4 rounded-sm border-input accent-[#4F46E5]" />
            Remember me
          </label>
          <Link to="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="mt-1 w-full">
          Log In
          <LogIn aria-hidden="true" className="size-4" />
        </Button>

        {submitted ? (
          <AuthNotice>
            You're signed in (demo only). No backend is connected yet, so no credentials were stored or sent anywhere.
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