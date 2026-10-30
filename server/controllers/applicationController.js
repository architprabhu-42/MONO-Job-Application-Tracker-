import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import Resume from '../models/Resume.js';
import AppError from '../utils/AppError.js';
import { APPLICATION_STATUSES, JOB_TYPES } from '../utils/constants.js';
import { escapeRegex } from '../utils/dates.js';

const RESUME_FIELDS = 'name version originalFilename';

const SORTS = {
  newest: { dateApplied: -1, createdAt: -1 },
  oldest: { dateApplied: 1, createdAt: 1 },
  company: { company: 1, dateApplied: -1 },
};

// Makes sure a resume id (if given) belongs to the logged-in user.
async function assertOwnResume(resumeId, userId) {
  if (resumeId && !(await Resume.exists({ _id: resumeId, userId }))) {
    throw new AppError('Selected resume was not found.', 400, { resumeId: 'Selected resume was not found' });
  }
}

// GET /api/applications?search=&status=&jobType=&sort=newest|oldest|company|status
export async function listApplications(req, res) {
  const { search, status, jobType, sort = 'newest' } = req.query;
  const filter = { userId: req.user._id };

  if (APPLICATION_STATUSES.includes(status)) filter.status = status;
  if (JOB_TYPES.includes(jobType)) filter.jobType = jobType;
  if (typeof search === 'string' && search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ company: pattern }, { position: pattern }];
  }

  let applications = await Application.find(filter)
    .sort(SORTS[sort] || SORTS.newest)
    .populate('resumeId', RESUME_FIELDS);

  // Sort by pipeline order (Wishlist → Withdrawn) rather than alphabetically.
  if (sort === 'status') {
    applications = applications.sort(
      (a, b) =>
        APPLICATION_STATUSES.indexOf(a.status) - APPLICATION_STATUSES.indexOf(b.status) ||
        b.dateApplied - a.dateApplied
    );
  }

  res.json({ success: true, data: applications });
}

// GET /api/applications/:id  (includes its interviews)
export async function getApplication(req, res) {
  const application = await Application.findOne({ _id: req.params.id, userId: req.user._id }).populate(
    'resumeId',
    RESUME_FIELDS
  );
  if (!application) throw new AppError('Application not found.', 404);

  const interviews = await Interview.find({ applicationId: application._id, userId: req.user._id }).sort({
    date: 1,
    time: 1,
  });
  res.json({ success: true, data: { application, interviews } });
}

// POST /api/applications
export async function createApplication(req, res) {
  await assertOwnResume(req.body.resumeId, req.user._id);
  const created = await Application.create({ ...req.body, userId: req.user._id });
  const application = await created.populate('resumeId', RESUME_FIELDS);
  res.status(201).json({ success: true, message: 'Application added.', data: application });
}

// PUT /api/applications/:id
export async function updateApplication(req, res) {
  await assertOwnResume(req.body.resumeId, req.user._id);
  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { returnDocument: 'after', runValidators: true }
  ).populate('resumeId', RESUME_FIELDS);

  if (!application) throw new AppError('Application not found.', 404);
  res.json({ success: true, message: 'Application updated.', data: application });
}

// PATCH /api/applications/:id/status — quick status change
export async function updateApplicationStatus(req, res) {
  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { status: req.body.status },
    { returnDocument: 'after', runValidators: true }
  ).populate('resumeId', RESUME_FIELDS);

  if (!application) throw new AppError('Application not found.', 404);
  res.json({ success: true, message: `Status changed to ${application.status}.`, data: application });
}

// DELETE /api/applications/:id — also removes its interviews so none are left orphaned
export async function deleteApplication(req, res) {
  const application = await Application.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!application) throw new AppError('Application not found.', 404);

  const { deletedCount } = await Interview.deleteMany({ applicationId: application._id, userId: req.user._id });
  res.json({
    success: true,
    message: 'Application deleted.',
    data: { id: application._id, deletedInterviews: deletedCount },
  });
}
