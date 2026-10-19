import { useState, type FormEvent } from 'react'
import { Loader2, Pencil, Plus } from 'lucide-react'

import { isApiError } from '@/common/api/http'
import { Button } from '@/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/ui/dialog'
import { Input } from '@/common/ui/input'
import {
  createMasterData,
  updateMasterData,
  type MasterDataItem,
  type MasterDataKind,
} from '@/features/admin/api/adminMasterData.api'

const MIN_NAME_LENGTH = 2
const MAX_NAME_LENGTH = 120

export interface MasterDataFormDialogProps {
  kind: MasterDataKind
  /** `null`/undefined creates a new record; a value edits that record. */
  item: MasterDataItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after a successful create/edit so the caller can refresh. */
  onSaved: () => void
}

/**
 * Reusable create/edit dialog shared by the subjects and qualifications
 * pages. Validates the required name inline, disables submit while a
 * request is in flight, and surfaces success/error feedback. The raw API
 * error is shown on failure — success only ever reflects a real backend
 * response, never local state.
 */
export function MasterDataFormDialog({ kind, item, open, onOpenChange, onSaved }: MasterDataFormDialogProps) {
  const isEditing = item != null
  const noun = kind === 'subjects' ? 'subject' : 'qualification type'

  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  // Reset the form when the dialog opens for a different target. This is
  // done during render (not in an effect) to avoid a synchronous setState
  // in an effect body.
  const resetKey = `${open}|${item?.id ?? 'create'}|${item?.name ?? ''}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    setName(item?.name ?? '')
    setNameError(null)
    setFormError(null)
    setSavedMessage(null)
    setSubmitting(false)
  }

  const validate = (value: string): string | null => {
    const trimmed = value.trim()
    if (!trimmed) return `A ${noun} name is required.`
    if (trimmed.length < MIN_NAME_LENGTH) return `Name must be at least ${MIN_NAME_LENGTH} characters.`
    if (trimmed.length > MAX_NAME_LENGTH) return `Name must be at most ${MAX_NAME_LENGTH} characters.`
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const error = validate(name)
    setNameError(error)
    if (error) return

    setSubmitting(true)
    setFormError(null)
    setSavedMessage(null)

    try {
      const payload = { name: name.trim() }
      if (isEditing && item) {
        await updateMasterData(kind, item.id, payload)
      } else {
        await createMasterData(kind, payload)
      }
      setSavedMessage(isEditing ? `Saved changes to ${noun}.` : `Created ${noun}.`)
      onSaved()
    } catch (err) {
      if (isApiError(err)) setFormError(err.message)
      else setFormError(`Something went wrong while saving the ${noun}.`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{isEditing ? `Edit ${noun}` : `New ${noun}`}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Update the name of this ${noun}. Existing teacher references are unaffected.`
                : `Give the new ${noun} a clear, descriptive name.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="master-data-name" className="text-sm font-semibold text-foreground">
              Name <span aria-hidden="true" className="text-destructive">*</span>
            </label>
            <Input
              id="master-data-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (nameError) setNameError(null)
              }}
              placeholder={kind === 'subjects' ? 'e.g. Mathematics' : 'e.g. B.Ed.'}
              disabled={submitting}
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? 'master-data-name-error' : undefined}
            />
            {nameError ? (
              <p id="master-data-name-error" role="alert" className="text-xs font-medium text-destructive">
                {nameError}
              </p>
            ) : null}
          </div>

          {savedMessage ? (
            <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {savedMessage}
            </p>
          ) : null}
          {formError ? (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : isEditing ? (
                <Pencil aria-hidden="true" className="size-4" />
              ) : (
                <Plus aria-hidden="true" className="size-4" />
              )}
              {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
