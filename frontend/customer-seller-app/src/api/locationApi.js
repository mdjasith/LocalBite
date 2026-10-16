import client from './axiosClient'

export const nearbySellers = (latitude, longitude, radiusKm = 10) =>
  client
    .post('/api/locations/nearby-sellers', { latitude, longitude, radiusKm })
    .then((r) => r.data)

export const distance = (fromLat, fromLng, toLat, toLng) =>
  client
    .get(
      `/api/locations/distance?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`
    )
    .then((r) => r.data)