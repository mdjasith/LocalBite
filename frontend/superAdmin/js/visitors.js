(async () => {
  const statsEl = document.getElementById('stats')
  const countryWrap = document.getElementById('countryWrap')
  const cityWrap = document.getElementById('cityWrap')
  const loginsWrap = document.getElementById('loginsWrap')
  const recentWrap = document.getElementById('recentWrap')

  statsEl.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading...</div>`

  let summary, countries, cities, logins, recent
  try {
    [summary, countries, cities, logins, recent] = await Promise.all([
      api.get('/api/auth/admin/visits/summary'),
      api.get('/api/auth/admin/visits/countries?days=30'),
      api.get('/api/auth/admin/visits/cities?days=30'),
      api.get('/api/auth/admin/visits/logins?limit=50'),
      api.get('/api/auth/admin/visits/recent?limit=100'),
    ])
  } catch (e) {
    statsEl.innerHTML = `<div class="empty-state"><div class="empty-state__title">Could not load visitor data</div><div>${escapeHtml(e.message)}</div></div>`
    return
  }

  // ---------- STATS ----------
  const t = summary.today
  const w = summary.last7Days
  const m = summary.last30Days

  const cards = [
    { label: 'Visits (today)', value: t.totalVisits, sub: `${t.uniqueVisitors} unique`, color: '#3B82F6', bg: '#EFF6FF', icon: '👁️' },
    { label: 'Logins (today)', value: t.logins, sub: `${t.loginsCustomer} C · ${t.loginsSeller} S`, color: '#10B981', bg: 'var(--success-bg)', icon: '🔑' },
    { label: 'New signups (today)', value: t.registrations, sub: `${t.registrationsCustomer} C · ${t.registrationsSeller} S`, color: '#F59E0B', bg: 'var(--warning-bg)', icon: '📝' },
    { label: 'Visits (30 days)', value: m.totalVisits, sub: `${m.uniqueVisitors} unique`, color: '#FF5C39', bg: 'var(--brand-light)', icon: '📊' },
    { label: 'Logins (30 days)', value: m.logins, sub: `${m.loginsCustomer} C · ${m.loginsSeller} S`, color: '#7C3AED', bg: '#F5F3FF', icon: '🔐' },
    { label: 'Page views (7 days)', value: w.pageViews, sub: `${w.totalVisits} visits`, color: '#0EA5E9', bg: '#F0F9FF', icon: '📄' },
  ]

  statsEl.innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-card__header">
        <div class="stat-card__label">${c.label}</div>
        <div class="stat-card__icon" style="background:${c.bg};color:${c.color}">${c.icon}</div>
      </div>
      <div class="stat-card__value">${c.value}</div>
      <div class="stat-card__sub">${c.sub}</div>
    </div>
  `).join('')

  // ---------- COUNTRIES ----------
  if (!countries || countries.length === 0) {
    countryWrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">No country data yet</div></div>`
  } else {
    countryWrap.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Country</th><th>Visits</th></tr></thead>
        <tbody>
          ${countries.map((c, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${escapeHtml(c.country || '—')}</strong></td>
              <td>${c.count}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  // ---------- CITIES ----------
  if (!cities || cities.length === 0) {
    cityWrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">No city data yet</div></div>`
  } else {
    cityWrap.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>City</th><th>Country</th><th>Visits</th></tr></thead>
        <tbody>
          ${cities.map((c, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${escapeHtml(c.city || '—')}</strong></td>
              <td>${escapeHtml(c.country || '—')}</td>
              <td>${c.count}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  // ---------- LOGINS ----------
  if (!logins || logins.length === 0) {
    loginsWrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">No logins yet</div></div>`
  } else {
    loginsWrap.innerHTML = `
      <table>
        <thead><tr><th>When</th><th>Email</th><th>Role</th><th>IP</th><th>Location</th></tr></thead>
        <tbody>
          ${logins.map(l => `
            <tr>
              <td>${formatDateTime(l.createdAt)}</td>
              <td>${escapeHtml(l.email || '—')}</td>
              <td><span class="badge badge--${(l.role || '').toLowerCase()}">${l.role || '—'}</span></td>
              <td style="font-family:monospace;font-size:12px;">${escapeHtml(l.ipAddress || '—')}</td>
              <td>${escapeHtml([l.city, l.region, l.country].filter(Boolean).join(', ') || '—')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  // ---------- RECENT ACTIVITY ----------
  if (!recent || recent.length === 0) {
    recentWrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">No activity yet</div></div>`
  } else {
    recentWrap.innerHTML = `
      <table>
        <thead><tr><th>When</th><th>Event</th><th>User</th><th>Role</th><th>Page</th><th>Location</th><th>IP</th></tr></thead>
        <tbody>
          ${recent.map(r => `
            <tr>
              <td>${formatDateTime(r.createdAt)}</td>
              <td><span class="badge badge--${eventBadge(r.eventType)}">${r.eventType}</span></td>
              <td>${escapeHtml(r.email || ('guest:' + (r.visitorId || '').slice(0, 10)))}</td>
              <td>${r.role ? `<span class="badge badge--${r.role.toLowerCase()}">${r.role}</span>` : '—'}</td>
              <td style="font-family:monospace;font-size:12px;">${escapeHtml(r.page || '—')}</td>
              <td>${escapeHtml([r.city, r.country].filter(Boolean).join(', ') || '—')}</td>
              <td style="font-family:monospace;font-size:12px;">${escapeHtml(r.ipAddress || '—')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }
})()

function eventBadge(type) {
  switch ((type || '').toUpperCase()) {
    case 'VISIT': return 'info'
    case 'PAGE_VIEW': return 'neutral'
    case 'LOGIN': return 'success'
    case 'REGISTER': return 'warning'
    case 'LOGOUT': return 'danger'
    default: return 'neutral'
  }
}