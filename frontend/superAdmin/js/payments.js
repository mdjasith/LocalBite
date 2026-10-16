(async () => {
  const wrap = document.getElementById('tableWrap')
  wrap.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading payments...</div>`
  let payments = []
  try {
    payments = await api.get('/api/payments')
    if (!Array.isArray(payments)) payments = []
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">Could not load</div><div>${escapeHtml(e.message)}</div></div>`
    return
  }

  const totalAmount = payments
    .filter(p => p.paymentStatus === 'SUCCESS')
    .reduce((s, p) => s + Number(p.amount || 0), 0)

  wrap.innerHTML = `
    <div class="table-toolbar">
      <div style="flex:1">
        <strong>${payments.length}</strong> payments ·
        <strong>${formatCurrency(totalAmount)}</strong> simulated GMV
      </div>
    </div>
    <table>
      <thead>
        <tr><th>Payment #</th><th>Order</th><th>Customer</th><th>Amount</th><th>Commission</th><th>Seller amount</th><th>Status</th><th>Date</th></tr>
      </thead>
      <tbody>
        ${payments.length === 0
          ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-state__icon">💳</div><div class="empty-state__title">No payments</div></div></td></tr>`
          : payments.map(p => `
            <tr>
              <td>#${p.paymentId}</td>
              <td>LB${p.orderId}</td>
              <td>#${p.customerId}</td>
              <td>${formatCurrency(p.amount)}</td>
              <td>${formatCurrency(p.platformCommission)}</td>
              <td>${formatCurrency(p.sellerAmount)}</td>
              <td><span class="badge badge--${(p.paymentStatus||'').toLowerCase() === 'success' ? 'success' : 'warning'}">${p.paymentStatus}</span></td>
              <td>${formatDateTime(p.createdAt)}</td>
            </tr>
          `).join('')}
      </tbody>
    </table>
  `
})()