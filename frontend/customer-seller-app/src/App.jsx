import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'
import SellerRoute from './components/common/SellerRoute'
import BottomCartBar from './components/cart/BottomCartBar'
import { trackInitialVisit, trackPageView } from './utils/visitorTracker'

import Splash from './pages/public/Splash'
import Home from './pages/public/Home'
import Foods from './pages/public/Foods'
import FoodDetails from './pages/public/FoodDetails'
import Sellers from './pages/public/Sellers'
import SellerDetails from './pages/public/SellerDetails'
import Cart from './pages/public/Cart'
import Checkout from './pages/public/Checkout'
import About from './pages/public/About'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import ForgotPassword from './pages/public/ForgotPassword'
import SellerRegister from './pages/public/SellerRegister'

import Orders from './pages/customer/Orders'
import OrderDetails from './pages/customer/OrderDetails'
import Payment from './pages/customer/Payment'
import PaymentSuccess from './pages/customer/PaymentSuccess'
import WriteReview from './pages/customer/WriteReview'
import Profile from './pages/customer/Profile'
import Location from './pages/customer/Location'

import PendingApproval from './pages/seller/PendingApproval'
import Dashboard from './pages/seller/Dashboard'
import SellerProfile from './pages/seller/Profile'
import SellerFoods from './pages/seller/Foods'
import FoodForm from './pages/seller/FoodForm'
import SellerOrders from './pages/seller/Orders'
import SellerOrderDetails from './pages/seller/OrderDetails'
import Earnings from './pages/seller/Earnings'
import SellerReviews from './pages/seller/Reviews'
import SellerNotifications from './pages/seller/Notifications'

// Track initial visit once per session
trackInitialVisit()

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    trackPageView(pathname)
  }, [pathname])
  return null
}

function Shell({ children }) {
  const { pathname } = useLocation()
  const isSplash = pathname === '/'
  return (
    <>
      {!isSplash && <Navbar />}
      <div key={pathname}>{children}</div>
      {!isSplash && <BottomCartBar />}
      {!isSplash && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Shell>
        <Routes>
          <Route path="/" element={<Splash />} />

          <Route path="/home" element={<Home />} />
          <Route path="/customer/home" element={<Home />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/foods/:foodId" element={<FoodDetails />} />
          <Route path="/sellers" element={<Sellers />} />
          <Route path="/sellers/:sellerId" element={<SellerDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/seller/register" element={<SellerRegister />} />

          <Route path="/checkout" element={<ProtectedRoute allow={['CUSTOMER']}><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allow={['CUSTOMER']}><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute allow={['CUSTOMER']}><OrderDetails /></ProtectedRoute>} />
          <Route path="/orders/:orderId/review" element={<ProtectedRoute allow={['CUSTOMER']}><WriteReview /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allow={['CUSTOMER']}><Profile /></ProtectedRoute>} />
          <Route path="/customer/location" element={<ProtectedRoute allow={['CUSTOMER']}><Location /></ProtectedRoute>} />
          <Route path="/payment/:orderId" element={<ProtectedRoute allow={['CUSTOMER']}><Payment /></ProtectedRoute>} />
          <Route path="/order-success/:orderId" element={<ProtectedRoute allow={['CUSTOMER']}><PaymentSuccess /></ProtectedRoute>} />

          <Route path="/seller/pending" element={<SellerRoute allowPending><PendingApproval /></SellerRoute>} />
          <Route path="/seller/dashboard" element={<SellerRoute><Dashboard /></SellerRoute>} />
          <Route path="/seller/profile" element={<SellerRoute><SellerProfile /></SellerRoute>} />
          <Route path="/seller/foods" element={<SellerRoute><SellerFoods /></SellerRoute>} />
          <Route path="/seller/foods/add" element={<SellerRoute><FoodForm mode="add" /></SellerRoute>} />
          <Route path="/seller/foods/:foodId/edit" element={<SellerRoute><FoodForm mode="edit" /></SellerRoute>} />
          <Route path="/seller/orders" element={<SellerRoute><SellerOrders /></SellerRoute>} />
          <Route path="/seller/orders/:orderId" element={<SellerRoute><SellerOrderDetails /></SellerRoute>} />
          <Route path="/seller/earnings" element={<SellerRoute><Earnings /></SellerRoute>} />
          <Route path="/seller/reviews" element={<SellerRoute><SellerReviews /></SellerRoute>} />
          <Route path="/seller/notifications" element={<SellerRoute><SellerNotifications /></SellerRoute>} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Shell>
    </>
  )
}