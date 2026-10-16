import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSellers } from '../../api/sellerApi'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { StarIcon, StoreIcon, MapPinIcon } from '../../components/icons'

export default function Sellers() {
  const navigate = useNavigate()
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await listSellers()
        setSellers(data || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="page container" style={{ padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Local sellers</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 15 }}>
          Approved sellers serving your area.
        </p>
      </div>

      {sellers.length === 0 ? (
        <EmptyState
          icon={<StoreIcon size={40} />}
          title="No sellers yet"
          text="Sellers will appear here once approved."
        />
      ) : (
        <div
          className="stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {sellers.map((s) => (
            <div
              key={s.sellerId}
              className="card card--hover"
              onClick={() => navigate(`/sellers/${s.sellerId}`)}
              style={{ cursor: 'pointer', padding: 24 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 22,
                    fontFamily: 'Plus Jakarta Sans',
                  }}
                >
                  {s.storeName?.[0] || 'S'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {s.storeName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-4)' }}>
                    {s.ownerName}
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-3)',
                  marginBottom: 16,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: 34,
                }}
              >
                {s.storeDescription || 'No description'}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--text-2)',
                  }}
                >
                  <StarIcon size={14} filled /> 4.5
                </span>
                <span
                  className={`badge badge--${(s.operatingStatus || '').toLowerCase()}`}
                >
                  {s.operatingStatus || 'CLOSED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}