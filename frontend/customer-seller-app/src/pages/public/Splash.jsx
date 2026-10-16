import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UtensilsIcon } from '../../components/icons'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('lb_splash_shown')) {
      navigate('/home', { replace: true })
      return
    }
    const t = setTimeout(() => {
      sessionStorage.setItem('lb_splash_shown', '1')
      navigate('/home', { replace: true })
    }, 2500)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #FF5C39 0%, #F43F5E 50%, #7C3AED 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15), transparent 50%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)',
          top: '10%',
          left: '5%',
          filter: 'blur(60px)',
          animation: 'floatSlow 8s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)',
          bottom: '10%',
          right: '5%',
          filter: 'blur(60px)',
          animation: 'floatSlow 10s ease-in-out infinite reverse',
        }}
      />

      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          color: 'white',
          animation: 'fadeIn 600ms ease-out',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: 24,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 28,
            marginBottom: 28,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.25)',
            animation: 'successPop 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <UtensilsIcon size={64} color="white" />
        </div>

        <h1
          style={{
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 'clamp(40px, 8vw, 72px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 16,
            color: 'white',
            animation: 'fadeInUp 700ms 200ms backwards',
          }}
        >
          LocalBite
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 19px)',
            opacity: 0.95,
            fontWeight: 500,
            letterSpacing: '0.01em',
            animation: 'fadeInUp 700ms 400ms backwards',
          }}
        >
          Local Food. Local Sellers. One Marketplace.
        </p>

        <div
          style={{
            marginTop: 40,
            display: 'flex',
            justifyContent: 'center',
            animation: 'fadeIn 700ms 700ms backwards',
          }}
        >
          <div
            style={{
              width: 60,
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.3)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'white',
                borderRadius: 2,
                animation: 'loadingBar 2.4s ease-out forwards',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loadingBar {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}