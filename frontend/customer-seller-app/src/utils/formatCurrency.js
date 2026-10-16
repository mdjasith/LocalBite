export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0.00'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(n)) return '₹0.00'
  return (
    '₹' +
    n.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export function formatCurrencyShort(amount) {
  if (amount === null || amount === undefined) return '₹0'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(n)) return '₹0'
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}