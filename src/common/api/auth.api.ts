import { apiGet, apiPost, setAccessToken, type ApiSuccess } from './http'

/** Roles the backend accepts on registration (`Role` enum in auth schemas). */
export type RegisterRole = 'Student' | 'Teacher'

/** Payload for POST /auth/register (`UserCreate` schema). */
export interface RegisterInput {
  name: string
  email: string
  /** 10-digit Indian mobile number, e.g. 9876543210. */
  phone: string
  role: RegisterRole
  password: string
  /** Must match `password`; validated by the backend's model validator. */
  cpassword: string
}

/** User object returned in the `data` key of a successful registration (`UserOut` schema). */
export interface RegisteredUser {
  name: string
  email: string
  phone: string
  role: string
  email_verfied: boolean
}

/** Registers a new user. 409 (duplicate email) and 422 (field errors) reject with `ApiError`. */
export function register(input: RegisterInput): Promise<ApiSuccess<RegisteredUser>> {
  return apiPost<RegisteredUser>('/auth/register', input)
}

export interface LoginResponse {
  access_token: string
}

/**
 * Logs in with email + password. The backend uses OAuth2PasswordRequestForm,
 * so the email goes in the `username` field; the refresh_token cookie is
 * stored automatically by the browser (httpOnly) and the access token is
 * persisted for the Authorization header.
 */
export async function login(email: string, password: string): Promise<ApiSuccess<LoginResponse>> {
  const form = new URLSearchParams()
  form.set('username', email)
  form.set('password', password)

  const response = await apiPost<LoginResponse>('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (response.data?.access_token) setAccessToken(response.data.access_token)
  return response
}

/** Current user from the bearer token (GET /auth/me). Rejects with 401 `ApiError` when unauthenticated. */
export function getMe<T = Record<string, unknown>>(): Promise<ApiSuccess<T>> {
  return apiGet<T>('/auth/me')
}

/**
 * Authenticated user's role (GET /auth/role).
 *
 * The backend returns the role as a **plain JSON string** (e.g. `"Admin"`),
 * not an object — the payload is passed through untouched so the caller
 * can parse it with `parseRoleResponse`. Rejects with 401 `ApiError` when
 * the token is missing, malformed, or expired.
 */
export function getRole(): Promise<ApiSuccess<unknown>> {
  return apiGet<unknown>('/auth/role')
}
