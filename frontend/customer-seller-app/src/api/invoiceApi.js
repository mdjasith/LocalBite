import client from './axiosClient'

export const generateInvoice = (data) =>
  client.post('/api/invoices/generate', data).then((r) => r.data)

export const invoiceByOrder = (orderId) =>
  client.get(`/api/invoices/order/${orderId}`).then((r) => r.data)

export const invoiceByNumber = (invoiceNumber) =>
  client.get(`/api/invoices/number/${invoiceNumber}`).then((r) => r.data)

export const myInvoices = () =>
  client.get('/api/invoices/me').then((r) => r.data)

export const downloadInvoice = (orderId) =>
  client
    .get(`/api/invoices/order/${orderId}/download`, { responseType: 'blob' })
    .then((r) => r.data)