import axios from 'axios'

// In production, API_BASE should be the full backend URL (e.g., https://your-api.onrender.com/api)
// In development, Vite proxy handles /api → localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jobconnect_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jobconnect_token')
      localStorage.removeItem('jobconnect_user')
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email })
}

// Jobs API
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/user/my-jobs')
}

// Bookings API
export const bookingsAPI = {
  create: (jobId) => api.post('/bookings', { jobId }),
  getMy: () => api.get('/bookings/my'),
  cancel: (jobId) => api.delete(`/bookings/${jobId}`),
  check: (jobId) => api.get(`/bookings/check/${jobId}`),
}

// Messages API
export const messagesAPI = {
  getAll: () => api.get('/messages'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  send: (data) => api.post('/messages', data),
  markRead: (messageId) => api.patch(`/messages/${messageId}/read`)
}

// Payments API
export const paymentsAPI = {
  create: (data) => api.post('/payments', data)
}

// Admin API
export const adminAPI = {
  getPendingJobs: () => api.get('/admin/jobs/pending'),
  updateJobStatus: (id, status) => api.patch(`/admin/jobs/${id}/status`, { status }),
  getUsers: () => api.get('/admin/users'),
  blockUser: (id, block) => api.patch(`/admin/users/${id}/block`, { block }),
  verifyUser: (id, verify) => api.patch(`/admin/users/${id}/verify`, { verify })
}

// Users API
export const usersAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  getStats: () => api.get('/users/stats'),
}

export default api
