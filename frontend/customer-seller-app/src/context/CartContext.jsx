import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as cartApi from '../api/cartApi'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated, role } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  const canUseCart = isAuthenticated && role === 'CUSTOMER'

  const refresh = useCallback(async () => {
    if (!canUseCart) {
      setCart(null)
      return
    }
    try {
      setLoading(true)
      const data = await cartApi.myCart()
      setCart(data)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [canUseCart])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = async (foodId, quantity = 1) => {
    if (!canUseCart) {
      const err = new Error('LOGIN_REQUIRED')
      err.code = 'LOGIN_REQUIRED'
      throw err
    }
    const data = await cartApi.addItem(foodId, quantity)
    setCart(data)
    return data
  }

  const updateQuantity = async (cartItemId, quantity) => {
    const data = await cartApi.updateQuantity(cartItemId, quantity)
    setCart(data)
    return data
  }

  const removeItem = async (cartItemId) => {
    const data = await cartApi.removeItem(cartItemId)
    setCart(data)
    return data
  }

  const clear = async () => {
    const data = await cartApi.clearCart()
    setCart(data)
    return data
  }

  const value = {
    cart,
    loading,
    canUseCart,
    itemCount: cart?.totalItems || 0,
    subtotal: cart?.cartSubtotal || 0,
    sellerGroups: cart?.sellerGroups || [],
    addItem,
    updateQuantity,
    removeItem,
    clear,
    refresh,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}