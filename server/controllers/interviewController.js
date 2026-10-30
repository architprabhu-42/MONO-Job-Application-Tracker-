import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import AppError from '../utils/AppError.js';
import { escapeRegex, startOfTodayUTC } from '../utils/dates.js';

const APPLICATION_FIELDS = 'company position status';
const OPEN_RESULTS = ['Pending', 'Rescheduled'];

async function assertOwnApplication(applicationId, userId) {
  const application = await Application.findOne({ _id: applicationId, userId });
  if (!application) {
    throw new AppError('Selected application was not found.', 400, {
      applicationId: 'Selected application was not found',
    });
  }
  return application;
}

// GET /api/interviews?view=upcoming|completed|all&search=&applicationId=
// "upcoming"  = today or later and still Pending/Rescheduled
// "completed" = in the past, or already Passed/Failed
export async function listInterviews(req, res) {
  const { view = 'all', search, applicationId } = req.query;
  const userId = req.user._id;
  const today = startOfTodayUTC();
  const filter = { userId };
  let sort = { date: 1, time: 1 };

  if (view === 'upcoming') {
    filter.date = { $gte: today };
    filter.result = { $in: OPEN_RESULTS };
  } else if (view === 'completed') {
    filter.$or = [{ date: { $lt: today } }, { result: { $nin: OPEN_RESULTS } }];
    sort = { date: -1, time: -1 };
  }

  if (typeof applicationId === 'string' && /^[a-f\d]{24}$/i.test(applicationId)) {
    filter.applicationId = applicationId;
  }

  // Interviews don't store company/position themselves, so search the
  // user's applications first and filter interviews by those ids.
  if (typeof search === 'string' && search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    const matches = await Application.find({ userId, $or: [{ company: pattern }, { position: pattern }] }).distinct(
      '_id'
    );
    filter.applicationId = filter.applicationId
      ? matches.find((id) => id.equals(filter.applicationId)) ?? null
      : { $in: matches };
  }

  const interviews = await Interview.find(filter).sort(sort).populate('applicationId', APPLICATION_FIELDS);
  res.json({ success: true, data: interviews });
}

// GET /api/interviews/:id
export async function getInterview(req, res) {
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id }).populate(
    'applicationId',
    APPLICATION_FIELDS
  );
  if (!interview) throw new AppError('Interview not found.', 404);
  res.json({ success: true, data: interview });
}

// POST /api/interviews
export async function createInterview(req, res) {
  const application = await assertOwnApplication(req.body.applicationId, req.user._id);
  const created = await Interview.create({ ...req.body, userId: req.user._id });

  // Scheduling an interview moves an early-stage application to "Interview".
  if (['Wishlist', 'Applied', 'Under Review'].includes(application.status)) {
    application.status = 'Interview';
    await application.save();
  }

  const interview = await created.populate('applicationId', APPLICATION_FIELDS);
  res.status(201).json({ success: true, message: 'Interview scheduled.', data: interview });
}

// PUT /api/interviews/:id
export async function updateInterview(req, res) {
  await assertOwnApplication(req.body.applicationId, req.user._id);
  const interview = await Interview.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    returnDocument: 'after',
    runValidators: true,
  }).populate('applicationId', APPLICATION_FIELDS);

  if (!interview) throw new AppError('Interview not found.', 404);
  res.json({ success: true, message: 'Interview updated.', data: interview });
}

// DELETE /api/interviews/:id
export async function deleteInterview(req, res) {
  const interview = await Interview.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!interview) throw new AppError('Interview not found.', 404);
  res.json({ success: true, message: 'Interview deleted.', data: { id: interview._id } });
}
