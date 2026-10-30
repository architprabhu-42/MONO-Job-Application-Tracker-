// Allowed values shared by the Mongoose models and the request validators.
export const APPLICATION_STATUSES = [
  'Wishlist',
  'Applied',
  'Under Review',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

// Statuses that count as "in progress" on the dashboard.
export const IN_PROGRESS_STATUSES = ['Applied', 'Under Review', 'Interview'];

// Statuses that no longer need a follow-up.
export const CLOSED_STATUSES = ['Offer', 'Rejected', 'Withdrawn'];

export const JOB_TYPES = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance'];

export const WORK_ARRANGEMENTS = ['On-site', 'Hybrid', 'Remote'];

export const INTERVIEW_TYPES = ['HR', 'Technical', 'Behavioral', 'Phone', 'Video', 'On-site'];

export const INTERVIEW_RESULTS = ['Pending', 'Passed', 'Failed', 'Rescheduled'];

export const MAX_RESUME_SIZE = 4 * 1024 * 1024; // 4 MB (Vercel limits request bodies to 4.5 MB)

export const AUTH_COOKIE = 'mono_token';
