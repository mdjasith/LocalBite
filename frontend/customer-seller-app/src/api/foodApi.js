import client from './axiosClient'

export const listFoods = () =>
  client.get('/api/foods').then((r) => r.data)

export const getFood = (foodId) =>
  client.get(`/api/foods/${foodId}`).then((r) => r.data)

export const foodsBySeller = (sellerId) =>
  client.get(`/api/foods/seller/${sellerId}`).then((r) => r.data)

export const foodsByCategory = (categoryId) =>
  client.get(`/api/foods/category/${categoryId}`).then((r) => r.data)

export const searchFoods = (keyword) =>
  client.get(`/api/foods/search?keyword=${encodeURIComponent(keyword)}`).then((r) => r.data)

export const createFood = (data) =>
  client.post('/api/foods', data).then((r) => r.data)

export const updateFood = (foodId, data) =>
  client.put(`/api/foods/${foodId}`, data).then((r) => r.data)

export const deleteFood = (foodId) =>
  client.delete(`/api/foods/${foodId}`).then((r) => r.data)

export const toggleAvailability = (foodId) =>
  client.put(`/api/foods/${foodId}/availability`).then((r) => r.data)

export const updateStock = (foodId, stockQuantity) =>
  client.put(`/api/foods/${foodId}/stock`, { stockQuantity }).then((r) => r.data)

export const listCategories = () =>
  client.get('/api/categories').then((r) => r.data)

export const getCategory = (categoryId) =>
  client.get(`/api/categories/${categoryId}`).then((r) => r.data)

export const createCategory = (data) =>
  client.post('/api/categories', data).then((r) => r.data)