export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
}

export const ORDER_STATUS = {
  PLACED: 'PLACED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  OTP_VERIFICATION: 'OTP_VERIFICATION',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
}

export const ORDER_TIMELINE = [
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

export const ORDER_STATUS_LABEL = {
  PLACED: 'Order Placed',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  OTP_VERIFICATION: 'OTP Verification',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
}

export const FOOD_TYPES = {
  VEG: 'VEG',
  NON_VEG: 'NON_VEG',
  EGG: 'EGG',
}

export const SELLER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  BLOCKED: 'BLOCKED',
}

export const OPERATING_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
}

export const DEFAULT_LOCATION = {
  latitude: 12.9716,
  longitude: 80.2447,
  address: 'Perungudi, Chennai',
}

export const PAYMENT_METHODS = [
  { id: 'SIMULATED_WALLET', label: 'LocalBite Demo Wallet' },
]

export const UPI_BRANDS = [
  { id: 'gpay', name: 'GPay', color: '#16A34A', letter: 'G' },
  { id: 'phonepe', name: 'PhonePay', color: '#7C3AED', letter: 'P' },
  { id: 'paytm', name: 'Paytm', color: '#2563EB', letter: 'P' },
  { id: 'wallet', name: 'LocalBite Wallet', color: '#FF5C39', letter: 'LB' },
]