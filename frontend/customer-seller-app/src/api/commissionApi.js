import client from './axiosClient'

export const myCommissions = () =>
  client.get('/api/commissions/me').then((r) => r.data)

export const mySummary = () =>
  client.get('/api/commissions/me/summary').then((r) => r.data)

export const commissionByOrder = (orderId) =>
  client.get(`/api/commissions/order/${orderId}`).then((r) => r.data)