let ALL_FOODS = []
let ALL_CATEGORIES = []
let ALL_SELLERS = []
let FOOD_SEARCH = ''

async function loadFoods() {
  const wrap = document.getElementById('tableWrap')
  wrap.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading foods...</div>`
  try {
    const [foods, cats, sellers] = await Promise.all([
      api.get('/api/foods').catch(() => []),
      api.get('/api/categories/all').catch(() => []),
      api.get('/api/sellers/admin/all').catch(() => []),
    ])
    ALL_FOODS = Array.isArray(foods) ? foods : []
    ALL_CATEGORIES = Array.isArray(cats) ? cats : []
    ALL_SELLERS = Array.isArray(sellers) ? sellers : []
    renderFoods()
  } catch (e) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">Could not load</div><div>${escapeHtml(e.message)}</div></div>`
  }
}

function getFilteredFoods() {
  if (!FOOD_SEARCH) return ALL_FOODS
  const q = FOOD_SEARCH.toLowerCase()
  return ALL_FOODS.filter(f =>
    (f.foodName || '').toLowerCase().includes(q)
  )
}

function renderFoods() {
  const wrap = document.getElementById('tableWrap')
  const filtered = getFilteredFoods()

  wrap.innerHTML = `
    <div class="table-toolbar">
      <div class="table-toolbar__search">
        <input id="foodSearch" placeholder="Search by name..." value="${escapeHtml(FOOD_SEARCH)}" />
      </div>
      <div style="font-size:13px;color:var(--text-3)">${filtered.length} of ${ALL_FOODS.length} dishes</div>
      <button class="btn btn--outline btn--sm" onclick="exportFoodsCsv()">Export CSV</button>
      <button class="btn btn--primary btn--sm" onclick="openFoodModal()">+ New dish</button>
    </div>
    <table>
      <thead><tr>
        <th>ID</th><th>Dish</th><th>Seller</th><th>Category</th>
        <th>Price</th><th>Stock</th><th>Type</th><th>Available</th><th></th>
      </tr></thead>
      <tbody>
        ${filtered.length === 0
          ? `<tr><td colspan="9"><div class="empty-state"><div class="empty-state__icon">🍽️</div><div class="empty-state__title">No dishes</div></div></td></tr>`
          : filtered.map(f => {
            const seller = ALL_SELLERS.find(s => s.sellerId === f.sellerId)
            const cat = ALL_CATEGORIES.find(c => c.categoryId === f.categoryId)
            return `
              <tr>
                <td>#${f.foodId}</td>
                <td><strong>${escapeHtml(f.foodName)}</strong></td>
                <td>${seller ? escapeHtml(seller.storeName) : '#' + f.sellerId}</td>
                <td>${cat ? escapeHtml(cat.categoryName) : '#' + f.categoryId}</td>
                <td>${formatCurrency(f.price)}</td>
                <td>${f.stockQuantity}</td>
                <td><span class="badge badge--${f.foodType === 'VEG' ? 'success' : 'danger'}">${f.foodType}</span></td>
                <td>${f.isAvailable ? '✅' : '❌'}</td>
                <td class="table-actions">
                  <button class="btn btn--outline btn--sm" onclick="openFoodModal(${f.foodId})">Edit</button>
                  <button class="btn btn--danger btn--sm" onclick="deleteFood(${f.foodId})">Delete</button>
                </td>
              </tr>
            `
          }).join('')}
      </tbody>
    </table>
  `

  const s = document.getElementById('foodSearch')
  if (s) {
    s.addEventListener('input', (e) => {
      FOOD_SEARCH = e.target.value
      renderFoods()
    })
    s.focus()
    s.setSelectionRange(s.value.length, s.value.length)
  }
}

