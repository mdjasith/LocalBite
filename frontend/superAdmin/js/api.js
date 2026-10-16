// const TOKEN_KEY = 'lb_admin_token'
// const USER_KEY = 'lb_admin_user'

// function getToken() { return localStorage.getItem(TOKEN_KEY) }

// async function apiFetch(path, options = {}) {
//   const token = getToken()
//   const res = await fetch(API_BASE + path, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
//       ...(options.headers || {}),
//     },
//   })

//   if (res.status === 401 || res.status === 403) {
//     localStorage.removeItem(TOKEN_KEY)
//     localStorage.removeItem(USER_KEY)
//     if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
//       window.location.href = 'index.html'
//     }
//     throw new Error('Session expired. Please sign in again.')
//   }

//   if (res.status === 204) return null

//   const text = await res.text()
//   let data = null
//   try { data = text ? JSON.parse(text) : null } catch { data = text }

//   if (!res.ok) {
//     const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`
//     throw new Error(msg)
//   }
//   return data
// }

// const api = {
//   get: (p) => apiFetch(p),
//   post: (p, body) => apiFetch(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
//   put: (p, body) => apiFetch(p, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
//   del: (p) => apiFetch(p, { method: 'DELETE' }),
// }

// /* ==================== TOAST ==================== */
// function ensureToastContainer() {
//   let el = document.getElementById('toast-container')
//   if (!el) {
//     el = document.createElement('div')
//     el.id = 'toast-container'
//     el.className = 'toast-container'
//     document.body.appendChild(el)
//   }
//   return el
// }

// function showToast(message, type = 'info') {
//   const c = ensureToastContainer()
//   const t = document.createElement('div')
//   t.className = `toast toast--${type}`
//   t.textContent = message
//   c.appendChild(t)
//   setTimeout(() => {
//     t.style.opacity = '0'
//     t.style.transition = 'all 0.3s'
//     setTimeout(() => t.remove(), 300)
//   }, 3000)
// }

// const toast = {
//   success: (m) => showToast(m, 'success'),
//   error: (m) => showToast(m, 'error'),
//   info: (m) => showToast(m, 'info'),
// }

// /* ==================== FORMATTERS ==================== */
// function formatCurrency(amount) {
//   if (amount == null) return '₹0.00'
//   const n = typeof amount === 'string' ? parseFloat(amount) : amount
//   if (isNaN(n)) return '₹0.00'
//   return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
// }

// function formatDate(date) {
//   if (!date) return '—'
//   return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
// }

// function formatDateTime(date) {
//   if (!date) return '—'
//   return new Date(date).toLocaleString('en-IN', {
//     day: 'numeric', month: 'short', year: 'numeric',
//     hour: '2-digit', minute: '2-digit',
//   })
// }

// function escapeHtml(s) {
//   if (s == null) return ''
//   return String(s)
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
// }

// /* ==================== CSV EXPORT ==================== */
// function exportCsv(filename, rows, columns) {
//   const header = columns.map(c => `"${c.label}"`).join(',')
//   const body = rows.map(r =>
//     columns.map(c => {
//       const val = typeof c.get === 'function' ? c.get(r) : r[c.key]
//       const s = val == null ? '' : String(val)
//       return `"${s.replace(/"/g, '""')}"`
//     }).join(',')
//   ).join('\n')
//   const csv = '\ufeff' + header + '\n' + body
//   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
//   const url = URL.createObjectURL(blob)
//   const a = document.createElement('a')
//   a.href = url
//   a.download = filename
//   document.body.appendChild(a)
//   a.click()
//   a.remove()
//   URL.revokeObjectURL(url)
//   toast.success('Exported ' + filename)
// }







// ============================================
// LocalBite Admin — API client with group routing
// ============================================

const TOKEN_KEY = 'lb_admin_token'
const USER_KEY = 'lb_admin_user'

function getToken() { return localStorage.getItem(TOKEN_KEY) }

async function apiFetch(path, options = {}) {
  const token = getToken()
  const base = (typeof getApiBase === 'function') ? getApiBase(path) : API_BASE

  const res = await fetch(base + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      ...(options.headers || {}),
    },
  })

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
      window.location.href = 'index.html'
    }
    throw new Error('Session expired. Please sign in again.')
  }

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data
}

const api = {
  get: (p) => apiFetch(p),
  post: (p, body) => apiFetch(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (p, body) => apiFetch(p, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: (p) => apiFetch(p, { method: 'DELETE' }),
}

/* ==================== TOAST ==================== */
function ensureToastContainer() {
  let el = document.getElementById('toast-container')
  if (!el) {
    el = document.createElement('div')
    el.id = 'toast-container'
    el.className = 'toast-container'
    document.body.appendChild(el)
  }
  return el
}

function showToast(message, type = 'info') {
  const c = ensureToastContainer()
  const t = document.createElement('div')
  t.className = `toast toast--${type}`
  t.textContent = message
  c.appendChild(t)
  setTimeout(() => {
    t.style.opacity = '0'
    t.style.transition = 'all 0.3s'
    setTimeout(() => t.remove(), 300)
  }, 3000)
}

const toast = {
  success: (m) => showToast(m, 'success'),
  error: (m) => showToast(m, 'error'),
  info: (m) => showToast(m, 'info'),
}

/* ==================== FORMATTERS ==================== */
function formatCurrency(amount) {
  if (amount == null) return '₹0.00'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '₹0.00'
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function escapeHtml(s) {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* ==================== CSV EXPORT ==================== */
function exportCsv(filename, rows, columns) {
  const header = columns.map(c => `"${c.label}"`).join(',')
  const body = rows.map(r =>
    columns.map(c => {
      const val = typeof c.get === 'function' ? c.get(r) : r[c.key]
      const s = val == null ? '' : String(val)
      return `"${s.replace(/"/g, '""')}"`
    }).join(',')
  ).join('\n')
  const csv = '\ufeff' + header + '\n' + body
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  toast.success('Exported ' + filename)
}