export function GpayLogo({ size = 44 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width={size} height={size}>
      <circle cx="20" cy="20" r="20" fill="#fff" />
      <g transform="translate(8 8)">
        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
        <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
      </g>
    </svg>
  )
}

export function PhonePeLogo({ size = 44 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width={size} height={size}>
      <rect width="40" height="40" rx="9" fill="#5F259F" />
      <text x="20" y="27" textAnchor="middle" fontFamily="Plus Jakarta Sans, Arial, sans-serif" fontSize="18" fontWeight="800" fill="#fff">Pe</text>
    </svg>
  )
}

export function PaytmLogo({ size = 44 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width={size} height={size}>
      <rect width="40" height="40" rx="9" fill="#fff" stroke="#E5E7EB" />
      <rect x="0" y="0" width="40" height="10" fill="#00BAF2" rx="9" />
      <rect x="0" y="6" width="40" height="6" fill="#00BAF2" />
      <text x="20" y="30" textAnchor="middle" fontFamily="Plus Jakarta Sans, Arial, sans-serif" fontSize="12" fontWeight="800" fill="#002970">Paytm</text>
    </svg>
  )
}

export function BhimLogo({ size = 44 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width={size} height={size}>
      <rect width="40" height="40" rx="9" fill="#fff" stroke="#E5E7EB" />
      <path d="M10 30 L10 12 L16 12 C20 12 22 14 22 17 C22 19 21 20.5 19 21 C21.5 21.5 23 23 23 26 C23 29 21 30 17 30 Z" fill="#FF6B00" />
      <text x="30" y="30" textAnchor="middle" fontFamily="Plus Jakarta Sans, Arial, sans-serif" fontSize="9" fontWeight="800" fill="#00875A">UPI</text>
    </svg>
  )
}

export function AmazonPayLogo({ size = 44 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width={size} height={size}>
      <rect width="40" height="40" rx="9" fill="#fff" stroke="#E5E7EB" />
      <text x="20" y="22" textAnchor="middle" fontFamily="Plus Jakarta Sans, Arial, sans-serif" fontSize="11" fontWeight="800" fill="#232F3E">amazon</text>
      <path d="M10 26 C16 30 24 30 30 26" stroke="#FF9900" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <text x="20" y="34" textAnchor="middle" fontFamily="Plus Jakarta Sans, Arial, sans-serif" fontSize="7" fontWeight="700" fill="#FF9900">pay</text>
    </svg>
  )
}

export function CardBrandLogo({ brand = 'visa', size = 32 }) {
  const W = size, H = size * 0.65
  if (brand === 'visa') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" width={W * 1.5} height={H * 1.5}>
        <rect width="48" height="32" rx="5" fill="#1A1F71" />
        <text x="24" y="21" textAnchor="middle" fontFamily="Arial Black, Arial" fontSize="14" fontWeight="900" fill="#fff" fontStyle="italic">VISA</text>
      </svg>
    )
  }
  if (brand === 'mastercard') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" width={W * 1.5} height={H * 1.5}>
        <rect width="48" height="32" rx="5" fill="#0A0A0F" />
        <circle cx="18" cy="16" r="9" fill="#EB001B" />
        <circle cx="30" cy="16" r="9" fill="#F79E1B" opacity="0.85" />
      </svg>
    )
  }
  if (brand === 'rupay') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32" width={W * 1.5} height={H * 1.5}>
        <rect width="48" height="32" rx="5" fill="#fff" stroke="#E5E7EB" />
        <text x="24" y="22" textAnchor="middle" fontFamily="Plus Jakarta Sans, Arial" fontSize="13" fontWeight="800" fill="#097939">RuPay</text>
      </svg>
    )
  }
  return null
}