// src/utils/emailService.js
// All transactional emails go through Brevo
// Order confirmation â†’ instant (with portfolio notice)
// Thank-you + developer contact â†’ 30 seconds later
// Password reset code â†’ on request

// ============================================
// BREVO CREDENTIALS
// ============================================
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || ''
const BREVO_FROM_EMAIL = 'mdjasith786@gmail.com'
const BREVO_FROM_NAME = 'LocalBite'

// ============================================
// DEVELOPER INFO (used in the thank-you email)
// ============================================
const DEV_NAME = 'Mohamed Jasith'
const DEV_EMAIL = 'mdjasith786@gmail.com'
const DEV_PORTFOLIO = 'https://mohamedjasith.vercel.app/'
const DEV_LINKEDIN = 'https://www.linkedin.com/in/mohamed-jasith-j/'

// ============================================
// CORE SENDER
// ============================================
async function sendViaBrevo({ toEmail, subject, htmlContent }) {
  if (!BREVO_API_KEY || BREVO_API_KEY === 'PASTE_YOUR_BREVO_API_KEY_HERE') {
    console.error('[Brevo] API key is missing')
    return { success: false, error: 'Brevo API key missing' }
  }

  const payload = {
    sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
    to: [{ email: toEmail }],
    subject: subject,
    htmlContent: htmlContent,
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      console.log('[Brevo] Sent OK:', data.messageId || '(no id)')
      return { success: true, data }
    }

    const errText = await res.text()
    console.error('[Brevo] Failed:', res.status, errText)
    return { success: false, error: errText || `HTTP ${res.status}` }
  } catch (err) {
    console.error('[Brevo] Network error:', err)
    return { success: false, error: err.message }
  }
}

// ============================================
// SHARED HTML WRAPPER
// ============================================
function wrapEmail({ title, bodyContent }) {
  return `
    <div style="font-family:'Inter',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAFAFB;padding:32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;padding:12px 20px;background:linear-gradient(135deg,#FF5C39,#F43F5E);border-radius:12px;">
          <span style="color:white;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:22px;letter-spacing:-0.02em;">LocalBite</span>
        </div>
        <div style="font-size:12px;color:#9CA3AF;margin-top:8px;letter-spacing:0.05em;">
          Local Food. Local Sellers. One Marketplace.
        </div>
      </div>

      <div style="background:white;border-radius:16px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <h1 style="margin:0 0 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;color:#0A0A0F;letter-spacing:-0.02em;">${title}</h1>
        ${bodyContent}
      </div>

      <div style="text-align:center;padding:20px;font-size:12px;color:#9CA3AF;line-height:1.6;">
        LocalBite is a personal portfolio project â€” not a real food delivery service.<br>
        Â© 2026 LocalBite Â· Built by ${DEV_NAME}
      </div>
    </div>
  `
}

// ============================================
// EXPORTS
// ============================================

/**
 * 1. ORDER CONFIRMATION â€” instant, includes portfolio notice
 */
export async function sendOrderConfirmation({
  toEmail,
  customerName,
  orderId,
  amount,
  paymentMethod,
  deliveryAddress,
}) {
  const bodyContent = `
    <p style="color:#6B7280;font-size:15px;margin:0 0 20px;line-height:1.6;">
      Hi ${customerName || 'there'}, your order has been placed successfully.
    </p>

    <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
      <div style="font-size:13px;color:#92400E;line-height:1.5;">
        âš ï¸ <strong>Portfolio project notice:</strong> LocalBite is a personal demo app â€” not a real food delivery service. No real order was placed, no real money was charged.
      </div>
    </div>

    <div style="background:#F5F5F7;border-radius:10px;padding:16px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="color:#6B7280;font-size:13px;">Order ID</span>
        <strong style="color:#0A0A0F;font-size:14px;">#LB${orderId}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="color:#6B7280;font-size:13px;">Amount</span>
        <strong style="color:#0A0A0F;font-size:14px;">â‚¹${Number(amount).toFixed(2)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="color:#6B7280;font-size:13px;">Payment method</span>
        <strong style="color:#0A0A0F;font-size:14px;">${paymentMethod || 'UPI'}</strong>
      </div>
    </div>

    <div style="font-size:13px;color:#6B7280;line-height:1.6;padding:12px;background:#F5F5F7;border-radius:10px;">
      <strong style="color:#0A0A0F;">Delivering to:</strong><br>
      ${deliveryAddress || 'â€”'}
    </div>

    <p style="color:#9CA3AF;font-size:12px;margin:20px 0 0;line-height:1.6;">
      You'll receive a follow-up email shortly with details about this project and how to connect.
    </p>
  `

  return sendViaBrevo({
    toEmail,
    subject: `Your LocalBite order #${orderId} is confirmed ðŸŽ‰`,
    htmlContent: wrapEmail({ title: 'Order confirmed ðŸŽ‰', bodyContent }),
  })
}

