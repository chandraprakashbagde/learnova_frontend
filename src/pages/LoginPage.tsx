import { Loader2, LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { getRole, login } from '@/common/api/auth.api'
import { isApiError } from '@/common/api/http'
import { AuthNotice, AuthShell } from '@/common/components/AuthShell'
import { PasswordField, TextField } from '@/common/components/FormTextField'
import { Button } from '@/common/ui/button'
import { parseRoleResponse, postLoginRedirectTarget } from '@/common/auth/roles'

interface LoginForm {
  email: string
  password: string
}

type LoginFormErrors = Partial<Record<keyof LoginForm, string>>

/** Flash message set by RegisterPage; `from` set by route guards. */
interface LoginLocationState {
  notice?: string
  /** Internal path to return to after a successful login (e.g. /admin). */
  from?: string
}

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
  const navigate = useNavigate()
  const location = useLocation()
  const { notice: registrationNotice, from } = (location.state as LoginLocationState | null) ?? {}

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const update = (key: keyof LoginForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setFormError(null)

    try {
      // Persists the access token in localStorage; the refresh_token cookie
      // is stored by the browser automatically.
      await login(form.email.trim(), form.password)

      // Fetch the role so we can route to the correct dashboard. Falls back
      // to the requested path (or home) if the role request fails — a failed
      // role fetch must never grant access to a protected route.
      let target: string
      try {
        const { data } = await getRole()
        const role = parseRoleResponse(data)
        target = postLoginRedirectTarget(role, from)
      } catch {
        target = from && from.startsWith('/') && !from.startsWith('//') ? from : '/'
      }

      navigate(target, { replace: true })
    } catch (error) {
      if (isApiError(error)) setFormError(error.message)
      else setFormError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
        {registrationNotice ? <AuthNotice>{registrationNotice}</AuthNotice> : null}

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

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
          {submitting ? (
            <>
              Logging in…
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            </>
          ) : (
            <>
              Log In
              <LogIn aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>

        {formError ? (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            {formError}
          </p>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            By logging in you agree to our Terms and Privacy Policy.
          </p>
        )}
      </form>
    </AuthShell>
  )
}
