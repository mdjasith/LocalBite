import axios from 'axios'

// ============================================
// Group routing — each API path prefix maps to its group
// ============================================
const GROUP_URLS = {
  // Group A — port 8081 (auth, user, seller, admin)
  A: import.meta.env.VITE_GROUP_A_URL || 'http://localhost:8081',
  // Group B — port 8084 (food, cart, order)
  B: import.meta.env.VITE_GROUP_B_URL || 'http://localhost:8084',
  // Group C — port 8088 (payment, wallet, commission)
  C: import.meta.env.VITE_GROUP_C_URL || 'http://localhost:8088',
  // Group D — port 8091 (delivery, review, invoice, notification, location)
  D: import.meta.env.VITE_GROUP_D_URL || 'http://localhost:8091',
}

// Which group handles which URL prefix
const ROUTE_MAP = [
  // Group A
  { prefix: '/api/auth',        group: 'A' },
  { prefix: '/api/users',       group: 'A' },
  { prefix: '/api/sellers',     group: 'A' },
  { prefix: '/api/admin',       group: 'A' },
  // Group B
  { prefix: '/api/foods',       group: 'B' },
  { prefix: '/api/categories',  group: 'B' },
  { prefix: '/api/carts',       group: 'B' },
  { prefix: '/api/orders',      group: 'B' },
  // Group C
  { prefix: '/api/payments',    group: 'C' },
  { prefix: '/api/wallets',     group: 'C' },
  { prefix: '/api/commissions', group: 'C' },
  // Group D
  { prefix: '/api/deliveries',   group: 'D' },
  { prefix: '/api/reviews',      group: 'D' },
  { prefix: '/api/invoices',     group: 'D' },
  { prefix: '/api/notifications',group: 'D' },
  { prefix: '/api/locations',    group: 'D' },
]

function getBaseUrl(path) {
  if (!path) return GROUP_URLS.A
  for (const route of ROUTE_MAP) {
    if (path.startsWith(route.prefix)) {
      return GROUP_URLS[route.group]
    }
  }
  // Default: route to Group A
  return GROUP_URLS.A
}

// Single axios instance; baseURL set per-request by the interceptor below
const client = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

// ============================================
// Request interceptor
// ============================================
client.interceptors.request.use((config) => {
  // Set the correct base URL based on the path
  config.baseURL = getBaseUrl(config.url || '')

  // Attach JWT if present
  const token = localStorage.getItem('lb_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ============================================
// Response interceptor
// ============================================
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    if (status === 401 || status === 403) {
      localStorage.removeItem('lb_token')
      localStorage.removeItem('lb_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export function extractError(err) {
  const data = err?.response?.data
  if (!data) return err.message || 'Something went wrong'
  if (data.message) return data.message
  if (data.fields) {
    const first = Object.values(data.fields)[0]
    if (first) return first
  }
  return 'Something went wrong'
}

export default client