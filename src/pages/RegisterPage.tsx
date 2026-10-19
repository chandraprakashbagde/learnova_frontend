import { BookOpen, GraduationCap, Loader2, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { register, type RegisterRole } from '@/common/api/auth.api'
import { isApiError } from '@/common/api/http'
import { AuthShell } from '@/common/components/AuthShell'
import { PasswordField, TextField } from '@/common/components/FormTextField'
import { Button } from '@/common/ui/button'
import { cn } from '@/common/lib/utils'

interface RegisterForm {
  name: string
  email: string
  phone: string
  role: RegisterRole | ''
  password: string
  confirmPassword: string
}

type RegisterFormErrors = Partial<Record<keyof RegisterForm, string>>

/** Maps backend field names (`UserCreate` schema / validation handler) to form fields. */
const BACKEND_FIELD_TO_FORM: Record<string, keyof RegisterFormErrors> = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  role: 'role',
  password: 'password',
  cpassword: 'confirmPassword',
}

const ROLES: { value: RegisterRole; label: string; description: string; icon: typeof GraduationCap }[] = [
  { value: 'Student', label: 'Student', description: 'I want to learn', icon: GraduationCap },
  { value: 'Teacher', label: 'Teacher', description: 'I want to teach', icon: BookOpen },
]

function validate(form: RegisterForm): RegisterFormErrors {
  const errors: RegisterFormErrors = {}

  if (!form.name.trim()) errors.name = 'Name is required.'

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } 

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.'
  } 
  if (!form.role) errors.role = 'Please choose how you will use Learnova.'

  if (!form.password) {
    errors.password = 'Password is required.'
  } 

  return errors
}

const EMPTY_FORM: RegisterForm = {
  name: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const update = (key: keyof RegisterForm) => (value: string) => {
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
      const response = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role as RegisterRole,
        password: form.password,
        cpassword: form.confirmPassword,
      })

      // Hand the success message to the login page via router state.
      navigate('/login', {
        replace: true,
        state: { notice: response.message ?? 'Registration successful. You can now log in.' },
      })
    } catch (error) {
      if (isApiError(error)) {
        // Field errors from 422 responses are spread onto the matching inputs.
        const fieldErrors: RegisterFormErrors = {}
        let unmappedMessage: string | null = null

        for (const [field, message] of Object.entries(error.errors)) {
          const formField = BACKEND_FIELD_TO_FORM[field]
          if (formField) fieldErrors[formField] = message
          else unmappedMessage ??= message
        }

        // Duplicate email comes back as a 409 ErrorResp with no field map
        // (`auth/services.py`), so attach it to the email input directly.
        if (error.status === 409 && !fieldErrors.email) {
          fieldErrors.email = error.message
        }

        setErrors(fieldErrors)

        if (Object.keys(fieldErrors).length > 0) {
          setFormError(unmappedMessage)
        } else {
          setFormError(error.message)
        }
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
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
        'Name, email, phone, and a secure password',
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
        <TextField
          name="name"
          label="Full name"
          placeholder="Ada Lovelace"
          autoComplete="name"
          required
          value={form.name}
          onChange={update('name')}
          error={errors.name}
        />

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

        <TextField
          name="phone"
          label="Phone"
          type="text"
          placeholder="10-digit mobile number"
          autoComplete="tel"
          required
          value={form.phone}
          onChange={(value) => update('phone')(value.replace(/\D/g, '').slice(0, 10))}
          error={errors.phone}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-foreground">
            I want to join as <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>
          </span>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="I want to join as">
            {ROLES.map(({ value, label, description, icon: RoleIcon }) => {
              const selected = form.role === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={submitting}
                  onClick={() => update('role')(value)}
                  className={cn(
                    'flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
                    selected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
                    errors.role && !selected && 'border-destructive/50',
                  )}
                >
                  <RoleIcon aria-hidden="true" className="size-4 shrink-0" />
                  {label}
                  <span className="hidden text-xs font-normal opacity-70 sm:inline">— {description}</span>
                </button>
              )
            })}
          </div>
          {errors.role ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {errors.role}
            </p>
          ) : null}
        </div>

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

        <Button type="submit" size="lg" variant="gradient" className="mt-1 w-full" disabled={submitting}>
          {submitting ? (
            <>
              Creating account…
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            </>
          ) : (
            <>
              Create Account
              <UserPlus aria-hidden="true" className="size-4" />
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
            By creating an account you agree to our Terms and Privacy Policy. A verification link will be sent to your
            email.
          </p>
        )}
      </form>
    </AuthShell>
  )
}
