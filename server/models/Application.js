import mongoose from 'mongoose';
import { APPLICATION_STATUSES, JOB_TYPES, WORK_ARRANGEMENTS } from '../utils/constants.js';

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true, trim: true, maxlength: 100 },
    position: { type: String, required: true, trim: true, maxlength: 100 },
    jobType: { type: String, required: true, enum: JOB_TYPES },
    location: { type: String, trim: true, maxlength: 100, default: '' },
    workArrangement: { type: String, enum: [...WORK_ARRANGEMENTS, null], default: null },
    dateApplied: { type: Date, required: true },
    status: { type: String, required: true, enum: APPLICATION_STATUSES, default: 'Applied' },
    jobUrl: { type: String, trim: true, default: '' },
    salaryRange: { type: String, trim: true, maxlength: 50, default: '' },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    recruiterName: { type: String, trim: true, maxlength: 100, default: '' },
    recruiterEmail: { type: String, trim: true, lowercase: true, maxlength: 100, default: '' },
    jobDescription: { type: String, maxlength: 5000, default: '' },
    notes: { type: String, maxlength: 5000, default: '' },
    followUpDate: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

// Most queries are "this user's applications, newest first" or filtered by status.
applicationSchema.index({ userId: 1, dateApplied: -1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, resumeId: 1 });

export default mongoose.model('Application', applicationSchema);
