const KEY = 'lb_guest_cart'

export function readGuestCart() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const items = JSON.parse(raw)
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function writeGuestCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function addGuestItem(food) {
  const items = readGuestCart()
  const existing = items.find((i) => i.foodId === food.foodId)
  if (existing) {
    existing.quantity += food.quantity || 1
  } else {
    items.push({
      foodId: food.foodId,
      foodName: food.foodName,
      price: food.price,
      sellerId: food.sellerId,
      quantity: food.quantity || 1,
    })
  }
  writeGuestCart(items)
  return items
}

export function updateGuestQuantity(foodId, quantity) {
  const items = readGuestCart()
  const item = items.find((i) => i.foodId === foodId)
  if (item) {
    item.quantity = quantity
    writeGuestCart(items)
  }
  return items
}

export function removeGuestItem(foodId) {
  const items = readGuestCart().filter((i) => i.foodId !== foodId)
  writeGuestCart(items)
  return items
}

export function clearGuestCart() {
  localStorage.removeItem(KEY)
}

export function groupGuestCart(items) {
  const map = new Map()
  for (const item of items) {
    if (!map.has(item.sellerId)) map.set(item.sellerId, [])
    map.get(item.sellerId).push({
      cartItemId: `guest-${item.foodId}`,
      foodId: item.foodId,
      foodName: item.foodName,
      price: item.price,
      quantity: item.quantity,
      lineTotal: Number(item.price) * item.quantity,
    })
  }
  const sellerGroups = Array.from(map.entries()).map(([sellerId, items]) => ({
    sellerId,
    items,
    sellerSubtotal: items.reduce((s, i) => s + i.lineTotal, 0),
  }))
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const cartSubtotal = items.reduce((s, i) => s + i.lineTotal, 0)
  return { sellerGroups, totalItems, cartSubtotal }
}