import client from './axiosClient'

export const myWallet = () =>
  client.get('/api/wallets/me').then((r) => r.data)

export const myTransactions = () =>
  client.get('/api/wallets/me/transactions').then((r) => r.data)

export const creditWallet = (data) =>
  client.post('/api/wallets/credit', data).then((r) => r.data)

export const getWallet = (userId, walletType) =>
  client.get(`/api/wallets/${userId}?walletType=${walletType}`).then((r) => r.data)