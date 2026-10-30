import { Link } from 'react-router-dom';

// variant: primary (black) | secondary (white, bordered) | ghost | danger
// Pass `to` to render a router link, `href` for an external link.
export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  to,
  href,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const classes = `mbtn mbtn-${variant} mbtn-${size} ${!children ? 'mbtn-icon' : ''} ${className}`.trim();
  const iconSize = size === 'sm' ? 15 : 17;
  const content = (
    <>
      {loading ? <span className="spinner" aria-hidden="true" /> : Icon && <Icon size={iconSize} strokeWidth={2} />}
      {children && <span>{children}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {content}
    </button>
  );
}
