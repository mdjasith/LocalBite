import { useEffect, useState } from 'react'
import { myCommissions, mySummary } from '../../api/commissionApi'
import Loader from '../../components/common/Loader'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import {
  TrendingUpIcon, DollarSignIcon, PackageIcon, PercentIcon,
} from '../../components/icons'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function Earnings() {
  const [commissions, setCommissions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [list, s] = await Promise.all([
          myCommissions().catch(() => []),
          mySummary().catch(() => null),
        ])
        setCommissions(Array.isArray(list) ? list : [])
        setSummary(s)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <Loader />

  const cards = [
    {
      label: 'Gross sales',
      value: formatCurrency(summary?.grossSales || 0),
      icon: <TrendingUpIcon size={20} />,
      color: '#3B82F6',
      bg: '#EFF6FF',
    },
    {
      label: 'Platform commission',
      value: formatCurrency(summary?.totalCommission || 0),
      icon: <PercentIcon size={20} />,
      color: '#EF4444',
      bg: 'var(--danger-bg)',
    },
    {
      label: 'Your earnings',
      value: formatCurrency(summary?.totalEarnings || 0),
      icon: <DollarSignIcon size={20} />,
      color: '#10B981',
      bg: 'var(--success-bg)',
    },
  ]

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Earnings</h1>
      <p style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 32 }}>
        Your simulated earnings and platform commission.
      </p>

      <div
        className="stagger"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {cards.map((c, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {c.label}
              </span>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: c.bg,
                  color: c.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {c.icon}
              </div>
            </div>
            <div
              style={{
                fontFamily: 'Plus Jakarta Sans',
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: '-0.02em',
              }}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 20 }}>Transaction history</h2>

      {commissions.length === 0 ? (
        <EmptyState
          icon={<DollarSignIcon size={40} />}
          title="No transactions yet"
          text="Your commission records will appear here once you get orders."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg-2)' }}>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, color: 'var(--text-3)' }}>
                  Order
                </th>
                <th style={{ padding: 14, textAlign: 'right', fontWeight: 600, color: 'var(--text-3)' }}>
                  Gross
                </th>
                <th style={{ padding: 14, textAlign: 'right', fontWeight: 600, color: 'var(--text-3)' }}>
                  Commission
                </th>
                <th style={{ padding: 14, textAlign: 'right', fontWeight: 600, color: 'var(--text-3)' }}>
                  Net
                </th>
                <th style={{ padding: 14, textAlign: 'right', fontWeight: 600, color: 'var(--text-3)' }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr
                  key={c.commissionId}
                  style={{ borderTop: '1px solid var(--border-2)' }}
                >
                  <td style={{ padding: 14, fontWeight: 600 }}>
                    #LB{c.orderId}
                  </td>
                  <td style={{ padding: 14, textAlign: 'right' }}>
                    {formatCurrency(c.foodSubtotal)}
                  </td>
                  <td
                    style={{
                      padding: 14,
                      textAlign: 'right',
                      color: 'var(--danger)',
                    }}
                  >
                    −{formatCurrency(c.commissionAmount)}
                  </td>
                  <td
                    style={{
                      padding: 14,
                      textAlign: 'right',
                      fontWeight: 700,
                      color: 'var(--success)',
                    }}
                  >
                    {formatCurrency(c.sellerAmount)}
                  </td>
                  <td
                    style={{
                      padding: 14,
                      textAlign: 'right',
                      color: 'var(--text-4)',
                      fontSize: 12,
                    }}
                  >
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}