function openFoodModal(id = null) {
  const food = id ? ALL_FOODS.find(f => f.foodId === id) : null
  const isEdit = !!food

  const sellerOptions = ALL_SELLERS
    .filter(s => s.sellerStatus === 'APPROVED' || (food && s.sellerId === food.sellerId))
    .map(s => `<option value="${s.sellerId}" ${food?.sellerId === s.sellerId ? 'selected' : ''}>${escapeHtml(s.storeName)} (#${s.sellerId})</option>`)
    .join('')

  const catOptions = ALL_CATEGORIES
    .map(c => `<option value="${c.categoryId}" ${food?.categoryId === c.categoryId ? 'selected' : ''}>${escapeHtml(c.categoryName)}</option>`)
    .join('')

  const back = document.createElement('div')
  back.className = 'modal-backdrop'
  back.innerHTML = `
    <div class="modal" style="max-width:560px;">
      <div class="modal__title">${isEdit ? 'Edit dish #' + food.foodId : 'New dish'}</div>
      <div style="margin-top:20px;">
        <div class="field">
          <label class="field__label">Seller</label>
          <select id="fSeller" class="field__select">
            <option value="">— select seller —</option>
            ${sellerOptions}
          </select>
        </div>
        <div class="field">
          <label class="field__label">Category</label>
          <select id="fCategory" class="field__select">
            <option value="">— select category —</option>
            ${catOptions}
          </select>
        </div>
        <div class="field">
          <label class="field__label">Dish name</label>
          <input id="fName" class="field__input" value="${food ? escapeHtml(food.foodName) : ''}" />
        </div>
        <div class="field">
          <label class="field__label">Description</label>
          <textarea id="fDesc" class="field__textarea" rows="3">${food ? escapeHtml(food.description || '') : ''}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="field">
            <label class="field__label">Price (₹)</label>
            <input id="fPrice" type="number" step="0.01" class="field__input" value="${food ? food.price : ''}" />
          </div>
          <div class="field">
            <label class="field__label">Stock</label>
            <input id="fStock" type="number" class="field__input" value="${food ? food.stockQuantity : ''}" />
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="field">
            <label class="field__label">Prep time (min)</label>
            <input id="fPrep" type="number" class="field__input" value="${food ? food.preparationTimeMinutes : ''}" />
          </div>
          <div class="field">
            <label class="field__label">Food type</label>
            <select id="fType" class="field__select">
              <option value="VEG" ${food?.foodType === 'VEG' ? 'selected' : ''}>VEG</option>
              <option value="NON_VEG" ${food?.foodType === 'NON_VEG' ? 'selected' : ''}>NON_VEG</option>
              <option value="EGG" ${food?.foodType === 'EGG' ? 'selected' : ''}>EGG</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label class="field__label">Image URL (optional)</label>
          <input id="fImage" class="field__input" value="${food ? escapeHtml(food.imageUrl || '') : ''}" />
        </div>
      </div>
      <div class="modal__actions">
        <button class="btn btn--ghost" data-close>Cancel</button>
        <button class="btn btn--primary" id="fSave">${isEdit ? 'Save changes' : 'Create dish'}</button>
      </div>
    </div>
  `
  document.body.appendChild(back)
  back.querySelector('[data-close]').addEventListener('click', () => back.remove())
  back.addEventListener('click', e => { if (e.target === back) back.remove() })

  back.querySelector('#fSave').addEventListener('click', async () => {
    const body = {
      sellerId: Number(back.querySelector('#fSeller').value),
      categoryId: Number(back.querySelector('#fCategory').value),
      foodName: back.querySelector('#fName').value.trim(),
      description: back.querySelector('#fDesc').value.trim(),
      price: Number(back.querySelector('#fPrice').value),
      stockQuantity: Number(back.querySelector('#fStock').value),
      preparationTimeMinutes: Number(back.querySelector('#fPrep').value),
      foodType: back.querySelector('#fType').value,
      imageUrl: back.querySelector('#fImage').value.trim() || null,
    }
    if (!body.sellerId || !body.categoryId || !body.foodName || !body.price || !body.preparationTimeMinutes) {
      toast.error('Fill seller, category, name, price, prep time')
      return
    }
    try {
      if (isEdit) {
        await api.put(`/api/foods/admin/${food.foodId}`, body)
        toast.success('Dish updated')
      } else {
        await api.post('/api/foods/admin', body)
        toast.success('Dish created')
      }
      back.remove()
      loadFoods()
    } catch (e) { toast.error(e.message) }
  })
}

async function deleteFood(id) {
  const ok = await showConfirm({
    title: 'Delete this dish?',
    message: 'This removes the dish permanently.',
    confirmLabel: 'Delete',
  })
  if (!ok) return
  try {
    await api.del(`/api/foods/admin/${id}`)
    toast.success('Dish deleted')
    loadFoods()
  } catch (e) { toast.error(e.message) }
}

function exportFoodsCsv() {
  const rows = getFilteredFoods()
  exportCsv('localbite-foods.csv', rows, [
    { label: 'ID', get: f => f.foodId },
    { label: 'Name', get: f => f.foodName },
    { label: 'Seller', get: f => f.sellerId },
    { label: 'Category', get: f => f.categoryId },
    { label: 'Price', get: f => f.price },
    { label: 'Stock', get: f => f.stockQuantity },
    { label: 'Type', get: f => f.foodType },
    { label: 'Available', get: f => f.isAvailable },
  ])
}

loadFoods()