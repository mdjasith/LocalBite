function isAdminAuthenticated() {
  return !!localStorage.getItem('lb_admin_token')
}

function getAdminUser() {
  try { return JSON.parse(localStorage.getItem('lb_admin_user') || 'null') }
  catch { return null }
}

function requireAdmin() {
  if (!isAdminAuthenticated()) {
    window.location.href = 'index.html'
    return false
  }
  const user = getAdminUser()
  if (!user || user.role !== 'ADMIN') {
    localStorage.removeItem('lb_admin_token')
    localStorage.removeItem('lb_admin_user')
    window.location.href = 'index.html'
    return false
  }
  return true
}

function adminLogout() {
  localStorage.removeItem('lb_admin_token')
  localStorage.removeItem('lb_admin_user')
  window.location.href = 'index.html'
}

function showConfirm({ title, message, confirmLabel = 'Confirm', variant = 'danger' }) {
  return new Promise((resolve) => {
    const back = document.createElement('div')
    back.className = 'modal-backdrop'
    back.innerHTML = `
      <div class="modal">
        <div class="modal__title">${escapeHtml(title)}</div>
        <div class="modal__text">${escapeHtml(message)}</div>
        <div class="modal__actions">
          <button class="btn btn--ghost" data-action="cancel">Cancel</button>
          <button class="btn btn--${variant === 'danger' ? 'danger' : 'primary'}" data-action="confirm">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
    `
    document.body.appendChild(back)
    back.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action')
      if (action === 'confirm') { back.remove(); resolve(true) }
      else if (action === 'cancel' || e.target === back) { back.remove(); resolve(false) }
    })
  })
}