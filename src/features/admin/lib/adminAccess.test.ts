import { describe, expect, it } from 'vitest'

import {
  ADMIN_ROLE,
  evaluateAdminAccess,
  isAdminRole,
  parseRoleResponse,
} from '@/features/admin/lib/adminAccess'

describe('parseRoleResponse', () => {
  it('parses the plain-string response the backend actually returns', () => {
    expect(parseRoleResponse('Admin')).toBe('Admin')
    expect(parseRoleResponse('Teacher')).toBe('Teacher')
    expect(parseRoleResponse('Student')).toBe('Student')
  })

  it('trims whitespace and treats an empty string as no role', () => {
    expect(parseRoleResponse('  Admin  ')).toBe('Admin')
    expect(parseRoleResponse('')).toBeNull()
    expect(parseRoleResponse('   ')).toBeNull()
  })

  it('tolerates an object or wrapped payload without inventing a role', () => {
    expect(parseRoleResponse({ role: 'Admin' })).toBe('Admin')
    expect(parseRoleResponse({ data: 'Teacher' })).toBe('Teacher')
    expect(parseRoleResponse({ data: { role: 'Student' } })).toBe('Student')
  })

  it('returns null for missing or non-string payloads', () => {
    expect(parseRoleResponse(null)).toBeNull()
    expect(parseRoleResponse(undefined)).toBeNull()
    expect(parseRoleResponse(123)).toBeNull()
    expect(parseRoleResponse({ role: 42 })).toBeNull()
    expect(parseRoleResponse({})).toBeNull()
  })
})

describe('isAdminRole', () => {
  it('matches the exact backend role value only', () => {
    expect(ADMIN_ROLE).toBe('Admin') // guards against accidental case changes
    expect(isAdminRole('Admin')).toBe(true)
    expect(isAdminRole('admin')).toBe(false) // case-sensitive
    expect(isAdminRole('ADMIN')).toBe(false)
    expect(isAdminRole('Teacher')).toBe(false)
    expect(isAdminRole('Student')).toBe(false)
    expect(isAdminRole(null)).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
  })
})

describe('evaluateAdminAccess — admin route protection', () => {
  it('1. grants access to an admin', () => {
    expect(
      evaluateAdminAccess({ hasToken: true, role: 'Admin', resolved: true }),
    ).toEqual({ status: 'granted', role: 'Admin' })
  })

  it('2. denies a teacher', () => {
    expect(
      evaluateAdminAccess({ hasToken: true, role: 'Teacher', resolved: true }),
    ).toEqual({ status: 'denied', role: 'Teacher' })
  })

  it('3. denies a student', () => {
    expect(
      evaluateAdminAccess({ hasToken: true, role: 'Student', resolved: true }),
    ).toEqual({ status: 'denied', role: 'Student' })
  })

  it('4. treats an unauthenticated user as needing login', () => {
    expect(evaluateAdminAccess({ hasToken: false, role: null, resolved: false })).toEqual({
      status: 'unauthenticated',
    })
  })

  it('5. stays in the loading state so no protected content renders', () => {
    expect(evaluateAdminAccess({ hasToken: true, role: null, resolved: false })).toEqual({
      status: 'checking',
    })
  })

  it('6a. maps a 401 (expired session) to unauthenticated, not access', () => {
    expect(
      evaluateAdminAccess({
        hasToken: true,
        role: null,
        resolved: true,
        error: { status: 401, message: 'Invalid or expired authentication token' },
      }),
    ).toEqual({ status: 'unauthenticated' })
  })

  it('6b. never grants access on a role-endpoint failure', () => {
    const result = evaluateAdminAccess({
      hasToken: true,
      role: null,
      resolved: true,
      error: { status: 500, message: 'Internal Server Error' },
    })
    expect(result.status).toBe('error')
    expect(result.status).not.toBe('granted')
  })

  it('6c. a network failure with no status does not grant access', () => {
    const result = evaluateAdminAccess({
      hasToken: true,
      role: 'Admin',
      resolved: true,
      error: { message: 'Unable to reach the server.' },
    })
    expect(result.status).toBe('error')
  })

  it('7. denies when authenticated but the role is unparsable', () => {
    // A token exists but the role could not be parsed -> deny, don't grant.
    expect(
      evaluateAdminAccess({ hasToken: true, role: null, resolved: true }),
    ).toEqual({ status: 'denied', role: 'unknown' })
  })

  it('uses the provided error message, falling back to a default', () => {
    expect(
      evaluateAdminAccess({
        hasToken: true,
        role: null,
        resolved: true,
        error: { status: 503, message: 'Service unavailable' },
      }),
    ).toEqual({ status: 'error', message: 'Service unavailable' })

    expect(
      evaluateAdminAccess({
        hasToken: true,
        role: null,
        resolved: true,
        error: { status: 503, message: '   ' },
      }),
    ).toEqual({ status: 'error', message: 'Unable to verify your access.' })
  })
})
