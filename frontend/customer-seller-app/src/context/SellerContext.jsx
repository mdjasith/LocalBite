import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useAuth } from './AuthContext'
import { getMySeller } from '../api/sellerApi'

const SellerContext = createContext(null)

export function SellerProvider({ children }) {
  const { isAuthenticated, role } = useAuth()
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated || role !== 'SELLER') {
      setSeller(null)
      setNotFound(false)
      return
    }
    try {
      setLoading(true)
      const data = await getMySeller()
      setSeller(data)
      setNotFound(false)
    } catch (err) {
      // 400 "Seller not found for this account" means store not registered yet
      setSeller(null)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, role])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isApproved = seller?.sellerStatus === 'APPROVED'
  const isPending = seller?.sellerStatus === 'PENDING'
  const isRejected = seller?.sellerStatus === 'REJECTED'
  const isBlocked = seller?.sellerStatus === 'BLOCKED'
  const isOpen = seller?.operatingStatus === 'OPEN'

  return (
    <SellerContext.Provider
      value={{
        seller,
        loading,
        notFound,
        refresh,
        isApproved,
        isPending,
        isRejected,
        isBlocked,
        isOpen,
      }}
    >
      {children}
    </SellerContext.Provider>
  )
}

export function useSeller() {
  const ctx = useContext(SellerContext)
  if (!ctx) throw new Error('useSeller must be inside SellerProvider')
  return ctx
}