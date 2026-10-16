import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  myNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from '../../api/notificationApi'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import { BellIcon, CheckIcon, TrashIcon } from '../../components/icons'
import { timeAgo } from '../../utils/formatDate'

export default function SellerNotifications() {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await myNotifications().catch(() => [])
      setList(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markRead(id)
      load()
    } catch {
      toast.error('Could not mark read')
    }
  }

  const handleMarkAll = async () => {
    try {
      await markAllRead()
      toast.success('All marked read')
      load()
    } catch {
      toast.error('Could not mark all')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      load()
    } catch {
      toast.error('Could not delete')
    }
  }

  if (loading) return <Loader />

  return (
    <div className="page container" style={{ padding: '40px 24px 80px', maxWidth: 720 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}
      >
        <h1 style={{ fontSize: 32 }}>Notifications</h1>
        {list.some((n) => !n.isRead) && (
          <Button variant="outline" onClick={handleMarkAll}>
            <CheckIcon size={16} /> Mark all read
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<BellIcon size={40} />}
          title="No notifications"
          text="You're all caught up."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((n) => (
            <div
              key={n.notificationId}
              className="card"
              style={{
                padding: 18,
                borderLeft: n.isRead
                  ? '1px solid var(--border-2)'
                  : '3px solid var(--brand-primary)',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: n.isRead ? 'var(--bg-2)' : 'var(--brand-primary-light)',
                  color: n.isRead ? 'var(--text-4)' : 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BellIcon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 4,
                  }}
                >
                  {n.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-3)',
                    lineHeight: 1.5,
                    marginBottom: 6,
                  }}
                >
                  {n.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-4)' }}>
                  {timeAgo(n.createdAt)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.notificationId)}
                    style={{ color: 'var(--brand-primary)', cursor: 'pointer', padding: 6 }}
                    title="Mark read"
                  >
                    <CheckIcon size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.notificationId)}
                  style={{ color: 'var(--text-4)', cursor: 'pointer', padding: 6 }}
                  title="Delete"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}