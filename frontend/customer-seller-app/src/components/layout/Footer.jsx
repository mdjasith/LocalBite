import { Link } from 'react-router-dom'
import FalconLogo from '../brand/FalconLogo'
import { GlobeIcon, LinkedinIcon, GithubIcon, AlertCircleIcon } from '../icons'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <FalconLogo size={40} color="#FF5C39" />
            <div>
              <div style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 22, color: 'white', letterSpacing: '-0.02em' }}>LocalBite</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Local Food. Local Sellers.</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: '#9CA3AF', maxWidth: 320, lineHeight: 1.7 }}>
            A multi-vendor food marketplace demo built as a personal portfolio project by Mohamed Jasith.
          </p>
        </div>
        <div>
          <div className="footer__title">Product</div>
          <Link to="/" className="footer__link">Home</Link>
          <Link to="/about" className="footer__link">About</Link>
          <Link to="/login" className="footer__link">Login</Link>
        </div>
        <div>
          <div className="footer__title">Project</div>
          <a href="https://mohamedjasith.vercel.app/" target="_blank" rel="noopener noreferrer" className="footer__link">Portfolio</a>
          <Link to="/about" className="footer__link">Tech Stack</Link>
        </div>
        <div>
          <div className="footer__title">Connect</div>
          <a href="https://mohamedjasith.vercel.app/" target="_blank" rel="noopener noreferrer" className="footer__link">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><GlobeIcon size={14} /> Portfolio</span>
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="footer__link">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><LinkedinIcon size={14} /> LinkedIn</span>
          </a>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="footer__link">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><GithubIcon size={14} /> GitHub</span>
          </a>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="footer__disclaimer">
          <AlertCircleIcon size={14} /> Portfolio project — NOT a real food delivery service.
        </div>
        <div style={{ color: '#6B7280' }}>No real orders. No real money. All payments simulated.</div>
        <div style={{ marginTop: 10, color: '#6B7280' }}>
          © 2026 LocalBite · Built by <a href="https://mohamedjasith.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#FF5C39', fontWeight: 600 }}>Mohamed Jasith</a>
        </div>
      </div>
    </footer>
  )
}