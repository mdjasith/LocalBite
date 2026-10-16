let ALL_SELLERS = []
let FILTER = 'ALL'
let SELLER_SEARCH = ''
let SELECTED = new Set()

console.log('[sellers] script loaded')

async function loadSellers() {
  console.log('[sellers] loadSellers called')

  const wrap = document.getElementById('tableWrap')
  if (!wrap) {
    console.error('[sellers] #tableWrap not found')
    return
  }

  wrap.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading sellers...</div>`

  try {
    console.log('[sellers] calling API /api/sellers/admin/all')
    const data = await api.get('/api/sellers/admin/all')
    console.log('[sellers] API returned:', data)

    ALL_SELLERS = Array.isArray(data) ? data : []
    console.log('[sellers] count:', ALL_SELLERS.length)

    SELECTED.clear()
    renderSellers()
  } catch (e) {
    console.error('[sellers] API failed:', e)
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">Could not load sellers</div><div>${escapeHtml(e.message)}</div></div>`
  }
}

function getFilteredSellers() {
  let list = ALL_SELLERS
  if (FILTER !== 'ALL') list = list.filter(s => s.sellerStatus === FILTER)
  if (SELLER_SEARCH) {
    const q = SELLER_SEARCH.toLowerCase()
    list = list.filter(s =>
      (s.storeName || '').toLowerCase().includes(q) ||
      (s.ownerName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    )
  }
  return list
}

function renderSellers() {
  const wrap = document.getElementById('tableWrap')
  if (!wrap) return
  const filtered = getFilteredSellers()
  const pendingVisible = filtered.filter(s => s.sellerStatus === 'PENDING')

  wrap.innerHTML = `
    <div class="table-toolbar">
      <div class="table-toolbar__search">
        <input id="sellerSearch" placeholder="Search by store, owner, or email..." value="${escapeHtml(SELLER_SEARCH)}" />
      </div>
      <div class="filter-pills">
        ${['ALL','PENDING','APPROVED','REJECTED','BLOCKED'].map(f =>
          `<button class="filter-pill ${f === FILTER ? 'filter-pill--active' : ''}" data-filter="${f}">${f}</button>`
        ).join('')}
      </div>
      ${pendingVisible.length > 0
        ? `<button class="btn btn--success btn--sm" onclick="bulkApprove()">Approve all pending (${pendingVisible.length})</button>`
        : ''}
      <button class="btn btn--outline btn--sm" onclick="exportSellersCsv()">Export CSV</button>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:36px;"></th>
          <th>ID</th><th>Store</th><th>Owner</th><th>Email</th>
          <th>Status</th><th>Operating</th><th>Applied</th><th></th>
        </tr>
      </thead>
      <tbody>
        ${filtered.length === 0
          ? `<tr><td colspan="9"><div class="empty-state"><div class="empty-state__icon">🏪</div><div class="empty-state__title">No sellers</div><div>Nothing matches this filter.</div></div></td></tr>`
          : filtered.map(s => sellerRow(s)).join('')}
      </tbody>
    </table>
  `

  document.querySelectorAll('[data-filter]').forEach(b => {
    b.addEventListener('click', () => {
      FILTER = b.getAttribute('data-filter')
      renderSellers()
    })
  })

  const s = document.getElementById('sellerSearch')
  if (s) {
    s.addEventListener('input', (e) => {
      SELLER_SEARCH = e.target.value
      renderSellers()
    })
    s.focus()
    s.setSelectionRange(s.value.length, s.value.length)
  }

  document.querySelectorAll('[data-select]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = Number(cb.getAttribute('data-select'))
      if (cb.checked) SELECTED.add(id)
      else SELECTED.delete(id)
    })
  })
}

