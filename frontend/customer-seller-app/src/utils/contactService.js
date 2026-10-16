// src/utils/contactService.js
// Web3Forms — using fetch(), no npm install

const WEB3FORMS_ACCESS_KEY = '4079ae64-b4bb-498a-9a04-78dd4ba90cff'

/**
 * Send a contact / feedback message.
 * Web3Forms sends the email to YOUR inbox (the address you signed up with).
 */
export async function sendContactMessage({ name, email, message, subject }) {
  if (!WEB3FORMS_ACCESS_KEY) {
    console.error('[Web3Forms] Access key missing')
    return { success: false, error: 'Access key missing' }
  }

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    from_name: 'LocalBite Contact Form',
    subject: subject || `New message from ${name || 'a user'}`,
    name: name || 'Anonymous',
    email: email || 'no-reply@localbite.app',
    message: message || '',
  }

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (data.success) {
      console.log('[Web3Forms] Sent OK')
      return { success: true }
    }

    console.error('[Web3Forms] Failed:', data)
    return { success: false, error: data.message || 'Send failed' }
  } catch (err) {
    console.error('[Web3Forms] Network error:', err)
    return { success: false, error: err.message }
  }
}