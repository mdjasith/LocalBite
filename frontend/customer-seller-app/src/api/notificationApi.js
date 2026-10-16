import client from './axiosClient'

export const myNotifications = () =>
  client.get('/api/notifications/me').then((r) => r.data)

export const myUnreadNotifications = () =>
  client.get('/api/notifications/me/unread').then((r) => r.data)

export const unreadCount = () =>
  client.get('/api/notifications/me/unread-count').then((r) => r.data)

export const markRead = (notificationId) =>
  client.put(`/api/notifications/me/${notificationId}/read`).then((r) => r.data)

export const markAllRead = () =>
  client.put('/api/notifications/me/read-all').then((r) => r.data)

export const deleteNotification = (notificationId) =>
  client.delete(`/api/notifications/me/${notificationId}`).then((r) => r.data)