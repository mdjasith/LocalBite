import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from '../icons'

export default function Input({
  label,
  error,
  hint,
  type = 'text',
  as = 'input',
  className = '',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password' && as === 'input'
  const Tag = as === 'textarea' ? 'textarea' : 'input'
  const fieldClass = `field__${as === 'textarea' ? 'textarea' : 'input'}`
  const actualType = isPassword && showPassword ? 'text' : type

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && <label className="field__label">{label}</label>}
      <div style={{ position: 'relative' }}>
        <Tag
          type={as === 'input' ? actualType : undefined}
          className={fieldClass}
          style={isPassword ? { paddingRight: 48 } : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-4)',
              cursor: 'pointer',
            }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
      {error && <span className="field__error">{error}</span>}
      {!error && hint && <span className="field__hint">{hint}</span>}
    </div>
  )
}