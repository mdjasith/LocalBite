import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from './Loader'

export default function ProtectedRoute({ children, allow }) {
  const { isAuthenticated, role, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (allow && !allow.includes(role)) return <Navigate to="/" replace />
  return children
}