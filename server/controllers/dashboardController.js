import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import Resume from '../models/Resume.js';
import { APPLICATION_STATUSES, CLOSED_STATUSES, IN_PROGRESS_STATUSES } from '../utils/constants.js';
import { addDays, startOfTodayUTC } from '../utils/dates.js';

// GET /api/dashboard/stats — every number here is calculated from the database.
export async function getStats(req, res) {
  const userId = req.user._id;
  const today = startOfTodayUTC();
  const upcomingFilter = { userId, date: { $gte: today }, result: { $in: ['Pending', 'Rescheduled'] } };

  const [statusGroups, interviewsScheduled, totalInterviews, totalResumes, recentApplications, upcomingInterviews, followUps] =
    await Promise.all([
      Application.aggregate([{ $match: { userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Interview.countDocuments(upcomingFilter),
      Interview.countDocuments({ userId }),
      Resume.countDocuments({ userId }),
      Application.find({ userId })
        .sort({ dateApplied: -1, createdAt: -1 })
        .limit(5)
        .populate('resumeId', 'name version'),
      Interview.find(upcomingFilter)
        .sort({ date: 1, time: 1 })
        .limit(5)
        .populate('applicationId', 'company position'),
      // Follow-ups that are overdue or due within the next 7 days.
      Application.find({
        userId,
        followUpDate: { $ne: null, $lte: addDays(today, 7) },
        status: { $nin: CLOSED_STATUSES },
      })
        .sort({ followUpDate: 1 })
        .limit(5)
        .select('company position followUpDate status'),
    ]);

  const statusCounts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));
  for (const group of statusGroups) statusCounts[group._id] = group.count;

  const totalApplications = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);
  const inProgress = IN_PROGRESS_STATUSES.reduce((sum, s) => sum + statusCounts[s], 0);

  res.json({
    success: true,
    data: {
      totalApplications,
      inProgress,
      interviewsScheduled,
      offers: statusCounts.Offer,
      totalInterviews,
      totalResumes,
      statusCounts,
      recentApplications,
      upcomingInterviews,
      followUps,
    },
  });
}
