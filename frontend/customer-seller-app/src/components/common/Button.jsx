export default function Button({ children, variant = 'primary', size = 'md', block = false, loading = false, disabled = false, type = 'button', onClick, className = '', style, ...rest }) {
  const classes = ['btn', `btn--${variant}`, size !== 'md' && `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ')
  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled || loading} style={style} {...rest}>
      {loading ? 'Please wait…' : children}
    </button>
  )
}