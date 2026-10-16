// src/utils/foodImageApi.js
// Fetches real matching food photos from TheMealDB — free, no key needed

const THEMEALDB_API = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
const CACHE_PREFIX = 'lb_food_img_'
const TIMEOUT_MS = 4000

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchFoodImageUrl(foodName) {
  if (!foodName || typeof foodName !== 'string') return null

  const cacheKey = CACHE_PREFIX + foodName.toLowerCase().trim()
  const cached = localStorage.getItem(cacheKey)
  if (cached !== null) return cached || null

  try {
    const res = await fetchWithTimeout(
      `${THEMEALDB_API}${encodeURIComponent(foodName)}`
    )
    const data = await res.json()

    if (data?.meals && data.meals.length > 0) {
      const url = data.meals[0].strMealThumb
      if (url) {
        localStorage.setItem(cacheKey, url)
        return url
      }
    }
    localStorage.setItem(cacheKey, '')
    return null
  } catch (err) {
    console.warn('[FoodImageAPI] failed for', foodName, err?.message || err)
    return null
  }
}

export async function fetchFoodImageWithFallbacks(foodName) {
  const attempts = [
    foodName,
    foodName.replace(/^(chicken|beef|lamb|veg|veg\.|paneer|masala|spicy|grilled|fried|fresh)\s+/i, ''),
    foodName.split(' ').slice(-1)[0],
    foodName.split(' ')[0],
  ].filter(Boolean)

  for (const name of attempts) {
    const url = await fetchFoodImageUrl(name)
    if (url) return url
  }
  return null
}