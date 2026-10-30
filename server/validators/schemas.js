// Server-side validation for every request body. These mirror the frontend
// Zod schemas so the API never trusts the browser.
import { z } from 'zod';
import {
  APPLICATION_STATUSES,
  INTERVIEW_RESULTS,
  INTERVIEW_TYPES,
  JOB_TYPES,
  WORK_ARRANGEMENTS,
} from '../utils/constants.js';

const OBJECT_ID = /^[a-f\d]{24}$/i;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

function parseDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  return year >= 1970 && year <= 2100 ? date : null;
}

const requiredText = (label, max) =>
  z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

const optionalText = (label, max) =>
  z.preprocess(
    (v) => (isBlank(v) ? '' : v),
    z.string().trim().max(max, `${label} must be at most ${max} characters`)
  );

const requiredEnum = (values, label) =>
  z.enum(values, { errorMap: () => ({ message: `Select a valid ${label}` }) });

const optionalEnum = (values, label) =>
  z.preprocess((v) => (isBlank(v) ? null : v), requiredEnum(values, label).nullable());

const requiredDate = (label) =>
  z.any().transform((v, ctx) => {
    if (isBlank(v)) {
      ctx.addIssue({ code: 'custom', message: `${label} is required` });
      return z.NEVER;
    }
    const date = parseDate(v);
    if (!date) {
      ctx.addIssue({ code: 'custom', message: `${label} must be a valid date` });
      return z.NEVER;
    }
    return date;
  });

const optionalDate = (label) =>
  z.any().transform((v, ctx) => {
    if (isBlank(v)) return null;
    const date = parseDate(v);
    if (!date) {
      ctx.addIssue({ code: 'custom', message: `${label} must be a valid date` });
      return z.NEVER;
    }
    return date;
  });

const optionalEmail = z.preprocess(
  (v) => (isBlank(v) ? '' : v),
  z
    .string()
    .trim()
    .toLowerCase()
    .max(100)
    .refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email address')
);

const optionalUrl = z.preprocess(
  (v) => (isBlank(v) ? '' : v),
  z
    .string()
    .trim()
    .max(500, 'URL is too long')
    .refine((v) => {
      if (v === '') return true;
      try {
        const url = new URL(v);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'Enter a valid URL starting with http:// or https://')
);

const optionalObjectId = (label) =>
  z.preprocess(
    (v) => (isBlank(v) ? null : v),
    z.string().regex(OBJECT_ID, `Select a valid ${label}`).nullable()
  );

const email = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(100);

const name = requiredText('Name', 60).refine((v) => v.length >= 2, 'Name must be at least 2 characters');

// ---------- Auth ----------
export const registerSchema = z
  .object({
    name,
    email,
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export const profileSchema = z.object({ name, email });

// ---------- Applications ----------
export const applicationSchema = z.object({
  company: requiredText('Company name', 100),
  position: requiredText('Job title', 100),
  jobType: requiredEnum(JOB_TYPES, 'job type'),
  location: optionalText('Location', 100),
  workArrangement: optionalEnum(WORK_ARRANGEMENTS, 'work arrangement'),
  dateApplied: requiredDate('Date applied'),
  status: requiredEnum(APPLICATION_STATUSES, 'status'),
  jobUrl: optionalUrl,
  salaryRange: optionalText('Salary range', 50),
  resumeId: optionalObjectId('resume'),
  recruiterName: optionalText('Recruiter name', 100),
  recruiterEmail: optionalEmail,
  jobDescription: optionalText('Job description', 5000),
  notes: optionalText('Notes', 5000),
  followUpDate: optionalDate('Follow-up date'),
});

export const statusSchema = z.object({
  status: requiredEnum(APPLICATION_STATUSES, 'status'),
});

// ---------- Resumes (multipart form fields arrive as strings) ----------
export const resumeSchema = z.object({
  name: requiredText('Resume name', 100),
  version: requiredText('Version label', 30),
  description: optionalText('Description', 1000),
  skillsTargeted: z.preprocess(
    (v) => (isBlank(v) ? '' : v),
    z
      .string()
      .max(500, 'Skills must be at most 500 characters')
      .transform((v) =>
        v
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 20)
      )
  ),
  dateCreated: optionalDate('Date created'),
});

// ---------- Interviews ----------
export const interviewSchema = z.object({
  applicationId: z
    .string({ required_error: 'Select the related application' })
    .regex(OBJECT_ID, 'Select the related application'),
  date: requiredDate('Interview date'),
  time: z.preprocess(
    (v) => (isBlank(v) ? '' : v),
    z.string().refine((v) => v === '' || TIME.test(v), 'Enter a valid time (HH:mm)')
  ),
  type: requiredEnum(INTERVIEW_TYPES, 'interview type'),
  interviewerName: optionalText('Interviewer name', 100),
  meetingLink: optionalText('Meeting link or location', 300),
  preparationNotes: optionalText('Preparation notes', 5000),
  result: z.preprocess((v) => (isBlank(v) ? 'Pending' : v), requiredEnum(INTERVIEW_RESULTS, 'result')),
});
