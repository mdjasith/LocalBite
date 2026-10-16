import client from './axiosClient'

export const createReview = (data) =>
  client.post('/api/reviews', data).then((r) => r.data)

export const myReviews = () =>
  client.get('/api/reviews/me').then((r) => r.data)

export const reviewsBySeller = (sellerId) =>
  client.get(`/api/reviews/seller/${sellerId}`).then((r) => r.data)

export const reviewsByFood = (foodId) =>
  client.get(`/api/reviews/food/${foodId}`).then((r) => r.data)

export const reviewsByOrder = (orderId) =>
  client.get(`/api/reviews/order/${orderId}`).then((r) => r.data)

export const sellerRating = (sellerId) =>
  client.get(`/api/reviews/seller/${sellerId}/summary`).then((r) => r.data)

export const foodRating = (foodId) =>
  client.get(`/api/reviews/food/${foodId}/summary`).then((r) => r.data)

export const deleteReview = (reviewId) =>
  client.delete(`/api/reviews/${reviewId}`).then((r) => r.data)