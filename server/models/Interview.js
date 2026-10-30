import mongoose from 'mongoose';
import { INTERVIEW_RESULTS, INTERVIEW_TYPES } from '../utils/constants.js';

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    date: { type: Date, required: true },
    time: { type: String, default: '' }, // "HH:mm", optional
    type: { type: String, required: true, enum: INTERVIEW_TYPES },
    interviewerName: { type: String, trim: true, maxlength: 100, default: '' },
    meetingLink: { type: String, trim: true, maxlength: 300, default: '' },
    preparationNotes: { type: String, maxlength: 5000, default: '' },
    result: { type: String, enum: INTERVIEW_RESULTS, default: 'Pending' },
  },
  { timestamps: true, versionKey: false }
);

interviewSchema.index({ userId: 1, date: 1 });
interviewSchema.index({ userId: 1, applicationId: 1 });

export default mongoose.model('Interview', interviewSchema);
