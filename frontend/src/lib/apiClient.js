import axios from 'axios'

/**
 * Shared Axios instance for the Django REST API.
 *
 * Auth follows the CleckBasket pattern: SimpleJWT tokens live in httpOnly
 * cookies set by the backend, so the browser sends them automatically and
 * JavaScript never touches them. Django's CSRF cookie is echoed back in a
 * header on unsafe requests.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  headers: { 'Content-Type': 'application/json' },
})

/** Pull a readable message out of a DRF error response. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (!data) return error?.message ?? fallback
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  const first = Object.values(data)[0]
  if (Array.isArray(first)) return first[0]
  return fallback
}
