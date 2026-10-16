import { UtensilsIcon } from '../icons'

export default function LocalBiteLogo({ size = 22, showText = true, onClick }) {
  return (
    <div className="navbar__logo" onClick={onClick}>
      <div className="navbar__logo-mark">
        <UtensilsIcon size={size} />
      </div>
      {showText && <span className="navbar__logo-text">LocalBite</span>}
    </div>
  )
}