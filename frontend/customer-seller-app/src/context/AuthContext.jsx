import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/authApi'
import { trackLogin, trackRegister, trackLogout } from '../utils/visitorTracker'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('lb_user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('lb_user')
      }
    }
    setLoading(false)
  }, [])

  const saveAuth = (data) => {
    const u = {
      token: data.token,
      role: data.role,
      email: data.email,
      userId: data.userId,
    }
    localStorage.setItem('lb_token', data.token)
    localStorage.setItem('lb_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const login = async (email, password) => {
    const data = await authApi.login({ email, password })
    const u = saveAuth(data)
    // fire-and-forget tracking (user already saved in localStorage)
    try { trackLogin(u.role) } catch { /* ignore */ }
    return u
  }

  const register = async (email, password, role) => {
    const data = await authApi.register({ email, password, role })
    const u = saveAuth(data)
    try { trackRegister(u.role) } catch { /* ignore */ }
    return u
  }

  const logout = () => {
    try { trackLogout() } catch { /* ignore */ }
    localStorage.removeItem('lb_token')
    localStorage.removeItem('lb_user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    userId: user?.userId || null,
    email: user?.email || null,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}