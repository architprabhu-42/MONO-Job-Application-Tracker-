// Adds 10 sample job applications to an existing account without deleting anything.
//   npm run add-samples -- you@example.com
// Applications are linked to the account's existing resumes (if any), in rotation.
import '../config/env.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import { addDays, startOfTodayUTC } from '../utils/dates.js';

const email = process.argv[2]?.toLowerCase();

const SAMPLES = [
  { company: 'Amazon', position: 'SDE Intern', jobType: 'Internship', status: 'Applied', daysAgo: 3, workArrangement: 'On-site', location: 'Hyderabad', salaryRange: '₹80,000 / month', jobUrl: 'https://www.amazon.jobs', followUpIn: 4, notes: 'Applied through campus portal. Online assessment expected within a week.' },
  { company: 'Infosys', position: 'Systems Engineer', jobType: 'Full-time', status: 'Under Review', daysAgo: 12, workArrangement: 'On-site', location: 'Mysuru', salaryRange: '₹3.6 LPA', recruiterName: 'Kavya Nair', recruiterEmail: 'kavya.nair@example.com', followUpIn: -2 },
  { company: 'TCS', position: 'Assistant System Engineer', jobType: 'Full-time', status: 'Interview', daysAgo: 18, workArrangement: 'Hybrid', location: 'Chennai', salaryRange: '₹3.4 LPA', notes: 'Technical + HR round scheduled after NQT.' },
  { company: 'Adobe', position: 'Frontend Engineer Intern', jobType: 'Internship', status: 'Wishlist', daysAgo: 1, workArrangement: 'Hybrid', location: 'Noida', jobUrl: 'https://careers.adobe.com', notes: 'Ask a senior for a referral before applying.' },
  { company: 'Paytm', position: 'Backend Developer', jobType: 'Full-time', status: 'Rejected', daysAgo: 35, workArrangement: 'On-site', location: 'Noida', notes: 'Rejected after the system design round. Revise caching and queues.' },
  { company: 'Wipro', position: 'Project Engineer', jobType: 'Full-time', status: 'Offer', daysAgo: 40, workArrangement: 'On-site', location: 'Bengaluru', salaryRange: '₹4 LPA', recruiterName: 'Rahul Verma', recruiterEmail: 'rahul.verma@example.com', notes: 'Offer letter received. Joining date to be confirmed.' },
  { company: 'Upwork Client — EdTech Startup', position: 'React Developer', jobType: 'Freelance', status: 'Applied', daysAgo: 6, workArrangement: 'Remote', salaryRange: '$20 / hour', followUpIn: 1 },
  { company: 'Accenture', position: 'Associate Software Engineer', jobType: 'Full-time', status: 'Withdrawn', daysAgo: 28, workArrangement: 'Hybrid', location: 'Pune', notes: 'Withdrew after accepting another offer.' },
  { company: 'Juspay', position: 'Software Engineer — Contract', jobType: 'Contract', status: 'Under Review', daysAgo: 9, workArrangement: 'Remote', salaryRange: '₹60,000 / month', jobUrl: 'https://juspay.in/careers' },
  { company: 'Cognizant', position: 'Part-time Data Analyst', jobType: 'Part-time', status: 'Interview', daysAgo: 15, workArrangement: 'Remote', recruiterName: 'Meera Iyer', recruiterEmail: 'meera.iyer@example.com', followUpIn: 3, jobDescription: 'SQL, Excel and Power BI dashboards for weekly business reports.' },
];

async function run() {
  if (!email) {
    console.error('Usage: npm run add-samples -- you@example.com');
    process.exit(1);
  }
  await connectDB(process.env.MONGODB_URI);

  const user = await User.findOne({ email });
  if (!user) throw new Error(`No account found for ${email}`);

  const resumes = await Resume.find({ userId: user._id }).sort({ createdAt: 1 });
  const today = startOfTodayUTC();

  const docs = SAMPLES.map(({ daysAgo, followUpIn, ...fields }, i) => ({
    ...fields,
    userId: user._id,
    dateApplied: addDays(today, -daysAgo),
    followUpDate: followUpIn === undefined ? null : addDays(today, followUpIn),
    // Link roughly two out of three applications to a resume, rotating through them.
    resumeId: resumes.length && i % 3 !== 2 ? resumes[i % resumes.length]._id : null,
  }));

  await Application.insertMany(docs);
  console.log(`Added ${docs.length} sample applications to ${email}.`);
}

run()
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
