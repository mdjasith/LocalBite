(async () => {
  const wrap = document.getElementById('tableWrap')
  wrap.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading...</div>`
  let list = []
  try {
    list = await api.get('/api/commissions')
    if (!Array.isArray(list)) list = []
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">Could not load</div><div>${escapeHtml(e.message)}</div></div>`
    return
  }

  const totalCommission = list.reduce((s, c) => s + Number(c.commissionAmount || 0), 0)
  const totalSellerPayout = list.reduce((s, c) => s + Number(c.sellerAmount || 0), 0)

  wrap.innerHTML = `
    <div class="table-toolbar">
      <div style="flex:1">
        <strong>${list.length}</strong> entries ·
        Platform earned: <strong style="color:var(--success)">${formatCurrency(totalCommission)}</strong> ·
        Seller payouts: <strong>${formatCurrency(totalSellerPayout)}</strong>
      </div>
    </div>
    <table>
      <thead>
        <tr><th>Comm #</th><th>Order</th><th>Seller</th><th>Subtotal</th><th>Rate</th><th>Platform</th><th>Seller</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${list.length === 0
          ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-state__icon">💰</div><div class="empty-state__title">No commissions</div></div></td></tr>`
          : list.map(c => `
            <tr>
              <td>#${c.commissionId}</td>
              <td>LB${c.orderId}</td>
              <td>#${c.sellerId}</td>
              <td>${formatCurrency(c.foodSubtotal)}</td>
              <td>${c.commissionPercentage}%</td>
              <td style="color:var(--success);font-weight:600">${formatCurrency(c.commissionAmount)}</td>
              <td>${formatCurrency(c.sellerAmount)}</td>
              <td><span class="badge badge--${(c.commissionStatus||'').toLowerCase() === 'settled' ? 'success' : 'neutral'}">${c.commissionStatus}</span></td>
            </tr>
          `).join('')}
      </tbody>
    </table>
  `
})()