import client from './axiosClient'

export const registerSeller = (data) =>
  client.post('/api/sellers/register', data).then((r) => r.data)

export const getMySeller = () =>
  client.get('/api/sellers/me').then((r) => r.data)

export const getSeller = (sellerId) =>
  client.get(`/api/sellers/${sellerId}`).then((r) => r.data)

export const listSellers = () =>
  client.get('/api/sellers').then((r) => r.data)

export const listSellersWithLocations = () =>
  client.get('/api/sellers/with-locations').then((r) => r.data)

export const updateSeller = (sellerId, data) =>
  client.put(`/api/sellers/${sellerId}`, data).then((r) => r.data)

export const updateOperatingStatus = (sellerId, operatingStatus) =>
  client.put(`/api/sellers/${sellerId}/operating-status`, { operatingStatus }).then((r) => r.data)

export const setSellerLocation = (sellerId, data) =>
  client.post(`/api/sellers/${sellerId}/location`, data).then((r) => r.data)

export const getSellerLocation = (sellerId) =>
  client.get(`/api/sellers/${sellerId}/location`).then((r) => r.data)