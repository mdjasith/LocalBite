(async () => {
  const [payments, commissions] = await Promise.all([
    api.get('/api/payments').catch(() => []),
    api.get('/api/commissions').catch(() => []),
  ])
  const success = (payments || []).filter(p => p.paymentStatus === 'SUCCESS')

  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    last7.push({ date: d, key, value: 0 })
  }
  success.forEach(p => {
    if (!p.createdAt) return
    const k = p.createdAt.slice(0, 10)
    const slot = last7.find(x => x.key === k)
    if (slot) slot.value += Number(p.amount || 0)
  })

  new Chart(document.getElementById('revChart'), {
    type: 'bar',
    data: {
      labels: last7.map(x => x.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
      datasets: [{
        label: 'Revenue',
        data: last7.map(x => x.value),
        backgroundColor: '#FF5C39',
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  })

  const bySeller = {}
  ;(commissions || []).forEach(c => {
    bySeller[c.sellerId] = (bySeller[c.sellerId] || 0) + Number(c.sellerAmount || 0)
  })
  const top = Object.entries(bySeller).sort((a, b) => b[1] - a[1]).slice(0, 5)

  new Chart(document.getElementById('sellerChart'), {
    type: 'bar',
    data: {
      labels: top.map(t => 'Seller #' + t[0]),
      datasets: [{
        label: 'Earnings',
        data: top.map(t => t[1]),
        backgroundColor: '#10B981',
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } },
    },
  })
})()