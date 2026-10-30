export const APPLICATION_STATUSES = [
  'Wishlist',
  'Applied',
  'Under Review',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

export const JOB_TYPES = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance'];

export const WORK_ARRANGEMENTS = ['On-site', 'Hybrid', 'Remote'];

export const INTERVIEW_TYPES = ['HR', 'Technical', 'Behavioral', 'Phone', 'Video', 'On-site'];

export const INTERVIEW_RESULTS = ['Pending', 'Passed', 'Failed', 'Rescheduled'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'company', label: 'Company (A–Z)' },
  { value: 'status', label: 'Status' },
];

export const MAX_RESUME_SIZE = 4 * 1024 * 1024; // 4 MB (Vercel limits request bodies to 4.5 MB)
