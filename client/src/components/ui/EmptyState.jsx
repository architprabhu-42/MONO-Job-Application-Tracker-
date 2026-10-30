export default function EmptyState({ icon: Icon, title, description, action, compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'empty-compact' : ''}`}>
      {Icon && (
        <span className="empty-icon">
          <Icon size={compact ? 18 : 22} strokeWidth={1.75} />
        </span>
      )}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