/**
 * 2. THANK-YOU + DEVELOPER CONTACT â€” 30 seconds after order
 */
export async function sendThankYouEmail({ toEmail, customerName }) {
  const bodyContent = `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;line-height:1.7;">
      Hi ${customerName || 'there'}, thank you for exploring LocalBite! ðŸ™
    </p>

    <p style="color:#374151;font-size:15px;margin:0 0 16px;line-height:1.7;">
      This project is a <strong>personal full-stack portfolio demo</strong> â€” I built it to showcase:
    </p>

    <div style="background:#F5F5F7;border-radius:10px;padding:16px;margin-bottom:20px;">
      <div style="font-size:13px;color:#374151;line-height:1.9;">
        âœ“ 16 microservices with Spring Boot &amp; MySQL<br>
        âœ“ React frontend with JWT authentication<br>
        âœ“ Multi-vendor cart &amp; geospatial search<br>
        âœ“ Simulated UPI / Card / COD payments<br>
        âœ“ OTP-verified delivery &amp; commission tracking
      </div>
    </div>

    <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.7;">
      If you'd like to connect, share feedback, or discuss opportunities â€” here's how to reach me:
    </p>

    <div style="border-top:1px solid #E5E7EB;padding-top:20px;">
      <div style="font-size:12px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">
        Connect with ${DEV_NAME}
      </div>

      <a href="mailto:${DEV_EMAIL}" style="display:block;padding:14px 18px;background:#FFF5F0;border-radius:10px;color:#FF5C39;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:10px;border:1px solid #FFE8E1;">
        ðŸ“§ &nbsp; ${DEV_EMAIL}
      </a>

      <a href="${DEV_PORTFOLIO}" style="display:block;padding:14px 18px;background:#FFF5F0;border-radius:10px;color:#FF5C39;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:10px;border:1px solid #FFE8E1;">
        ðŸŒ &nbsp; Portfolio â€” mohamedjasith.vercel.app
      </a>

      <a href="${DEV_LINKEDIN}" style="display:block;padding:14px 18px;background:#FFF5F0;border-radius:10px;color:#FF5C39;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #FFE8E1;">
        ðŸ’¼ &nbsp; LinkedIn â€” /in/mohamed-jasith-j
      </a>
    </div>

    <div style="margin-top:24px;padding:14px;background:#ECFDF5;border-radius:10px;font-size:13px;color:#065F46;line-height:1.6;">
      <strong>Thanks again for trying LocalBite.</strong> Every click and order helps me learn and improve. If you spot anything that could be better, I'd love to hear it.
    </div>

    <p style="color:#374151;font-size:14px;margin:20px 0 0;line-height:1.6;">
      â€” ${DEV_NAME}
    </p>
  `

  return sendViaBrevo({
    toEmail,
    subject: `Thanks for trying LocalBite â€” from ${DEV_NAME}`,
    htmlContent: wrapEmail({ title: 'Thank you for trying LocalBite ðŸ™', bodyContent }),
  })
}

/**
 * 3. PASSWORD RESET CODE
 */
export async function sendPasswordResetCode({ toEmail, code }) {
  const bodyContent = `
    <p style="color:#6B7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
      Use this 6-digit code to reset your LocalBite password. It expires in 10 minutes.
    </p>

    <div style="background:#FFF5F0;border:2px dashed #FF5C39;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
      <div style="font-family:'Courier New',monospace;font-size:40px;font-weight:800;letter-spacing:0.3em;color:#FF5C39;">
        ${code}
      </div>
    </div>

    <p style="color:#9CA3AF;font-size:12px;margin:0;line-height:1.6;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `

  return sendViaBrevo({
    toEmail,
    subject: `Your LocalBite verification code: ${code}`,
    htmlContent: wrapEmail({ title: 'Reset your password', bodyContent }),
  })
}

/**
 * Schedule the thank-you email 30 seconds after order
 */
export function scheduleThankYouEmail({ toEmail, customerName }) {
  setTimeout(() => {
    sendThankYouEmail({ toEmail, customerName })
  }, 30_000)
}

/** Generate a 6-digit code */
export function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}