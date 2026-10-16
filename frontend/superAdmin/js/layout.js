const NAV_GROUPS = [
  { section: 'Dashboard', items: [
    { id: 'dashboard', label: 'Overview', icon: '📊', href: 'dashboard.html' },
  ]},
  { section: 'Operations', items: [
    { id: 'sellers', label: 'Sellers', icon: '🏪', href: 'sellers.html' },
    { id: 'users', label: 'Users', icon: '👥', href: 'users.html' },
    { id: 'foods', label: 'Foods', icon: '🍽️', href: 'foods.html' },
    { id: 'categories', label: 'Categories', icon: '📁', href: 'categories.html' },
    { id: 'orders', label: 'Orders', icon: '📦', href: 'orders.html' },
  ]},
  { section: 'Finance', items: [
    { id: 'payments', label: 'Payments', icon: '💳', href: 'payments.html' },
    { id: 'commissions', label: 'Commissions', icon: '💰', href: 'commissions.html' },
  ]},
  { section: 'Monitoring', items: [
    { id: 'visitors', label: 'Visitors', icon: '👁️', href: 'visitors.html' },
  ]},
  { section: 'Control', items: [
    { id: 'reviews', label: 'Reviews', icon: '⭐', href: 'reviews.html' },
    { id: 'analytics', label: 'Analytics', icon: '📈', href: 'analytics.html' },
  ]},
]

function renderShell(activeId, pageTitle) {
  const user = getAdminUser() || { email: 'admin' }
  const initial = (user.email || 'A')[0].toUpperCase()

  const sidebarHTML = `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <div class="sidebar__brand-mark">
          <svg viewBox="0 0 152 158" width="22" height="23">
            <g fill="#fff" fill-rule="evenodd">
              <path d="M 25 10 L 39 35 L 86 66 L 101 104 L 116 110 L 117 101 L 122 105 L 125 123 L 128 109 L 89 61 Z"/>
              <path d="M 20 27 L 26 41 L 46 55 L 29 50 L 37 62 L 51 69 L 42 70 L 55 86 L 84 99 L 63 57 Z"/>
              <path d="M 102 24 L 104 52 L 96 43 L 95 55 L 113 85 L 120 63 Z"/>
              <path d="M 82 101 L 67 104 L 35 125 L 45 127 L 56 120 L 57 122 L 48 133 L 61 129 Z"/>
              <path d="M 88 118 L 85 127 L 88 127 L 93 133 L 88 135 L 87 138 L 95 138 L 97 141 L 96 147 L 99 146 L 100 139 L 102 147 L 104 143 L 103 137 L 97 134 L 93 127 L 98 116 Z"/>
            </g>
          </svg>
        </div>
        <div>
          <div class="sidebar__brand-text">LocalBite</div>
          <div class="sidebar__brand-sub">Admin</div>
        </div>
      </div>
      ${NAV_GROUPS.map(g => `
        <div class="sidebar__section">
          <div class="sidebar__section-title">${g.section}</div>
          ${g.items.map(it => `
            <a href="${it.href}" class="sidebar__link ${it.id === activeId ? 'sidebar__link--active' : ''}">
              <span class="sidebar__link-icon">${it.icon}</span>
              <span>${it.label}</span>
            </a>
          `).join('')}
        </div>
      `).join('')}
      <div class="sidebar__footer">Portfolio project · Simulated</div>
    </aside>
  `

  const topbarHTML = `
    <header class="topbar">
      <div class="topbar__title">${pageTitle || ''}</div>
      <div class="topbar__right">
        <div class="topbar__user">
          <div class="topbar__avatar">${initial}</div>
          <span>${escapeHtml(user.email)}</span>
        </div>
        <button class="btn btn--outline btn--sm" onclick="adminLogout()">Logout</button>
      </div>
    </header>
  `

  const shell = document.getElementById('app')
  const existing = shell.innerHTML

  shell.className = 'app-shell'
  shell.innerHTML = sidebarHTML + `
    <div>
      ${topbarHTML}
      <div class="main-content" id="mainContent"></div>
    </div>
  `
  document.getElementById('mainContent').innerHTML = existing
}