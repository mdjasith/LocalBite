// ============================================
// LocalBite Admin — API configuration
// ============================================

const API_BASES = {
  A: 'http://localhost:8081',  // auth, user, seller, admin
  B: 'http://localhost:8084',  // food, cart, order
  C: 'http://localhost:8088',  // payment, wallet, commission
  D: 'http://localhost:8091',  // delivery, review, invoice, notification, location
}

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

// Kept for backwards compatibility (login.js uses it)
const API_BASE = API_BASES.A

function getApiBase(path) {
  if (!path) return API_BASES.A
  for (const route of ROUTE_MAP) {
    if (path.startsWith(route.prefix)) return API_BASES[route.group]
  }
  return API_BASES.A
}