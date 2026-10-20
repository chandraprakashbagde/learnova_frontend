import { describe, expect, it } from 'vitest'

import {
  ADMIN_ROLE,
  STUDENT_ROLE,
  TEACHER_ROLE,
  dashboardForRole,
  evaluateRoleAccess,
  parseRoleResponse,
  postLoginRedirectTarget,
} from '@/common/auth/roles'

describe('dashboardForRole', () => {
  it('maps each role to its dashboard', () => {
    expect(dashboardForRole(ADMIN_ROLE)).toBe('/admin')
    expect(dashboardForRole(TEACHER_ROLE)).toBe('/teacher')
    expect(dashboardForRole(STUDENT_ROLE)).toBe('/student')
  })

  it('falls back to home for unknown or missing roles', () => {
    expect(dashboardForRole('Staff')).toBe('/')
    expect(dashboardForRole(null)).toBe('/')
    expect(dashboardForRole(undefined)).toBe('/')
  })
})

describe('evaluateRoleAccess — per-role route protection', () => {
  it('admin is granted only on the admin route', () => {
    const base = { hasToken: true, resolved: true }
    expect(evaluateRoleAccess({ ...base, role: ADMIN_ROLE, requiredRole: ADMIN_ROLE }).status).toBe('granted')
    expect(evaluateRoleAccess({ ...base, role: ADMIN_ROLE, requiredRole: TEACHER_ROLE }).status).toBe('wrongRole')
    expect(evaluateRoleAccess({ ...base, role: ADMIN_ROLE, requiredRole: STUDENT_ROLE }).status).toBe('wrongRole')
  })

  it('teacher is granted only on the teacher route', () => {
    const base = { hasToken: true, resolved: true }
    expect(evaluateRoleAccess({ ...base, role: TEACHER_ROLE, requiredRole: TEACHER_ROLE }).status).toBe('granted')
    expect(evaluateRoleAccess({ ...base, role: TEACHER_ROLE, requiredRole: ADMIN_ROLE }).status).toBe('wrongRole')
    expect(evaluateRoleAccess({ ...base, role: TEACHER_ROLE, requiredRole: STUDENT_ROLE }).status).toBe('wrongRole')
  })

  it('student is granted only on the student route', () => {
    const base = { hasToken: true, resolved: true }
    expect(evaluateRoleAccess({ ...base, role: STUDENT_ROLE, requiredRole: STUDENT_ROLE }).status).toBe('granted')
    expect(evaluateRoleAccess({ ...base, role: STUDENT_ROLE, requiredRole: ADMIN_ROLE }).status).toBe('wrongRole')
    expect(evaluateRoleAccess({ ...base, role: STUDENT_ROLE, requiredRole: TEACHER_ROLE }).status).toBe('wrongRole')
  })

  it('unauthenticated users are never granted', () => {
    for (const requiredRole of [ADMIN_ROLE, TEACHER_ROLE, STUDENT_ROLE]) {
      expect(
        evaluateRoleAccess({ hasToken: false, role: null, resolved: false, requiredRole }).status,
      ).toBe('unauthenticated')
    }
  })

  it('role-loading never renders protected content', () => {
    expect(
      evaluateRoleAccess({ hasToken: true, role: null, resolved: false, requiredRole: ADMIN_ROLE }).status,
    ).toBe('checking')
  })

  it('role-endpoint failures never grant access', () => {
    for (const requiredRole of [ADMIN_ROLE, TEACHER_ROLE, STUDENT_ROLE]) {
      const result = evaluateRoleAccess({
        hasToken: true,
        role: requiredRole, // even a matching role must not win over a failure
        resolved: true,
        requiredRole,
        error: { status: 500, message: 'boom' },
      })
      expect(result.status).toBe('error')
      expect(result.status).not.toBe('granted')
    }
  })

  it('a 401 failure maps to unauthenticated', () => {
    expect(
      evaluateRoleAccess({
        hasToken: true,
        role: null,
        resolved: true,
        requiredRole: ADMIN_ROLE,
        error: { status: 401, message: 'expired' },
      }).status,
    ).toBe('unauthenticated')
  })

  it('wrongRole carries the actual role so the guard can redirect home', () => {
    const result = evaluateRoleAccess({
      hasToken: true,
      role: TEACHER_ROLE,
      resolved: true,
      requiredRole: ADMIN_ROLE,
    })
    expect(result).toEqual({ status: 'wrongRole', role: TEACHER_ROLE })
  })

  it('an unparsable role is treated as wrongRole, not granted', () => {
    const result = evaluateRoleAccess({
      hasToken: true,
      role: null,
      resolved: true,
      requiredRole: ADMIN_ROLE,
    })
    expect(result).toEqual({ status: 'wrongRole', role: 'unknown' })
  })
})

describe('parseRoleResponse', () => {
  it('parses the plain-string backend response and tolerates objects', () => {
    expect(parseRoleResponse('Admin')).toBe('Admin')
    expect(parseRoleResponse({ role: 'Teacher' })).toBe('Teacher')
    expect(parseRoleResponse({ data: 'Student' })).toBe('Student')
    expect(parseRoleResponse('')).toBeNull()
    expect(parseRoleResponse(null)).toBeNull()
    expect(parseRoleResponse(123)).toBeNull()
  })
})

describe('postLoginRedirectTarget', () => {
  it('routes each role to their own dashboard when no `from`', () => {
    expect(postLoginRedirectTarget(ADMIN_ROLE, undefined)).toBe('/admin')
    expect(postLoginRedirectTarget(TEACHER_ROLE, null)).toBe('/teacher')
    expect(postLoginRedirectTarget(STUDENT_ROLE, '')).toBe('/student')
  })

  it('preserves `from` only when it is valid for the role', () => {
    expect(postLoginRedirectTarget(ADMIN_ROLE, '/admin/teachers')).toBe('/admin/teachers')
    expect(postLoginRedirectTarget(TEACHER_ROLE, '/teacher/courses')).toBe('/teacher/courses')
    expect(postLoginRedirectTarget(STUDENT_ROLE, '/student')).toBe('/student')
  })

  it('sends a user away from another role’s area to their own dashboard', () => {
    expect(postLoginRedirectTarget(TEACHER_ROLE, '/admin')).toBe('/teacher')
    expect(postLoginRedirectTarget(STUDENT_ROLE, '/admin/teachers')).toBe('/student')
    expect(postLoginRedirectTarget(ADMIN_ROLE, '/student')).toBe('/admin')
    expect(postLoginRedirectTarget(TEACHER_ROLE, '/teacherish')).toBe('/teacher')
  })

  it('guards against open-redirect via external or protocol-relative paths', () => {
    expect(postLoginRedirectTarget(ADMIN_ROLE, 'https://evil.com')).toBe('/admin')
    expect(postLoginRedirectTarget(ADMIN_ROLE, '//evil.com')).toBe('/admin')
    expect(postLoginRedirectTarget(ADMIN_ROLE, '/for-students')).toBe('/admin')
  })

  it('unknown roles fall back to home', () => {
    expect(postLoginRedirectTarget('Staff', '/admin')).toBe('/')
  })
})
