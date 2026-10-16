import client from './axiosClient'

export const getDeliveryByOrder = (orderId) =>
  client.get(`/api/deliveries/order/${orderId}`).then((r) => r.data)

export const generateOtp = (orderId) =>
  client.post(`/api/deliveries/order/${orderId}/generate-otp`).then((r) => r.data)

export const verifyOtp = (orderId, otp) =>
  client.post(`/api/deliveries/order/${orderId}/verify-otp`, { otp }).then((r) => r.data)

export const updateDeliveryStatus = (orderId, status) =>
  client.put(`/api/deliveries/order/${orderId}/status`, { status }).then((r) => r.data)