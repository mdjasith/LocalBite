let ALL_USERS = []
let USER_FILTER = 'ALL'
let USER_SEARCH = ''

async function loadUsers() {
  const wrap = document.getElementById('tableWrap')
  wrap.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading users...</div>`
  try {
    ALL_USERS = await api.get('/api/auth/admin/users')
    if (!Array.isArray(ALL_USERS)) ALL_USERS = []
    renderUsers()
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">Could not load</div><div>${escapeHtml(e.message)}</div></div>`
  }
}

function getFilteredUsers() {
  let list = ALL_USERS
  if (USER_FILTER !== 'ALL') list = list.filter(u => u.role === USER_FILTER)
  if (USER_SEARCH) {
    const q = USER_SEARCH.toLowerCase()
    list = list.filter(u => (u.email || '').toLowerCase().includes(q))
  }
  return list
}

function renderUsers() {
  const wrap = document.getElementById('tableWrap')
  const filtered = getFilteredUsers()

  wrap.innerHTML = `
    <div class="table-toolbar">
      <div class="table-toolbar__search">
        <input id="userSearch" placeholder="Search by email..." value="${escapeHtml(USER_SEARCH)}" />
      </div>
      <div class="filter-pills">
        ${['ALL','CUSTOMER','SELLER','ADMIN'].map(f =>
          `<button class="filter-pill ${f === USER_FILTER ? 'filter-pill--active' : ''}" data-filter="${f}">${f}</button>`
        ).join('')}
      </div>
      <button class="btn btn--outline btn--sm" onclick="exportUsersCsv()">Export CSV</button>
      <button class="btn btn--primary btn--sm" onclick="openUserModal()">+ New user</button>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th></th></tr></thead>
      <tbody>
        ${filtered.length === 0
          ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-state__icon">👥</div><div class="empty-state__title">No users</div></div></td></tr>`
          : filtered.map(u => `
            <tr>
              <td>#${u.authUserId}</td>
              <td>${escapeHtml(u.email)}</td>
              <td><span class="badge badge--${u.role === 'ADMIN' ? 'danger' : u.role === 'SELLER' ? 'info' : 'neutral'}">${u.role}</span></td>
              <td><span class="badge badge--${(u.accountStatus||'').toLowerCase() === 'active' ? 'success' : 'danger'}">${u.accountStatus || '—'}</span></td>
              <td>${formatDateTime(u.createdAt)}</td>
              <td class="table-actions">
                <button class="btn btn--outline btn--sm" onclick="openUserModal(${u.authUserId})">Edit</button>
                <button class="btn btn--danger btn--sm" onclick="deleteUser(${u.authUserId})">Delete</button>
              </td>
            </tr>
          `).join('')}
      </tbody>
    </table>
  `

  document.querySelectorAll('[data-filter]').forEach(b => {
    b.addEventListener('click', () => {
      USER_FILTER = b.getAttribute('data-filter')
      renderUsers()
    })
  })

  const s = document.getElementById('userSearch')
  if (s) {
    s.addEventListener('input', (e) => {
      USER_SEARCH = e.target.value
      renderUsers()
    })
    s.focus()
    const len = s.value.length
    s.setSelectionRange(len, len)
  }
}

function openUserModal(id = null) {
  const user = id ? ALL_USERS.find(u => u.authUserId === id) : null
  const isEdit = !!user

  const back = document.createElement('div')
  back.className = 'modal-backdrop'
  back.innerHTML = `
    <div class="modal">
      <div class="modal__title">${isEdit ? 'Edit user #' + user.authUserId : 'New user'}</div>
      <div style="margin-top:20px;">
        <div class="field">
          <label class="field__label">Email</label>
          <input id="uEmail" class="field__input" value="${user ? escapeHtml(user.email) : ''}" ${isEdit ? 'disabled' : ''} />
        </div>
        <div class="field">
          <label class="field__label">Password ${isEdit ? '(leave blank to keep)' : ''}</label>
          <input id="uPassword" type="password" class="field__input" placeholder="${isEdit ? '••••••••' : 'At least 6 characters'}" />
        </div>
        <div class="field">
          <label class="field__label">Role</label>
          <select id="uRole" class="field__select">
            <option value="CUSTOMER" ${user?.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
            <option value="SELLER" ${user?.role === 'SELLER' ? 'selected' : ''}>SELLER</option>
            <option value="ADMIN" ${user?.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label">Account status</label>
          <select id="uStatus" class="field__select">
            <option value="ACTIVE" ${user?.accountStatus === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
            <option value="INACTIVE" ${user?.accountStatus === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
            <option value="BLOCKED" ${user?.accountStatus === 'BLOCKED' ? 'selected' : ''}>BLOCKED</option>
          </select>
        </div>
      </div>
      <div class="modal__actions">
        <button class="btn btn--ghost" data-close>Cancel</button>
        <button class="btn btn--primary" id="uSave">${isEdit ? 'Save changes' : 'Create user'}</button>
      </div>
    </div>
  `
  document.body.appendChild(back)
  back.querySelector('[data-close]').addEventListener('click', () => back.remove())
  back.addEventListener('click', e => { if (e.target === back) back.remove() })

  back.querySelector('#uSave').addEventListener('click', async () => {
    const email = back.querySelector('#uEmail').value.trim()
    const password = back.querySelector('#uPassword').value
    const role = back.querySelector('#uRole').value
    const accountStatus = back.querySelector('#uStatus').value

    try {
      if (isEdit) {
        const body = { role, accountStatus }
        if (password) body.password = password
        await api.put(`/api/auth/admin/users/${user.authUserId}`, body)
        toast.success('User updated')
      } else {
        if (!email || password.length < 6) {
          toast.error('Email and password (min 6) required')
          return
        }
        await api.post('/api/auth/register', { email, password, role })
        if (accountStatus !== 'ACTIVE') {
          const created = await api.get('/api/auth/admin/users')
          const found = (created || []).find(u => u.email === email)
          if (found) {
            await api.put(`/api/auth/admin/users/${found.authUserId}`, { accountStatus })
          }
        }
        toast.success('User created')
      }
      back.remove()
      loadUsers()
    } catch (e) { toast.error(e.message) }
  })
}

async function deleteUser(id) {
  const ok = await showConfirm({
    title: 'Delete this user?',
    message: 'This removes the login account. Related profiles and orders will remain.',
    confirmLabel: 'Delete',
  })
  if (!ok) return
  try {
    await api.del(`/api/auth/admin/users/${id}`)
    toast.success('User deleted')
    loadUsers()
  } catch (e) { toast.error(e.message) }
}

function exportUsersCsv() {
  const rows = getFilteredUsers()
  exportCsv('localbite-users.csv', rows, [
    { label: 'ID', get: u => u.authUserId },
    { label: 'Email', get: u => u.email },
    { label: 'Role', get: u => u.role },
    { label: 'Status', get: u => u.accountStatus },
    { label: 'Created', get: u => u.createdAt },
  ])
}

loadUsers()