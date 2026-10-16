import FalconLogo from '../../components/brand/FalconLogo'
import Button from '../../components/common/Button'
import { MapPinIcon, ShieldIcon, TruckIcon, WalletIcon, StarIcon, GlobeIcon, LinkedinIcon, GithubIcon, MailIcon, PackageIcon, CheckCircleIcon, XCircleIcon, CodeIcon, ZapIcon } from '../../components/icons'

const FEATURES = [
  { icon: <MapPinIcon size={26} />, title: '10 km Geospatial Search', desc: 'Haversine formula filters sellers near you.' },
  { icon: <ShieldIcon size={26} />, title: 'JWT Authentication', desc: 'BCrypt hashing with role-based access.' },
  { icon: <PackageIcon size={26} />, title: 'Multi-Vendor Cart', desc: 'One cart, multiple sellers, split orders.' },
  { icon: <WalletIcon size={26} />, title: 'Simulated UPI', desc: 'GPay-style flow. No real money.' },
  { icon: <TruckIcon size={26} />, title: 'Delivery OTP', desc: 'Hashed, expiring, one-time use.' },
  { icon: <StarIcon filled size={26} />, title: 'Reviews & Ratings', desc: 'Verified customer feedback.' },
]

export default function About() {
  return (
    <div className="page">
      {/* HERO */}
      <section style={{ padding: '100px 24px 80px', background: 'linear-gradient(180deg, #FFF5F0 0%, var(--bg-0) 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,92,57,0.20), transparent 70%)', filter: 'blur(80px)', top: -200, left: -200 }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'white', borderRadius: 9999, boxShadow: 'var(--shadow-sm)', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 32 }}>
            <CodeIcon size={14} /> Portfolio Project
          </div>
          <div className="gradient-text-aurora" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 'clamp(40px, 6vw, 68px)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
            About LocalBite
          </div>
          <p style={{ fontSize: 18, color: 'var(--text-3)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            A multi-vendor food marketplace demo built as a personal portfolio project.
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="container" style={{ padding: '60px 24px' }}>
        <div className="card" style={{ padding: 48, maxWidth: 880, margin: '0 auto', borderRadius: 'var(--r-2xl)' }}>
          <h2 style={{ marginBottom: 24 }}>What is LocalBite?</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 16, fontSize: 16, lineHeight: 1.75 }}>
            LocalBite is a personal full-stack web application created to demonstrate real-world software engineering concepts using <strong>React, Spring Boot, and MySQL</strong>.
          </p>
          <p style={{ color: 'var(--text-2)', marginBottom: 16, fontSize: 16, lineHeight: 1.75 }}>
            The platform simulates a multi-vendor food marketplace where customers can discover food from local sellers within a 10 km radius, place orders, pay with simulated money, and track delivery with OTP verification.
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: 16, lineHeight: 1.75 }}>
            Built as a distributed <strong>microservices architecture</strong> with an API Gateway, 16 independent backend services, JWT authentication, and role-based access control for customers, sellers, and admins.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container" style={{ padding: '40px 24px 80px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 48 }}>What's inside</h2>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card card--hover" style={{ padding: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {f.icon}
              </div>
              <h4 style={{ marginBottom: 6 }}>{f.title}</h4>
              <p style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 48 }}>Technology stack</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Frontend', value: 'React · Vite · Axios', color: '#3B82F6' },
              { label: 'Backend', value: 'Java 17 · Spring Boot', color: '#10B981' },
              { label: 'Database', value: 'MySQL · 14 schemas', color: '#F59E0B' },
              { label: 'Security', value: 'JWT · BCrypt', color: '#EF4444' },
              { label: 'Architecture', value: 'Microservices · Gateway', color: '#7C3AED' },
              { label: 'Other', value: 'Haversine · OpenPDF', color: '#F43F5E' },
            ].map((t, i) => (
              <div key={i} style={{ padding: 22, background: 'var(--bg-0)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-1)', transition: 'all 0.25s', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.label}</span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>{t.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="container" style={{ padding: '80px 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FFFBEB 100%)',
          borderRadius: 28,
          padding: 48,
          border: '2px solid #FECACA',
          maxWidth: 880,
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(239,68,68,0.15), transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                <XCircleIcon size={26} />
              </div>
              <h2 style={{ fontSize: 26, margin: 0 }}>Important disclaimer</h2>
            </div>
            <p style={{ color: 'var(--text-2)', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
              LocalBite is a personal portfolio project created for software engineering learning and demonstration. It is <strong>NOT</strong> a real food delivery service.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>What is NOT real</div>
                {['No real food orders are processed', 'No real money is involved', 'No real email is sent', 'No real delivery happens'].map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: 'var(--text-2)' }}>
                    <XCircleIcon size={16} style={{ color: '#DC2626', flexShrink: 0 }} />{d}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>What is simulated</div>
                {['All payments are simulated', 'Emails are logged to console', 'Invoices are demo PDFs', 'Delivery is a mock workflow'].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: 'var(--text-2)' }}>
                    <CheckCircleIcon size={16} style={{ color: '#10B981', flexShrink: 0 }} />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEVELOPER */}
      <section className="container" style={{ padding: '40px 24px 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0A0A0F 0%, #1F2937 60%, #0F0F1A 100%)',
          borderRadius: 36,
          padding: '80px 40px',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 780,
          margin: '0 auto',
          boxShadow: '0 40px 80px -20px rgba(10,10,15,0.5)',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 25% 20%, rgba(255,92,57,0.35), transparent 45%), radial-gradient(circle at 75% 80%, rgba(124,58,237,0.30), transparent 45%)' }} />

          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex',
              padding: 28,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 28,
              marginBottom: 32,
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px -10px rgba(255,92,57,0.3)',
            }}>
              <FalconLogo size={110} color="#FF5C39" />
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
              Developed by
            </div>

            <h2 style={{ color: 'white', fontSize: 36, marginBottom: 10, letterSpacing: '-0.03em' }}>
              Mohamed Jasith
            </h2>

            <div style={{ color: '#FF5C39', fontWeight: 700, marginBottom: 24, fontSize: 15 }}>
              Software Engineer
            </div>

            <p style={{ color: '#9CA3AF', maxWidth: 440, margin: '0 auto 40px', fontSize: 15, lineHeight: 1.7 }}>
              Full-stack developer passionate about building scalable web applications and mastering real-world software engineering concepts.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://mohamedjasith.vercel.app/" target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="md"><GlobeIcon size={16} /> Visit Portfolio</Button>
              </a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md" style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'white', background: 'rgba(255,255,255,0.05)' }}><GithubIcon size={16} /> GitHub</Button>
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md" style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'white', background: 'rgba(255,255,255,0.05)' }}><LinkedinIcon size={16} /> LinkedIn</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ padding: '20px 24px 80px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: 12, fontSize: 26 }}>Interested in working together?</h3>
        <p style={{ color: 'var(--text-3)', marginBottom: 28, fontSize: 16 }}>
          Open to full-time roles, freelance work, and collaborations.
        </p>
        <a href="https://mohamedjasith.vercel.app/" target="_blank" rel="noopener noreferrer">
          <Button size="lg"><MailIcon size={18} /> Get in Touch</Button>
        </a>
      </section>
    </div>
  )
}