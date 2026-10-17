// src/utils/emailService.js
// Brevo integration using fetch()

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY
const FROM_EMAIL = 'mdjasith786@gmail.com'
const FROM_NAME = 'LocalBite'

const sendEmail = async ({ toEmail, subject, htmlContent }) => {
  if (!toEmail) {
    console.warn('[Email] No recipient email provided')
    return { success: false, error: 'No recipient' }
  }

  console.log(`[Email] Attempting to send "${subject}" to: ${toEmail}`)

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      console.log('✅ [Email] Sent successfully:', data.messageId)
      return { success: true, data }
    } else {
      console.error('❌ [Email] Brevo API Error:', data)
      return { success: false, error: data.message }
    }
  } catch (err) {
    console.error('❌ [Email] Network error:', err)
    return { success: false, error: err.message }
  }
}

export const sendOrderConfirmation = async ({ toEmail, customerName, orderId, amount, paymentMethod, deliveryAddress }) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
      <h2 style="color: #FF5C39;">Order Confirmed!</h2>
      <p>Hi ${customerName || 'there'},</p>
      <p>Your order <strong>#LB${orderId}</strong> has been successfully placed.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
        <p style="margin: 0;"><strong>Amount:</strong> ₹${Number(amount).toFixed(2)}</p>
        <p style="margin: 5px 0 0 0;"><strong>Payment:</strong> ${paymentMethod}</p>
        <p style="margin: 5px 0 0 0;"><strong>Delivering to:</strong> ${deliveryAddress}</p>
      </div>
      <p style="margin-top: 20px;">Thank you for choosing LocalBite!</p>
    </div>
  `
  return sendEmail({
    toEmail,
    subject: `LocalBite Order Confirmed - #${orderId}`,
    htmlContent,
  })
}

export const sendThankYouEmail = async ({ toEmail, customerName }) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
      <h2 style="color: #FF5C39;">Thank you for trying LocalBite! 🙏</h2>
      <p>Hi ${customerName || 'there'},</p>
      <p>I hope you enjoy your food. This is a personal portfolio project built to demonstrate a full-stack microservices architecture.</p>
      <p>If you'd like to connect, check out my portfolio or LinkedIn.</p>
    </div>
  `
  return sendEmail({
    toEmail,
    subject: `Thanks for trying LocalBite!`,
    htmlContent,
  })
}

export const scheduleThankYouEmail = ({ toEmail, customerName }) => {
  setTimeout(() => {
    sendThankYouEmail({ toEmail, customerName })
  }, 30000)
}

// --- NEW: Password Reset Functions Added Back ---

export const sendPasswordResetCode = async ({ toEmail, code }) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px; text-align: center;">
      <h2 style="color: #FF5C39;">Reset your password</h2>
      <p style="color: #6B7280;">Use this 6-digit code to reset your LocalBite password. It expires in 10 minutes.</p>
      <div style="background: #FFF5F0; border: 2px dashed #FF5C39; border-radius: 12px; padding: 24px; margin: 20px 0;">
        <h1 style="font-family: monospace; font-size: 40px; font-weight: 800; letter-spacing: 0.3em; color: #FF5C39; margin: 0;">${code}</h1>
      </div>
      <p style="color: #9CA3AF; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `
  return sendEmail({
    toEmail,
    subject: `Your LocalBite verification code: ${code}`,
    htmlContent,
  })
}

export const generateSixDigitCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000))
}