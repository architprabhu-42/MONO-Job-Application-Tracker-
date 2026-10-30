// Frontend Zod schemas used with React Hook Form. The server validates the
// same rules again (server/validators/schemas.js).
import { z } from 'zod';
import {
  APPLICATION_STATUSES,
  INTERVIEW_RESULTS,
  INTERVIEW_TYPES,
  JOB_TYPES,
  MAX_RESUME_SIZE,
  WORK_ARRANGEMENTS,
} from './constants.js';

const requiredText = (label, max) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

const optionalText = (label, max) => z.string().trim().max(max, `${label} must be at most ${max} characters`);

const selectOne = (values, message) => z.string().refine((v) => values.includes(v), message);

const isValidDate = (v) => {
  const date = new Date(v);
  const year = date.getUTCFullYear();
  return !Number.isNaN(date.getTime()) && year >= 1970 && year <= 2100;
};

const requiredDate = (label) =>
  z.string().min(1, `${label} is required`).refine(isValidDate, `${label} must be a valid date`);

const optionalDate = (label) => z.string().refine((v) => v === '' || isValidDate(v), `${label} must be a valid date`);

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email address');

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => {
    if (v === '') return true;
    try {
      const url = new URL(v);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Enter a valid URL starting with http:// or https://');

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');
const name = requiredText('Name', 60).refine((v) => v.length >= 2, 'Name must be at least 2 characters');

// Form 1 — Registration
export const registerSchema = z
  .object({
    name,
    email,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const profileSchema = z.object({ name, email });

// Form 2 — Job application
export const applicationSchema = z.object({
  company: requiredText('Company name', 100),
  position: requiredText('Job title', 100),
  jobType: selectOne(JOB_TYPES, 'Select a job type'),
  location: optionalText('Location', 100),
  workArrangement: z.string().refine((v) => v === '' || WORK_ARRANGEMENTS.includes(v), 'Select a valid option'),
  dateApplied: requiredDate('Date applied'),
  status: selectOne(APPLICATION_STATUSES, 'Select a status'),
  jobUrl: optionalUrl,
  salaryRange: optionalText('Salary range', 50),
  resumeId: z.string(),
  recruiterName: optionalText('Recruiter name', 100),
  recruiterEmail: optionalEmail,
  jobDescription: optionalText('Job description', 5000),
  notes: optionalText('Notes', 5000),
  followUpDate: optionalDate('Follow-up date'),
});

// Form 3 — Resume upload. The PDF is required when creating, optional when editing.
export function makeResumeSchema({ isEdit }) {
  return z.object({
    name: requiredText('Resume name', 100),
    version: requiredText('Version label', 30),
    description: optionalText('Description', 1000),
    skillsTargeted: optionalText('Skills', 500),
    dateCreated: optionalDate('Date created'),
    file: z
      .any()
      .refine((files) => isEdit || files?.length === 1, 'Please choose a PDF file')
      .refine((files) => {
        const file = files?.[0];
        return !file || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      }, 'Only PDF files are allowed')
      .refine((files) => !files?.[0] || files[0].size <= MAX_RESUME_SIZE, 'The file must be 4 MB or smaller'),
  });
}

// Form 4 — Interview
export const interviewSchema = z.object({
  applicationId: z.string().min(1, 'Select the related application'),
  date: requiredDate('Interview date'),
  time: z.string().refine((v) => v === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), 'Enter a valid time'),
  type: selectOne(INTERVIEW_TYPES, 'Select an interview type'),
  interviewerName: optionalText('Interviewer name', 100),
  meetingLink: optionalText('Meeting link or location', 300),
  preparationNotes: optionalText('Preparation notes', 5000),
  result: selectOne(INTERVIEW_RESULTS, 'Select a result'),
});
