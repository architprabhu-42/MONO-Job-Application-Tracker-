// Monochrome badges: statuses are told apart by fill, border style and weight, not color.
const slug = (value = '') => value.toLowerCase().replace(/\s+/g, '-');

export default function StatusBadge({ status, kind = 'status' }) {
  if (!status) return null;
  return (
    <span className={`badge-mono ${kind}-${slug(status)}`}>
      <span className="badge-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

export function Tag({ children }) {
  return <span className="tag">{children}</span>;
}
