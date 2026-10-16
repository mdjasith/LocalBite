import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useSeller } from '../../context/SellerContext'
import LocalBiteLogo from '../brand/LocalBiteLogo'
import ConfirmModal from '../common/ConfirmModal'
import {
  MapPinIcon,
  BellIcon,
  CartIcon,
  UserIcon,
  LogOutIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
  HomeIcon,
  UtensilsIcon,
  StoreIcon,
  PackageIcon,
  HelmetIcon,
} from '../icons'

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth()
  const { itemCount } = useCart()
  const { seller } = useSeller()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const confirmLogout = () => {
    logout()
    setShowLogout(false)
    setMenuOpen(false)
    navigate('/home')
  }

  const isCustomer = isAuthenticated && role === 'CUSTOMER'
  const isSeller = isAuthenticated && role === 'SELLER'
  const sellerApproved = isSeller && seller?.sellerStatus === 'APPROVED'

  const homeLink = isSeller ? '/seller/dashboard' : '/home'

  const linkClass = ({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`
  const mobileLinkClass = ({ isActive }) => `mobile-menu__link ${isActive ? 'active' : ''}`

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav className="navbar">
        <div className="navbar__left">
          <LocalBiteLogo onClick={() => { navigate(homeLink); closeMenu() }} />

          {/* Helmet brand badge — small delivery icon next to logo */}
          <div
            className="navbar__helmet-badge"
            title="Delivery partner network"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 10,
              background: 'var(--brand-primary-light)',
              color: 'var(--brand-primary)',
              flexShrink: 0,
            }}
          >
            <HelmetIcon size={18} />
          </div>

          <div className="navbar__links">
            {isCustomer && (
              <>
                <NavLink to="/home" className={linkClass}>Home</NavLink>
                <NavLink to="/foods" className={linkClass}>Foods</NavLink>
                <NavLink to="/sellers" className={linkClass}>Sellers</NavLink>
                <NavLink to="/orders" className={linkClass}>My Orders</NavLink>
              </>
            )}

            {sellerApproved && (
              <>
                <NavLink to="/seller/dashboard" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/seller/foods" className={linkClass}>Menu</NavLink>
                <NavLink to="/seller/orders" className={linkClass}>Orders</NavLink>
                <NavLink to="/seller/earnings" className={linkClass}>Earnings</NavLink>
              </>
            )}

            {isSeller && !sellerApproved && (
              <NavLink to="/seller/pending" className={linkClass}>Pending Approval</NavLink>
            )}

            {!isAuthenticated && (
              <>
                <NavLink to="/home" className={linkClass}>Home</NavLink>
                <NavLink to="/foods" className={linkClass}>Foods</NavLink>
                <NavLink to="/sellers" className={linkClass}>Sellers</NavLink>
                <NavLink to="/about" className={linkClass}>About</NavLink>
              </>
            )}
          </div>
        </div>

        <div className="navbar__right">
          {(isCustomer || !isAuthenticated) && (
            <button className="navbar__icon-btn" onClick={() => navigate('/foods')} title="Search food">
              <SearchIcon size={20} />
            </button>
          )}

          {isCustomer && (
            <button className="navbar__icon-btn" onClick={() => navigate('/customer/location')} title="Delivery location">
              <MapPinIcon size={20} />
            </button>
          )}

          {(isCustomer || sellerApproved) && (
            <Link to={isSeller ? '/seller/notifications' : '/orders'} className="navbar__icon-btn" title="Notifications">
              <BellIcon size={20} />
            </Link>
          )}

          {isCustomer && (
            <Link to="/cart" className="navbar__icon-btn" title="Cart">
              <CartIcon size={20} />
              {itemCount > 0 && (
                <span className="navbar__icon-btn__badge">{itemCount}</span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <Link to={isSeller ? '/seller/profile' : '/profile'} className="navbar__icon-btn" title="Profile">
                <UserIcon size={20} />
              </Link>
              <button className="navbar__icon-btn" onClick={() => setShowLogout(true)} title="Logout">
                <LogOutIcon size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn btn--ghost btn--sm">Login</button>
              </Link>
              <Link to="/register">
                <button className="btn btn--primary btn--sm">Sign up</button>
              </Link>
            </>
          )}

          <button
            className="navbar__icon-btn navbar__menu-toggle"
            onClick={() => setMenuOpen(true)}
            title="Menu"
          >
            <MenuIcon size={22} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <>
          <div className="mobile-menu__backdrop" onClick={closeMenu} />
          <aside className="mobile-menu">
            <div className="mobile-menu__header">
              <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 18 }}>
                Menu
              </div>
              <button className="mobile-menu__close" onClick={closeMenu}>
                <CloseIcon size={22} />
              </button>
            </div>

            <nav className="mobile-menu__nav">
              {isCustomer && (
                <>
                  <NavLink to="/home" className={mobileLinkClass} onClick={closeMenu}>
                    <HomeIcon size={18} /> Home
                  </NavLink>
                  <NavLink to="/foods" className={mobileLinkClass} onClick={closeMenu}>
                    <UtensilsIcon size={18} /> Foods
                  </NavLink>
                  <NavLink to="/sellers" className={mobileLinkClass} onClick={closeMenu}>
                    <StoreIcon size={18} /> Sellers
                  </NavLink>
                  <NavLink to="/orders" className={mobileLinkClass} onClick={closeMenu}>
                    <PackageIcon size={18} /> My Orders
                  </NavLink>
                  <NavLink to="/customer/location" className={mobileLinkClass} onClick={closeMenu}>
                    <MapPinIcon size={18} /> Location
                  </NavLink>
                </>
              )}

              {sellerApproved && (
                <>
                  <NavLink to="/seller/dashboard" className={mobileLinkClass} onClick={closeMenu}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/seller/foods" className={mobileLinkClass} onClick={closeMenu}>
                    Menu
                  </NavLink>
                  <NavLink to="/seller/orders" className={mobileLinkClass} onClick={closeMenu}>
                    Orders
                  </NavLink>
                  <NavLink to="/seller/earnings" className={mobileLinkClass} onClick={closeMenu}>
                    Earnings
                  </NavLink>
                  <NavLink to="/seller/reviews" className={mobileLinkClass} onClick={closeMenu}>
                    Reviews
                  </NavLink>
                  <NavLink to="/seller/notifications" className={mobileLinkClass} onClick={closeMenu}>
                    Notifications
                  </NavLink>
                  <NavLink to="/seller/profile" className={mobileLinkClass} onClick={closeMenu}>
                    Store Profile
                  </NavLink>
                </>
              )}

              {isSeller && !sellerApproved && (
                <NavLink to="/seller/pending" className={mobileLinkClass} onClick={closeMenu}>
                  Pending Approval
                </NavLink>
              )}

              {!isAuthenticated && (
                <>
                  <NavLink to="/home" className={mobileLinkClass} onClick={closeMenu}>
                    Home
                  </NavLink>
                  <NavLink to="/foods" className={mobileLinkClass} onClick={closeMenu}>
                    Foods
                  </NavLink>
                  <NavLink to="/sellers" className={mobileLinkClass} onClick={closeMenu}>
                    Sellers
                  </NavLink>
                  <NavLink to="/about" className={mobileLinkClass} onClick={closeMenu}>
                    About
                  </NavLink>
                  <NavLink to="/login" className={mobileLinkClass} onClick={closeMenu}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className={mobileLinkClass} onClick={closeMenu}>
                    Sign up
                  </NavLink>
                  <NavLink to="/seller/register" className={mobileLinkClass} onClick={closeMenu}>
                    Become a seller
                  </NavLink>
                </>
              )}

              {isAuthenticated && (
                <>
                  <NavLink
                    to={isSeller ? '/seller/profile' : '/profile'}
                    className={mobileLinkClass}
                    onClick={closeMenu}
                  >
                    <UserIcon size={18} /> Profile
                  </NavLink>
                  <button
                    className="mobile-menu__link mobile-menu__link--danger"
                    onClick={() => { closeMenu(); setShowLogout(true) }}
                  >
                    <LogOutIcon size={18} /> Logout
                  </button>
                </>
              )}
            </nav>

            <div className="mobile-menu__footer">
              LocalBite · Portfolio demo
            </div>
          </aside>
        </>
      )}

      <ConfirmModal
        open={showLogout}
        title="Log out?"
        message="You'll need to log in again to place orders or view your cart."
        confirmLabel="Log out"
        variant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogout(false)}
      />
    </>
  )
}