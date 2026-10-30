export default function LoadingState({ label = 'Loading…', compact = false }) {
  return (
    <div className={`loading-state ${compact ? 'loading-compact' : ''}`} role="status">
      <span className="spinner spinner-dark" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
