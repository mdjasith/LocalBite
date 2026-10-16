import { PackageIcon } from '../icons'

export default function EmptyState({ icon = <PackageIcon size={40} />, title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div className="empty-state__title">{title}</div>
      {text && <div className="empty-state__text">{text}</div>}
      {action}
    </div>
  )
}