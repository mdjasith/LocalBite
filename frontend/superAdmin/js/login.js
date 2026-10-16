document.addEventListener('DOMContentLoaded', () => {
  console.log('[login] page loaded')

  const form = document.getElementById('loginForm')
  const errorEl = document.getElementById('loginError')
  const btn = document.getElementById('loginBtn')

  if (!form) { console.error('[login] #loginForm not found'); return }
  if (!errorEl) { console.error('[login] #loginError not found'); return }
  if (!btn) { console.error('[login] #loginBtn not found'); return }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    errorEl.textContent = ''

    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value

    console.log('[login] submit:', { email, passwordLen: password.length })

    if (!email || !password) {
      errorEl.textContent = 'Email and password required'
      return
    }

    btn.disabled = true
    btn.textContent = 'Signing in...'

    try {
      const url = API_BASE + '/api/auth/login'
      console.log('[login] POST', url)

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      console.log('[login] status:', res.status)

      const text = await res.text()
      console.log('[login] raw body:', text)

      let data = {}
      try { data = JSON.parse(text) } catch (e) {
        console.error('[login] response is not JSON')
        errorEl.textContent = 'Server returned invalid response. Check the backend.'
        return
      }

      console.log('[login] parsed:', data)

      if (!res.ok) {
        errorEl.textContent = data.message || `Login failed (${res.status})`
        return
      }

      console.log('[login] role:', data.role)

      if (data.role !== 'ADMIN') {
        errorEl.textContent = `Access denied. Your role is ${data.role}. Only ADMIN can access this console.`
        return
      }

      localStorage.setItem('lb_admin_token', data.token)
      localStorage.setItem('lb_admin_user', JSON.stringify({
        email: data.email,
        role: data.role,
        userId: data.userId,
      }))

      console.log('[login] saved token. redirecting to dashboard.html')
      window.location.href = 'dashboard.html'

    } catch (err) {
      console.error('[login] fetch error:', err)
      errorEl.textContent = 'Network error: ' + err.message
    } finally {
      btn.disabled = false
      btn.textContent = 'Sign in'
    }
  })
})