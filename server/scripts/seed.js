// Demo data for testing and presentations: `npm run seed` (from /server).
// Creates (or resets) a demo account with sample resumes, applications and interviews.
// It only touches the demo account's own records.
import '../config/env.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import Interview from '../models/Interview.js';
import { deleteFile, saveFile } from '../services/storage.js';
import { addDays, startOfTodayUTC } from '../utils/dates.js';

const DEMO_EMAIL = 'demo@mono.test';
const DEMO_PASSWORD = 'demo12345';

// Builds a tiny one-page PDF with a title, so the seeded resumes are real files.
function makePdf(title) {
  const text = title.replace(/[()\\]/g, '');
  const content = `BT /F1 20 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (user) {
    const oldResumes = await Resume.find({ userId: user._id });
    await Promise.all(oldResumes.map((r) => deleteFile(r.fileStorageKey, r.storageDriver)));
    await Promise.all([
      Resume.deleteMany({ userId: user._id }),
      Application.deleteMany({ userId: user._id }),
      Interview.deleteMany({ userId: user._id }),
    ]);
  } else {
    user = await User.create({
      name: 'Demo User',
      email: DEMO_EMAIL,
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    });
  }
  const userId = user._id;
  const today = startOfTodayUTC();
  const daysAgo = (n) => addDays(today, -n);

  const resumeDefs = [
    ['Software Engineer Resume', 'v1', 'General SWE resume with DSA and projects.', ['JavaScript', 'Node.js', 'DSA']],
    ['Frontend Developer Resume', 'v2', 'Focus on React, UI performance and accessibility.', ['React', 'CSS', 'Accessibility']],
    ['Machine Learning Resume', 'v1', 'Highlights ML coursework and Kaggle projects.', ['Python', 'PyTorch', 'Pandas']],
  ];
  const resumes = [];
  for (const [name, version, description, skillsTargeted] of resumeDefs) {
    const buffer = makePdf(`${name} ${version}`);
    const { key, driver } = await saveFile(buffer);
    resumes.push(
      await Resume.create({
        userId,
        name,
        version,
        description,
        skillsTargeted,
        dateCreated: daysAgo(60),
        fileStorageKey: key,
        storageDriver: driver,
        originalFilename: `${name.toLowerCase().replace(/\s+/g, '-')}-${version}.pdf`,
        mimeType: 'application/pdf',
        fileSize: buffer.length,
      })
    );
  }
  const [swe, frontend, ml] = resumes;

  const appDefs = [
    { company: 'Google', position: 'Software Engineering Intern', jobType: 'Internship', status: 'Interview', dateApplied: daysAgo(21), resumeId: swe._id, workArrangement: 'Hybrid', location: 'Bengaluru', salaryRange: '₹1,00,000 / month', recruiterName: 'Priya Sharma', recruiterEmail: 'priya@example.com', jobUrl: 'https://careers.google.com', followUpDate: addDays(today, 2) },
    { company: 'Microsoft', position: 'Frontend Developer', jobType: 'Full-time', status: 'Under Review', dateApplied: daysAgo(14), resumeId: frontend._id, workArrangement: 'On-site', location: 'Hyderabad', followUpDate: daysAgo(1) },
    { company: 'Zomato', position: 'React Developer', jobType: 'Full-time', status: 'Applied', dateApplied: daysAgo(6), resumeId: frontend._id, workArrangement: 'Remote' },
    { company: 'Flipkart', position: 'SDE I', jobType: 'Full-time', status: 'Offer', dateApplied: daysAgo(45), resumeId: swe._id, workArrangement: 'On-site', location: 'Bengaluru', salaryRange: '₹18–22 LPA' },
    { company: 'Swiggy', position: 'Data Science Intern', jobType: 'Internship', status: 'Rejected', dateApplied: daysAgo(30), resumeId: ml._id, workArrangement: 'Hybrid' },
    { company: 'Razorpay', position: 'Backend Engineer', jobType: 'Full-time', status: 'Wishlist', dateApplied: daysAgo(2), resumeId: null, notes: 'Referral possible through a senior from college.' },
    { company: 'Freshworks', position: 'ML Engineer', jobType: 'Contract', status: 'Interview', dateApplied: daysAgo(10), resumeId: ml._id, workArrangement: 'Remote' },
  ];
  const applications = await Application.insertMany(appDefs.map((a) => ({ ...a, userId })));
  const byCompany = Object.fromEntries(applications.map((a) => [a.company, a]));

  await Interview.insertMany([
    { userId, applicationId: byCompany.Google._id, date: addDays(today, 3), time: '10:30', type: 'Technical', interviewerName: 'Arjun Mehta', meetingLink: 'https://meet.google.com/abc-defg-hij', preparationNotes: 'Revise graphs, DP and system design basics.' },
    { userId, applicationId: byCompany.Freshworks._id, date: addDays(today, 6), time: '15:00', type: 'Video', interviewerName: 'Neha Rao', preparationNotes: 'Review ML project metrics.' },
    { userId, applicationId: byCompany.Google._id, date: daysAgo(7), time: '11:00', type: 'HR', result: 'Passed' },
    { userId, applicationId: byCompany.Flipkart._id, date: daysAgo(20), time: '14:00', type: 'On-site', result: 'Passed', meetingLink: 'Flipkart HQ, Bengaluru' },
  ]);

  console.log(`Seeded demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
