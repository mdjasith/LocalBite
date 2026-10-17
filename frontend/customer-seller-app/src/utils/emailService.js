// src/utils/emailService.js
// Brevo integration using fetch()

// Hardcoded fallback ensures emails send even if Vercel env vars fail
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
      console.log('âœ… [Email] Sent successfully:', data.messageId)
      return { success: true, data }
    } else {
      console.error('âŒ [Email] Brevo API Error:', data)
      return { success: false, error: data.message }
    }
  } catch (err) {
    console.error('âŒ [Email] Network error:', err)
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
        <p style="margin: 0;"><strong>Amount:</strong> â‚¹${Number(amount).toFixed(2)}</p>
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
      <h2 style="color: #FF5C39;">Thank you for trying LocalBite! ðŸ™</h2>
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
  }, 30000) // 30 seconds later
}