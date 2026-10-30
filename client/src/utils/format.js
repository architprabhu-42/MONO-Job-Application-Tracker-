// Dates like "dateApplied" are stored as midnight UTC, so they are always
// formatted in UTC to avoid showing the previous day in some time zones.
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  });
}

// "2026-10-23" for <input type="date">
export function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export function todayInputDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Whole days between a stored date and today (positive = in the past).
export function daysFromToday(value) {
  if (!value) return null;
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((todayUtc - new Date(value).getTime()) / DAY_MS);
}

export function daysAgoLabel(value) {
  const days = daysFromToday(value);
  if (days === null) return '';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 1) return `${days} days ago`;
  if (days === -1) return 'Tomorrow';
  return `In ${-days} days`;
}

// "14:30" → "2:30 PM"
export function formatTime(value) {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?'
  );
}

export const resumeLabel = (resume) => (resume ? `${resume.name} — ${resume.version}` : '');
