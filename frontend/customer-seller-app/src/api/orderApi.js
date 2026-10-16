import client from './axiosClient'

export const placeOrder = (data) =>
  client.post('/api/orders/place', data).then((r) => r.data)

export const myOrders = () =>
  client.get('/api/orders/me').then((r) => r.data)

export const getOrder = (orderId) =>
  client.get(`/api/orders/${orderId}`).then((r) => r.data)

export const updateOrderStatus = (orderId, status) =>
  client.put(`/api/orders/${orderId}/status`, { status }).then((r) => r.data)

export const cancelOrder = (orderId) =>
  client.put(`/api/orders/${orderId}/cancel`).then((r) => r.data)

export const viewOrderOtp = (orderId) =>
  client.get(`/api/orders/${orderId}/view-otp`).then((r) => r.data)

export const verifyDelivery = (orderId, otp) =>
  client.post(`/api/orders/${orderId}/verify-delivery`, { otp }).then((r) => r.data)