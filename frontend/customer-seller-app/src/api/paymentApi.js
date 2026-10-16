import client from './axiosClient'

export const processPayment = (data) =>
  client.post('/api/payments/process', data).then((r) => r.data)

export const myPayments = () =>
  client.get('/api/payments/me').then((r) => r.data)

export const paymentByOrder = (orderId) =>
  client.get(`/api/payments/order/${orderId}`).then((r) => r.data)

export const refundPayment = (paymentId) =>
  client.put(`/api/payments/${paymentId}/refund`).then((r) => r.data)

export const refundByOrder = (orderId) =>
  client.put(`/api/payments/order/${orderId}/refund`).then((r) => r.data)