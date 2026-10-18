import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'

import { cn } from '@/common/lib/utils'
import { Input } from '@/common/ui/input'

interface FieldBaseProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Validation message shown under the field; also sets aria-invalid. */
  error?: string
  autoComplete?: string
  required?: boolean
  disabled?: boolean
}

export interface TextFieldProps extends FieldBaseProps {
  /** Form control name, used for the DOM id. */
  name: string
  type?: 'text' | 'email'
}

const labelClassName = 'text-sm font-semibold text-foreground'
const inputClassName = 'h-12 rounded-xl'

function FieldShell({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string
  label: string
  error?: string
  required?: boolean
  children: (describedBy: string | undefined) => React.ReactNode
}) {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClassName}>
        {label}
        {required ? <span aria-hidden="true" className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children(error ? errorId : undefined)}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextField({ name, label, type = 'text', value, onChange, placeholder, error, autoComplete, required, disabled }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} error={error} required={required}>
      {(describedBy) => (
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-label={label}
          className={cn(inputClassName, error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40')}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldShell>
  )
}

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'label'> {
  /** Optional custom label; defaults to "Password". */
  label?: string
}

export function PasswordField({
  name,
  label = 'Password',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  required,
  disabled,
}: PasswordFieldProps) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  return (
    <FieldShell id={id} label={label} error={error} required={required}>
      {(describedBy) => (
        <div className="relative">
          <Input
            id={id}
            name={name}
            type={visible ? 'text' : 'password'}
            value={value}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-label={label}
            className={cn(inputClassName, 'pr-12', error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40')}
            onChange={(event) => onChange(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={visible}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            {visible ? <EyeOff className="size-4.5" aria-hidden="true" /> : <Eye className="size-4.5" aria-hidden="true" />}
          </button>
        </div>
      )}
    </FieldShell>
  )
}