import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SellerProvider } from './context/SellerContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import './styles/global.css'
import './styles/components.css'
import './styles/responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SellerProvider>
          <LocationProvider>
            <CartProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 12px 24px rgba(10,10,15,0.12)',
                  },
                  success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
                  error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
                }}
              />
            </CartProvider>
          </LocationProvider>
        </SellerProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)