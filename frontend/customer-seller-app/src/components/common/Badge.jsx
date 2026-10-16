export default function Badge({ status, children, dot = false }) {
  const cls = `badge badge--${(status || '').toLowerCase()} ${dot ? 'badge--with-dot' : ''}`
  return <span className={cls}>{children || status}</span>
}