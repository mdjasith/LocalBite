// src/utils/visitorTracker.js
// Sends visitor events to Group A (auth-service). Never blocks the UI.

const API_BASE = import.meta.env.VITE_GROUP_A_URL || 'http://localhost:8081'

function getVisitorId() {
  let id = localStorage.getItem('lb_visitor_id')
  if (!id) {
    id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('lb_visitor_id', id)
  }
  return id
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('lb_user')
    if (!raw) return {}
    const u = JSON.parse(raw)
    return { userId: u.userId, email: u.email, role: u.role }
  } catch {
    return {}
  }
}

export async function trackVisit(eventType, extra = {}) {
  try {
    const user = getCurrentUser()
    const body = {
      visitorId: getVisitorId(),
      userId: user.userId || null,
      email: user.email || null,
      role: user.role || null,
      eventType,
      page: extra.page || window.location.pathname,
      referrer: extra.referrer || document.referrer || null,
    }
    await fetch(`${API_BASE}/api/auth/visits/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    })
  } catch {
    /* never throw — tracking must not break the app */
  }
}

/** Call once on app start */
export function trackInitialVisit() {
  if (sessionStorage.getItem('lb_visit_tracked')) return
  sessionStorage.setItem('lb_visit_tracked', '1')
  trackVisit('VISIT')
}

/** Call on every route change */
export function trackPageView(path) {
  trackVisit('PAGE_VIEW', { page: path })
}

/** Call on successful login */
export function trackLogin(role) {
  trackVisit('LOGIN')
}

/** Call on successful register */
export function trackRegister(role) {
  trackVisit('REGISTER')
}

/** Call on logout */
export function trackLogout() {
  trackVisit('LOGOUT')
}