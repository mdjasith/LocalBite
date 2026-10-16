let ALL_ORDERS = []
let ORDER_FILTER = 'ALL'
let ORDER_SEARCH = ''

async function loadOrders() {
  const wrap = document.getElementById('tableWrap')
  wrap.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading orders...</div>`
  try {
    ALL_ORDERS = await api.get('/api/orders/admin/all')
    if (!Array.isArray(ALL_ORDERS)) ALL_ORDERS = []
    renderOrders()
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">Could not load</div><div>${escapeHtml(e.message)}</div></div>`
  }
}

function getFilteredOrders() {
  let list = ALL_ORDERS
  if (ORDER_FILTER !== 'ALL') list = list.filter(o => o.orderStatus === ORDER_FILTER)
  if (ORDER_SEARCH) {
    const q = ORDER_SEARCH.toLowerCase()
    list = list.filter(o =>
      String(o.orderId).includes(q) ||
      String(o.customerId).includes(q) ||
      String(o.sellerId).includes(q)
    )
  }
  return list
}

function renderOrders() {
  const wrap = document.getElementById('tableWrap')
  const filtered = getFilteredOrders()

  wrap.innerHTML = `
    <div class="table-toolbar">
      <div class="table-toolbar__search">
        <input id="orderSearch" placeholder="Search by order, customer, seller..." value="${escapeHtml(ORDER_SEARCH)}" />
      </div>
      <div class="filter-pills">
        ${['ALL','PLACED','ACCEPTED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'].map(f =>
          `<button class="filter-pill ${f === ORDER_FILTER ? 'filter-pill--active' : ''}" data-filter="${f}">${f.replace(/_/g,' ')}</button>`
        ).join('')}
      </div>
      <button class="btn btn--outline btn--sm" onclick="exportOrdersCsv()">Export CSV</button>
    </div>
    <table>
      <thead>
        <tr><th>Order</th><th>Customer</th><th>Seller</th><th>Amount</th><th>Commission</th><th>Status</th><th>Placed</th><th></th></tr>
      </thead>
      <tbody>
        ${filtered.length === 0
          ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-state__icon">📦</div><div class="empty-state__title">No orders</div></div></td></tr>`
          : filtered.map(o => {
            const isDone = ['DELIVERED','CANCELLED','FAILED'].includes(o.orderStatus)
            return `
              <tr>
                <td><strong>LB${o.orderId}</strong></td>
                <td>#${o.customerId}</td>
                <td>#${o.sellerId}</td>
                <td>${formatCurrency(o.totalAmount)}</td>
                <td>${formatCurrency(o.platformCommission)}</td>
                <td><span class="badge badge--${(o.orderStatus||'').toLowerCase()}">${o.orderStatus}</span></td>
                <td>${formatDateTime(o.createdAt)}</td>
                <td class="table-actions">
                  <button class="btn btn--outline btn--sm" onclick="viewOrder(${o.orderId})">View</button>
                  ${o.orderStatus !== 'DELIVERED'
                    ? `<button class="btn btn--success btn--sm" onclick="forceDeliver(${o.orderId})">Deliver</button>`
                    : ''}
                  ${!isDone
                    ? `<button class="btn btn--danger btn--sm" onclick="cancelOrder(${o.orderId})">Cancel</button>`
                    : ''}
                </td>
              </tr>
            `
          }).join('')}
      </tbody>
    </table>
  `

  document.querySelectorAll('[data-filter]').forEach(b => {
    b.addEventListener('click', () => {
      ORDER_FILTER = b.getAttribute('data-filter')
      renderOrders()
    })
  })

  const s = document.getElementById('orderSearch')
  if (s) {
    s.addEventListener('input', (e) => {
      ORDER_SEARCH = e.target.value
      renderOrders()
    })
    s.focus()
    s.setSelectionRange(s.value.length, s.value.length)
  }
}

function viewOrder(id) {
  const o = ALL_ORDERS.find(x => x.orderId === id)
  if (!o) return
  const items = o.items || []
  const back = document.createElement('div')
  back.className = 'modal-backdrop'
  back.innerHTML = `
    <div class="modal" style="max-width:560px;">
      <div class="modal__title">Order LB${o.orderId}</div>
      <div class="modal__text">
        <span class="badge badge--${(o.orderStatus||'').toLowerCase()}">${o.orderStatus}</span>
        · placed ${formatDateTime(o.createdAt)}
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;margin-bottom:16px;">
        <div><strong>Customer:</strong> #${o.customerId}</div>
        <div><strong>Seller:</strong> #${o.sellerId}</div>
        <div><strong>Address:</strong> ${escapeHtml(o.deliveryAddress || '—')}</div>
      </div>

      <div style="font-weight:600;margin-bottom:8px;">Items</div>
      <table style="margin-bottom:16px;">
        <thead><tr><th>Dish</th><th>Qty</th><th>Total</th></tr></thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td>${escapeHtml(i.foodName)}</td>
              <td>${i.quantity}</td>
              <td>${formatCurrency(i.totalPrice)}</td>
            </tr>
          `).join('') || '<tr><td colspan="3">No items</td></tr>'}
        </tbody>
      </table>

      <div style="display:flex;justify-content:space-between;font-size:14px;padding-top:12px;border-top:1px solid var(--border-2);margin-bottom:6px;">
        <span>Food subtotal</span><span>${formatCurrency(o.foodSubtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;">
        <span>Delivery fee</span><span>${formatCurrency(o.deliveryFee)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;">
        <span>Platform commission</span><span>${formatCurrency(o.platformCommission)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;padding-top:8px;border-top:1px solid var(--border-2);">
        <span>Total</span><span>${formatCurrency(o.totalAmount)}</span>
      </div>

      <div class="modal__actions">
        <button class="btn btn--outline" data-close>Close</button>
      </div>
    </div>
  `
  document.body.appendChild(back)
  back.addEventListener('click', e => {
    if (e.target === back || e.target.hasAttribute('data-close')) back.remove()
  })
}

async function cancelOrder(id) {
  const ok = await showConfirm({
    title: 'Cancel this order?',
    message: 'Admin override — the order status will be set to CANCELLED.',
    confirmLabel: 'Cancel order',
  })
  if (!ok) return
  try {
    await api.put(`/api/orders/admin/${id}/cancel`)
    toast.success('Order cancelled')
    loadOrders()
  } catch (e) { toast.error(e.message) }
}

async function forceDeliver(id) {
  const ok = await showConfirm({
    title: 'Mark this order as delivered?',
    message: 'This bypasses the OTP flow. The customer will see the order as DELIVERED and seller earnings will be recorded.',
    confirmLabel: 'Mark delivered',
    variant: 'primary',
  })
  if (!ok) return
  try {
    await api.put(`/api/orders/admin/${id}/deliver`)
    toast.success('Order marked delivered')
    loadOrders()
  } catch (e) { toast.error(e.message) }
}

function exportOrdersCsv() {
  const rows = getFilteredOrders()
  exportCsv('localbite-orders.csv', rows, [
    { label: 'Order ID', get: o => 'LB' + o.orderId },
    { label: 'Customer', get: o => o.customerId },
    { label: 'Seller', get: o => o.sellerId },
    { label: 'Subtotal', get: o => o.foodSubtotal },
    { label: 'Delivery fee', get: o => o.deliveryFee },
    { label: 'Commission', get: o => o.platformCommission },
    { label: 'Total', get: o => o.totalAmount },
    { label: 'Status', get: o => o.orderStatus },
    { label: 'Placed', get: o => o.createdAt },
  ])
}

loadOrders()