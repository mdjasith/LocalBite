export default function Loader({ size = 32, center = true }) {
  return (
    <div className={center ? 'loader--center' : ''}>
      <div className="loader" style={{ width: size, height: size }} />
    </div>
  )
}