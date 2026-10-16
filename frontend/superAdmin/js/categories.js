let ALL_CATS = []

async function loadCats() {
  const wrap = document.getElementById('tableWrap')
  wrap.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading...</div>`
  try {
    ALL_CATS = await api.get('/api/categories/all')
    if (!Array.isArray(ALL_CATS)) ALL_CATS = []
    renderCats()
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">Could not load</div><div>${escapeHtml(e.message)}</div></div>`
  }
}

function renderCats() {
  const wrap = document.getElementById('tableWrap')
  wrap.innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Active</th><th></th></tr></thead>
      <tbody>
        ${ALL_CATS.length === 0
          ? `<tr><td colspan="5"><div class="empty-state"><div class="empty-state__icon">📁</div><div class="empty-state__title">No categories</div></div></td></tr>`
          : ALL_CATS.map(c => `
            <tr>
              <td>#${c.categoryId}</td>
              <td><strong>${escapeHtml(c.categoryName)}</strong></td>
              <td>${escapeHtml(c.description || '—')}</td>
              <td>${c.isActive ? '✅' : '❌'}</td>
              <td class="table-actions">
                <button class="btn btn--outline btn--sm" onclick="editCat(${c.categoryId})">Edit</button>
                <button class="btn btn--outline btn--sm" onclick="toggleCat(${c.categoryId})">
                  ${c.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn--danger btn--sm" onclick="deleteCat(${c.categoryId})">Delete</button>
              </td>
            </tr>
          `).join('')}
      </tbody>
    </table>
  `
}

function openCategoryModal(cat = null) {
  const back = document.createElement('div')
  back.className = 'modal-backdrop'
  back.innerHTML = `
    <div class="modal">
      <div class="modal__title">${cat ? 'Edit category' : 'New category'}</div>
      <div style="margin-top:20px;">
        <div class="field">
          <label class="field__label">Name</label>
          <input id="catName" class="field__input" value="${cat ? escapeHtml(cat.categoryName) : ''}" />
        </div>
        <div class="field">
          <label class="field__label">Description</label>
          <input id="catDesc" class="field__input" value="${cat ? escapeHtml(cat.description || '') : ''}" />
        </div>
      </div>
      <div class="modal__actions">
        <button class="btn btn--ghost" data-close>Cancel</button>
        <button class="btn btn--primary" id="catSave">Save</button>
      </div>
    </div>
  `
  document.body.appendChild(back)
  back.querySelector('[data-close]').addEventListener('click', () => back.remove())
  back.addEventListener('click', e => { if (e.target === back) back.remove() })

  back.querySelector('#catSave').addEventListener('click', async () => {
    const name = back.querySelector('#catName').value.trim()
    const desc = back.querySelector('#catDesc').value.trim()
    if (!name) return toast.error('Name required')
    try {
      if (cat) await api.put(`/api/categories/${cat.categoryId}`, { categoryName: name, description: desc })
      else await api.post('/api/categories', { categoryName: name, description: desc })
      toast.success('Saved')
      back.remove()
      loadCats()
    } catch (e) { toast.error(e.message) }
  })
}

function editCat(id) {
  const cat = ALL_CATS.find(c => c.categoryId === id)
  if (cat) openCategoryModal(cat)
}

async function toggleCat(id) {
  try {
    await api.put(`/api/categories/${id}/toggle`)
    toast.success('Updated')
    loadCats()
  } catch (e) { toast.error(e.message) }
}

async function deleteCat(id) {
  const ok = await showConfirm({ title: 'Delete this category?', message: 'Foods in this category will lose their category link.' })
  if (!ok) return
  try {
    await api.del(`/api/categories/${id}`)
    toast.success('Deleted')
    loadCats()
  } catch (e) { toast.error(e.message) }
}

loadCats()