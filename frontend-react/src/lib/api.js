/**
 * MammAI API client — Axios wrapper with JWT auth
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min — model inference can take time
})

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mammai_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mammai_token')
      localStorage.removeItem('mammai_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────
export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  localStorage.setItem('mammai_token', data.access_token)
  localStorage.setItem('mammai_user', JSON.stringify({
    name: data.user_name, email: data.user_email, role: data.role,
  }))
  return data
}

export async function registerUser(name, email, password, role = 'radiologist') {
  const { data } = await api.post('/auth/register', { name, email, password, role })
  localStorage.setItem('mammai_token', data.access_token)
  localStorage.setItem('mammai_user', JSON.stringify({
    name: data.user_name, email: data.user_email, role: data.role,
  }))
  return data
}

export function logoutUser() {
  localStorage.removeItem('mammai_token')
  localStorage.removeItem('mammai_user')
}

export function getCurrentUser() {
  const raw = localStorage.getItem('mammai_user')
  return raw ? JSON.parse(raw) : null
}

export async function deleteUser(email) {
  const { data } = await api.delete(`/auth/users/${email}`)
  return data
}

export function isLoggedIn() {
  return !!localStorage.getItem('mammai_token')
}

// ── Analyze ───────────────────────────────────────────────────────────────
export async function analyzeImage(file, patientId = null) {
  const fd = new FormData()
  fd.append('file', file)
  const params = patientId ? `?patient_id=${patientId}` : ''
  const { data } = await api.post(`/analyze${params}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// ── Patients ──────────────────────────────────────────────────────────────
export async function getPatients() {
  const { data } = await api.get('/patients')
  return data
}

export async function createPatient(payload) {
  const { data } = await api.post('/patients', payload)
  return data
}

export async function deletePatient(id) {
  const { data } = await api.delete(`/patients/${id}`)
  return data
}

// ── Reports ───────────────────────────────────────────────────────────────
export async function getReports() {
  const { data } = await api.get('/reports')
  return data
}

export async function getReport(id) {
  const { data } = await api.get(`/reports/${id}`)
  return data
}

// ── Analytics ─────────────────────────────────────────────────────────────
export async function getAnalytics() {
  const { data } = await api.get('/analytics')
  return data
}

export default api
