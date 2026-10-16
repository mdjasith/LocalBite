(async () => {
  const statsEl = document.getElementById('stats')
  const pendingWrap = document.getElementById('pendingSellersWrap')
  const ordersWrap = document.getElementById('recentOrdersWrap')

  statsEl.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading metrics...</div>`

  let sellers = []
  let orders = []
  let payments = []
  let commissions = []

  try {
    const results = await Promise.allSettled([
      api.get('/api/sellers/admin/all'),
      api.get('/api/orders/admin/all'),
      api.get('/api/payments'),
      api.get('/api/commissions'),
    ])
    sellers = results[0].status === 'fulfilled' ? (results[0].value || []) : []
    orders = results[1].status === 'fulfilled' ? (results[1].value || []) : []
    payments = results[2].status === 'fulfilled' ? (results[2].value || []) : []
    commissions = results[3].status === 'fulfilled' ? (results[3].value || []) : []
  } catch (e) {
    toast.error('Could not load dashboard')
  }

  const totalSellers = sellers.length
  const pendingSellers = sellers.filter(s => s.sellerStatus === 'PENDING').length
  const totalOrders = orders.length
  const successPayments = payments.filter(p => p.paymentStatus === 'SUCCESS')
  const gmv = successPayments.reduce((s, p) => s + Number(p.amount || 0), 0)
  const commissionEarned = commissions.reduce((s, c) => s + Number(c.commissionAmount || 0), 0)

  const statCards = [
    { label: 'Total sellers', value: totalSellers, sub: `${pendingSellers} pending approval`,
      icon: '🏪', color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Total orders', value: totalOrders,
      sub: `${orders.filter(o => ['PLACED','ACCEPTED','PREPARING','READY','OUT_FOR_DELIVERY'].includes(o.orderStatus)).length} active`,
      icon: '📦', color: '#F59E0B', bg: 'var(--warning-bg)' },
    { label: 'Simulated GMV', value: formatCurrency(gmv),
      sub: `${successPayments.length} successful payments`,
      icon: '💳', color: '#10B981', bg: 'var(--success-bg)' },
    { label: 'Commission earned', value: formatCurrency(commissionEarned),
      sub: '10% platform cut',
      icon: '💰', color: '#FF5C39', bg: 'var(--brand-light)' },
  ]

  statsEl.innerHTML = statCards.map(c => `
    <div class="stat-card">
      <div class="stat-card__header">
        <div class="stat-card__label">${c.label}</div>
        <div class="stat-card__icon" style="background:${c.bg};color:${c.color}">${c.icon}</div>
      </div>
      <div class="stat-card__value">${c.value}</div>
      <div class="stat-card__sub">${c.sub}</div>
    </div>
  `).join('')

  const pendingList = sellers.filter(s => s.sellerStatus === 'PENDING').slice(0, 5)
  if (pendingList.length === 0) {
    pendingWrap.innerHTML = `<div class="empty-state"><div class="empty-state__icon">✓</div><div class="empty-state__title">No pending applications</div><div>All seller applications have been reviewed.</div></div>`
  } else {
    pendingWrap.innerHTML = `
      <table>
        <thead><tr><th>Store</th><th>Owner</th><th>Email</th><th>Applied</th><th></th></tr></thead>
        <tbody>
          ${pendingList.map(s => `
            <tr>
              <td><strong>${escapeHtml(s.storeName)}</strong></td>
              <td>${escapeHtml(s.ownerName)}</td>
              <td>${escapeHtml(s.email)}</td>
              <td>${formatDate(s.createdAt)}</td>
              <td class="table-actions">
                <button class="btn btn--success btn--sm" onclick="approveFromDash(${s.sellerId})">Approve</button>
                <button class="btn btn--outline btn--sm" onclick="rejectFromDash(${s.sellerId})">Reject</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  const recentOrders = orders.slice(0, 6)
  if (recentOrders.length === 0) {
    ordersWrap.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📦</div><div class="empty-state__title">No orders yet</div></div>`
  } else {
    ordersWrap.innerHTML = `
      <table>
        <thead><tr><th>Order #</th><th>Customer</th><th>Seller</th><th>Amount</th><th>Status</th><th>Placed</th></tr></thead>
        <tbody>
          ${recentOrders.map(o => `
            <tr>
              <td><strong>LB${o.orderId}</strong></td>
              <td>#${o.customerId}</td>
              <td>#${o.sellerId}</td>
              <td>${formatCurrency(o.totalAmount)}</td>
              <td><span class="badge badge--${(o.orderStatus||'').toLowerCase()}">${o.orderStatus}</span></td>
              <td>${formatDateTime(o.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  }

  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    last7.push({ date: d, key, count: 0 })
  }
  orders.forEach(o => {
    if (!o.createdAt) return
    const k = o.createdAt.slice(0, 10)
    const slot = last7.find(x => x.key === k)
    if (slot) slot.count++
  })

  new Chart(document.getElementById('ordersChart'), {
    type: 'line',
    data: {
      labels: last7.map(x => x.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
      datasets: [{
        label: 'Orders',
        data: last7.map(x => x.count),
        borderColor: '#FF5C39',
        backgroundColor: 'rgba(255,92,57,0.12)',
        fill: true, tension: 0.4, borderWidth: 2.5,
        pointBackgroundColor: '#FF5C39',
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  })

  const statusCounts = {}
  orders.forEach(o => { statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1 })
  const statusLabels = Object.keys(statusCounts)
  const statusValues = statusLabels.map(k => statusCounts[k])
  const palette = {
    PLACED: '#3B82F6', ACCEPTED: '#6366F1', PREPARING: '#F59E0B',
    READY: '#F97316', OUT_FOR_DELIVERY: '#8B5CF6', DELIVERED: '#10B981',
    CANCELLED: '#EF4444', FAILED: '#991B1B',
  }
  new Chart(document.getElementById('statusChart'), {
    type: 'doughnut',
    data: {
      labels: statusLabels,
      datasets: [{
        data: statusValues,
        backgroundColor: statusLabels.map(l => palette[l] || '#94A3B8'),
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } },
    },
  })
})()

async function approveFromDash(id) {
  try {
    await api.put(`/api/sellers/admin/${id}/approve`)
    toast.success('Seller approved')
    setTimeout(() => location.reload(), 600)
  } catch (e) { toast.error(e.message) }
}

async function rejectFromDash(id) {
  const ok = await showConfirm({
    title: 'Reject this seller?',
    message: 'The seller will not be able to sell on LocalBite.',
    confirmLabel: 'Reject',
  })
  if (!ok) return
  try {
    await api.put(`/api/sellers/admin/${id}/reject`)
    toast.success('Seller rejected')
    setTimeout(() => location.reload(), 600)
  } catch (e) { toast.error(e.message) }
}