import client from './axiosClient'

export const getProfile = (userId) =>
  client.get(`/api/users/${userId}`).then((r) => r.data)

export const createProfile = (userId, data) =>
  client.post(`/api/users/${userId}`, data).then((r) => r.data)

export const updateProfile = (userId, data) =>
  client.put(`/api/users/${userId}`, data).then((r) => r.data)

export const myProfile = () =>
  client.get('/api/users/me').then((r) => r.data)

export const listAddresses = (userId) =>
  client.get(`/api/users/${userId}/addresses`).then((r) => r.data)

export const addAddress = (userId, data) =>
  client.post(`/api/users/${userId}/addresses`, data).then((r) => r.data)

export const updateAddress = (userId, addressId, data) =>
  client.put(`/api/users/${userId}/addresses/${addressId}`, data).then((r) => r.data)

export const deleteAddress = (userId, addressId) =>
  client.delete(`/api/users/${userId}/addresses/${addressId}`).then((r) => r.data)