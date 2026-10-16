(async () => {
  const wrap = document.getElementById('tableWrap')
  wrap.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading reviews...</div>`
  let list = []
  try {
    list = await api.get('/api/reviews')
    if (!Array.isArray(list)) list = []
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">Could not load</div><div>${escapeHtml(e.message)}</div></div>`
    return
  }

  wrap.innerHTML = `
    <table>
      <thead><tr><th>Food</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Visible</th><th>Date</th><th></th></tr></thead>
      <tbody>
        ${list.length === 0
          ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-state__icon">⭐</div><div class="empty-state__title">No reviews</div></div></td></tr>`
          : list.map(r => `
            <tr>
              <td>#${r.foodId}</td>
              <td>#${r.customerId}</td>
              <td>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
              <td>${escapeHtml(r.reviewText || '—')}</td>
              <td>${r.isVisible ? '✅' : '❌'}</td>
              <td>${formatDate(r.createdAt)}</td>
              <td class="table-actions">
                <button class="btn btn--outline btn--sm" onclick="toggleReview(${r.reviewId})">
                  ${r.isVisible ? 'Hide' : 'Show'}
                </button>
              </td>
            </tr>
          `).join('')}
      </tbody>
    </table>
  `
})()

async function toggleReview(id) {
  try {
    await api.put(`/api/reviews/admin/${id}/hide`)
    toast.success('Visibility toggled')
    setTimeout(() => location.reload(), 500)
  } catch (e) { toast.error(e.message) }
}