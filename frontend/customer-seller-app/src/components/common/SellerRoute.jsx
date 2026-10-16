import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSeller } from '../../context/SellerContext'
import Loader from './Loader'

export default function SellerRoute({ children, allowPending = false }) {
  const { isAuthenticated, role, loading: authLoading } = useAuth()
  const { seller, loading: sellerLoading, notFound } = useSeller()
  const location = useLocation()

  if (authLoading || sellerLoading) return <Loader />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role !== 'SELLER') {
    return <Navigate to="/home" replace />
  }

  // Store not registered yet OR status not approved → go to pending
  const isApproved = seller?.sellerStatus === 'APPROVED'

  if (!isApproved && !allowPending) {
    return <Navigate to="/seller/pending" replace />
  }

  return children
}