function sellerRow(s) {
  const status = (s.sellerStatus || '').toLowerCase()
  const op = (s.operatingStatus || '').toLowerCase()
  const isPending = s.sellerStatus === 'PENDING'
  const actions = []

  if (isPending) {
    actions.push(`<button class="btn btn--success btn--sm" onclick="approveSeller(${s.sellerId})">Approve</button>`)
    actions.push(`<button class="btn btn--outline btn--sm" onclick="rejectSeller(${s.sellerId})">Reject</button>`)
  }
  if (s.sellerStatus === 'APPROVED') {
    actions.push(`<button class="btn btn--outline btn--sm" onclick="blockSeller(${s.sellerId})">Block</button>`)
  }
  if (s.sellerStatus === 'REJECTED' || s.sellerStatus === 'BLOCKED') {
    actions.push(`<button class="btn btn--success btn--sm" onclick="approveSeller(${s.sellerId})">Re-approve</button>`)
  }
  actions.push(`<button class="btn btn--ghost btn--sm" onclick="viewSeller(${s.sellerId})">View</button>`)

  return `
    <tr data-id="${s.sellerId}">
      <td>${isPending ? `<input type="checkbox" data-select="${s.sellerId}" ${SELECTED.has(s.sellerId) ? 'checked' : ''} />` : ''}</td>
      <td>#${s.sellerId}</td>
      <td><strong>${escapeHtml(s.storeName)}</strong></td>
      <td>${escapeHtml(s.ownerName)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td><span class="badge badge--${status}">${s.sellerStatus}</span></td>
      <td><span class="badge badge--${op}">${s.operatingStatus || '—'}</span></td>
      <td>${formatDate(s.createdAt)}</td>
      <td class="table-actions">${actions.join('')}</td>
    </tr>
  `
}

async function approveSeller(id) {
  try {
    await api.put(`/api/sellers/admin/${id}/approve`)
    toast.success('Seller approved')
    loadSellers()
  } catch (e) { toast.error(e.message) }
}

async function rejectSeller(id) {
  const ok = await showConfirm({
    title: 'Reject this seller?',
    message: 'The seller application will be marked rejected.',
    confirmLabel: 'Reject',
  })
  if (!ok) return
  try {
    await api.put(`/api/sellers/admin/${id}/reject`)
    toast.success('Seller rejected')
    loadSellers()
  } catch (e) { toast.error(e.message) }
}

async function blockSeller(id) {
  const ok = await showConfirm({
    title: 'Block this seller?',
    message: 'The seller will be removed from public listings.',
    confirmLabel: 'Block',
  })
  if (!ok) return
  try {
    await api.put(`/api/sellers/admin/${id}/block`)
    toast.success('Seller blocked')
    loadSellers()
  } catch (e) { toast.error(e.message) }
}

async function bulkApprove() {
  if (SELECTED.size === 0) {
    toast.error('Select sellers first')
    return
  }
  const ok = await showConfirm({
    title: `Approve ${SELECTED.size} seller(s)?`,
    message: 'All selected sellers will be approved.',
    confirmLabel: 'Approve all',
    variant: 'primary',
  })
  if (!ok) return
  let success = 0
  for (const id of SELECTED) {
    try {
      await api.put(`/api/sellers/admin/${id}/approve`)
      success++
    } catch {}
  }
  toast.success(`Approved ${success} seller(s)`)
  loadSellers()
}

function viewSeller(id) {
  const s = ALL_SELLERS.find(x => x.sellerId === id)
  if (!s) return
  const back = document.createElement('div')
  back.className = 'modal-backdrop'
  back.innerHTML = `
    <div class="modal">
      <div class="modal__title">${escapeHtml(s.storeName)}</div>
      <div class="modal__text">Seller #${s.sellerId}</div>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:14px;margin:12px 0 20px;">
        <div><strong>Owner:</strong> ${escapeHtml(s.ownerName)}</div>
        <div><strong>Email:</strong> ${escapeHtml(s.email)}</div>
        <div><strong>Phone:</strong> ${escapeHtml(s.phoneNumber || '—')}</div>
        <div><strong>Status:</strong> ${s.sellerStatus}</div>
        <div><strong>Operating:</strong> ${s.operatingStatus}</div>
        <div><strong>Description:</strong> ${escapeHtml(s.storeDescription || '—')}</div>
        <div><strong>Applied:</strong> ${formatDateTime(s.createdAt)}</div>
      </div>
      <div class="modal__actions">
        <button class="btn btn--outline" data-close>Close</button>
      </div>
    </div>
  `
  document.body.appendChild(back)
  back.addEventListener('click', (e) => {
    if (e.target === back || e.target.hasAttribute('data-close')) back.remove()
  })
}

function exportSellersCsv() {
  const rows = getFilteredSellers()
  exportCsv('localbite-sellers.csv', rows, [
    { label: 'ID', get: s => s.sellerId },
    { label: 'Store', get: s => s.storeName },
    { label: 'Owner', get: s => s.ownerName },
    { label: 'Email', get: s => s.email },
    { label: 'Status', get: s => s.sellerStatus },
    { label: 'Operating', get: s => s.operatingStatus },
    { label: 'Applied', get: s => s.createdAt },
  ])
}

// Run after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSellers)
} else {
  loadSellers()
}