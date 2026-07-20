import Icon from './Icon';

const VARIANTS = {
  primary: 'btn-primary',
  soft: 'btn-soft',
  ghost: 'btn-ghost',
  slate: 'btn-slate',
  white: 'btn-white',
  glass: 'btn-glass',
  danger: 'btn-danger',
};

/** Themed button. Pass `icon` (Icon name), `variant`, `size` ('sm'), `loading`. */
export default function Button({
  children,
  variant = 'primary',
  size,
  icon,
  loading = false,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn ${VARIANTS[variant] || VARIANTS.primary} ${size === 'sm' ? 'btn-sm' : ''} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <Icon name="refresh" className="animate-spin" width={15} height={15} />
      ) : (
        icon && <Icon name={icon} width={size === 'sm' ? 13 : 15} height={size === 'sm' ? 13 : 15} />
      )}
      {children}
    </button>
  );
}
