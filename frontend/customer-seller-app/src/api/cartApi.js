import client from './axiosClient'

export const myCart = () =>
  client.get('/api/carts/me').then((r) => r.data)

export const addItem = (foodId, quantity) =>
  client.post('/api/carts/me/items', { foodId, quantity }).then((r) => r.data)

export const updateQuantity = (cartItemId, quantity) =>
  client.put(`/api/carts/me/items/${cartItemId}`, { quantity }).then((r) => r.data)

export const removeItem = (cartItemId) =>
  client.delete(`/api/carts/me/items/${cartItemId}`).then((r) => r.data)

export const clearCart = () =>
  client.delete('/api/carts/me').then((r) => r.data)