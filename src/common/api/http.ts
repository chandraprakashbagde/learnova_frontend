import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Central Axios client for Learnova.
 *
 * The FastAPI backend answers every endpoint with one of these shapes
 * (see `backend/app/core/api_response.py` and `backend/app/auth/router.py`):
 *
 *  1. SuccessResp          -> 2xx { status: true,  message, data }
 *  2. ErrorResp            -> 4xx/5xx { status: false, message, data }
 *  3. FieldErrorResp       -> 422 { status: false, errors: { field: message } }
 *  4. FastAPI HTTPException-> { detail: string | [{ msg }] }
 *  5. Plain payloads       -> POST /auth/login -> { access_token }, GET /auth/me -> user
 *
 * The response interceptor normalises ALL of them, so every API helper resolves
 * to `ApiSuccess<T>` or rejects with `ApiError`:
 *
 * ```ts
 * try {
 *   const { message, data } = await register(payload)   // ApiSuccess<RegisteredUser>
 * } catch (error) {
 *   if (isApiError(error)) {
 *     error.message   // human-readable summary
 *     error.errors    // { email: 'User with this email already exists' } from 422s
 *   }
 * }
 * ```
 */

/** Envelope returned by every successful API call after normalisation. */
export interface ApiSuccess<T = unknown> {
  status: true
  message: string | null
  data: T
}

/** Every failed API call rejects with this error. */
export class ApiError extends Error {
  /** HTTP status code (0 when the server could not be reached). */
  readonly status: number
  /** Field-level messages from 422 responses, e.g. `{ email: 'Email is required' }`. */
  readonly errors: Record<string, string>
  /** Raw payload from the `data` key of ErrorResp, when present. */
  readonly data: unknown

  constructor(status: number, message: string, errors: Record<string, string> = {}, data: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.data = data
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Override with `VITE_API_BASE_URL` (e.g. in `.env.local`). */
export const API_BASE_URL: string =
  (import.meta.env as { VITE_API_BASE_URL?: string } | undefined)?.VITE_API_BASE_URL ?? 'http://localhost:8000'

const ACCESS_TOKEN_KEY = 'learnova_access_token'
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'
const VALIDATION_ERROR_MESSAGE = 'Please correct the highlighted fields.'
const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Please check your connection and try again.'

// `window.localStorage` is unavailable in non-browser runtimes (SSR, tests),
// so an in-memory token backs it up there.
const hasStorage = typeof window !== 'undefined' && Boolean(window.localStorage)
let memoryToken: string | null = null

export function getAccessToken(): string | null {
  if (!hasStorage) return memoryToken
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  memoryToken = token
  if (hasStorage) window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  memoryToken = null
  if (hasStorage) window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  // The refresh_token cookie set by POST /auth/login is httpOnly; send it along
  // so the future refresh flow works without extra configuration.
  withCredentials: true,
  timeout: 15_000,
  // Success/failure is carried by the response envelope, not only the status
  // code — every response is classified in `normalizeResponse` below.
  validateStatus: () => true,
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Extracts a readable message from FastAPI's `detail` payloads. */
function messageFromDetail(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (isRecord(item) && typeof item.msg === 'string' ? item.msg : null))
      .filter((msg): msg is string => Boolean(msg))
    if (messages.length > 0) return messages.join(' ')
  }
  return DEFAULT_ERROR_MESSAGE
}

/**
 * Turns any backend response into either a normalised `ApiSuccess` body or a
 * thrown `ApiError`. Runs for every status code because of `validateStatus`.
 */
function normalizeResponse(response: AxiosResponse): AxiosResponse {
  const body: unknown = response.data
  const status = response.status

  // 1-3. Envelope responses from SuccessResp / ErrorResp / FieldErrorResp.
  if (isRecord(body) && typeof body.status === 'boolean') {
    if (body.status) {
      response.data = {
        status: true,
        message: typeof body.message === 'string' ? body.message : null,
        data: body.data ?? null,
      } satisfies ApiSuccess
      return response
    }

    const errors: Record<string, string> = {}
    if (isRecord(body.errors)) {
      for (const [field, message] of Object.entries(body.errors)) {
        if (typeof message === 'string') errors[field] = message
      }
    }
    const hasFieldErrors = Object.keys(errors).length > 0
    const message =
      (typeof body.message === 'string' && body.message) ||
      (hasFieldErrors ? VALIDATION_ERROR_MESSAGE : DEFAULT_ERROR_MESSAGE)

    throw new ApiError(status, message, errors, body.data ?? null)
  }

  // 4. FastAPI HTTPException payloads such as { detail: 'Invalid credentials' }.
  if (isRecord(body) && 'detail' in body) {
    throw new ApiError(status, messageFromDetail(body.detail))
  }

  // Unrecognised payload on an error status (proxy error pages, 500s, ...).
  if (status >= 400) {
    throw new ApiError(status, DEFAULT_ERROR_MESSAGE, {}, isRecord(body) ? body : null)
  }

  // 5. Plain 2xx payloads (login's { access_token }, /auth/me's user object)
  // are wrapped so callers always receive the same envelope.
  response.data = { status: true, message: null, data: body } satisfies ApiSuccess
  return response
}

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => normalizeResponse(response),
  (error: unknown) => {
    // Errors thrown by normalizeResponse arrive here — surface them unchanged.
    if (isApiError(error)) return Promise.reject(error)

    if (axios.isAxiosError(error)) {
      // No response at all: offline, CORS, DNS or timeout failures.
      const message = error.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : NETWORK_ERROR_MESSAGE
      return Promise.reject(new ApiError(0, message))
    }

    return Promise.reject(error)
  },
)

/** GET helper — resolves with the envelope, rejects with `ApiError`. */
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccess<T>> {
  const response = await http.get<ApiSuccess<T>>(url, config)
  return response.data
}

/** POST helper — resolves with the envelope, rejects with `ApiError`. */
export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiSuccess<T>> {
  const response = await http.post<ApiSuccess<T>>(url, body, config)
  return response.data
}
