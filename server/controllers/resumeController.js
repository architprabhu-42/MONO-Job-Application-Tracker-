import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import AppError from '../utils/AppError.js';
import { isPdfBuffer } from '../middleware/upload.js';
import { deleteFile, openFile, saveFile } from '../services/storage.js';

async function findOwnResume(id, userId) {
  const resume = await Resume.findOne({ _id: id, userId });
  if (!resume) throw new AppError('Resume not found.', 404);
  return resume;
}

function assertValidPdf(file) {
  if (!isPdfBuffer(file.buffer)) {
    throw new AppError('This file is not a valid PDF.', 400, { file: 'This file is not a valid PDF' });
  }
}

// GET /api/resumes — each resume includes how many applications use it
export async function listResumes(req, res) {
  const [resumes, usage] = await Promise.all([
    Resume.find({ userId: req.user._id }).sort({ createdAt: -1 }),
    Application.aggregate([
      { $match: { userId: req.user._id, resumeId: { $ne: null } } },
      { $group: { _id: '$resumeId', count: { $sum: 1 } } },
    ]),
  ]);

  const usageById = new Map(usage.map((u) => [u._id.toString(), u.count]));
  const data = resumes.map((r) => ({ ...r.toJSON(), usageCount: usageById.get(r._id.toString()) || 0 }));
  res.json({ success: true, data });
}

// GET /api/resumes/:id — includes the applications that used this resume
export async function getResume(req, res) {
  const resume = await findOwnResume(req.params.id, req.user._id);
  const applications = await Application.find({ userId: req.user._id, resumeId: resume._id })
    .select('company position status dateApplied')
    .sort({ dateApplied: -1 });
  res.json({ success: true, data: { resume, applications } });
}

// POST /api/resumes (multipart/form-data with a "file" field)
export async function createResume(req, res) {
  if (!req.file) {
    throw new AppError('Please upload a PDF file.', 400, { file: 'Please upload a PDF file' });
  }
  assertValidPdf(req.file);

  const { key, driver } = await saveFile(req.file.buffer);
  try {
    const resume = await Resume.create({
      ...req.body,
      userId: req.user._id,
      fileStorageKey: key,
      storageDriver: driver,
      originalFilename: req.file.originalname,
      mimeType: 'application/pdf',
      fileSize: req.file.size,
    });
    res
      .status(201)
      .json({ success: true, message: 'Resume uploaded.', data: { ...resume.toJSON(), usageCount: 0 } });
  } catch (err) {
    await deleteFile(key, driver); // don't leave an orphaned file behind
    throw err;
  }
}

// PUT /api/resumes/:id — update metadata, optionally replace the PDF
export async function updateResume(req, res) {
  const resume = await findOwnResume(req.params.id, req.user._id);
  Object.assign(resume, req.body);

  let oldFile = null;
  if (req.file) {
    assertValidPdf(req.file);
    const { key, driver } = await saveFile(req.file.buffer);
    oldFile = { key: resume.fileStorageKey, driver: resume.storageDriver };
    Object.assign(resume, {
      fileStorageKey: key,
      storageDriver: driver,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
    });
  }

  await resume.save();
  if (oldFile) await deleteFile(oldFile.key, oldFile.driver);

  const usageCount = await Application.countDocuments({ userId: req.user._id, resumeId: resume._id });
  res.json({ success: true, message: 'Resume updated.', data: { ...resume.toJSON(), usageCount } });
}

// DELETE /api/resumes/:id — unlinks it from applications first so no broken references remain
export async function deleteResume(req, res) {
  const resume = await findOwnResume(req.params.id, req.user._id);

  const { modifiedCount } = await Application.updateMany(
    { userId: req.user._id, resumeId: resume._id },
    { $set: { resumeId: null } }
  );
  await resume.deleteOne();
  await deleteFile(resume.fileStorageKey, resume.storageDriver);

  res.json({
    success: true,
    message: 'Resume deleted.',
    data: { id: resume._id, unlinkedApplications: modifiedCount },
  });
}

// GET /api/resumes/:id/download[?download=1] — streams the PDF to its owner only
export async function downloadResume(req, res) {
  const resume = await findOwnResume(req.params.id, req.user._id);
  const stream = await openFile(resume.fileStorageKey, resume.storageDriver);
  if (!stream) throw new AppError('The PDF file for this resume is missing from storage.', 404);

  const safeName = `${resume.name} ${resume.version}`.replace(/[^\w.\- ]+/g, '').trim() || 'resume';
  const disposition = req.query.download ? 'attachment' : 'inline';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', resume.fileSize);
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename="${safeName}.pdf"; filename*=UTF-8''${encodeURIComponent(safeName)}.pdf`
  );
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  stream.on('error', (err) => {
    console.error('Resume stream error:', err.message);
    if (!res.headersSent) res.status(500).end();
    else res.destroy();
  });
  stream.pipe(res);
}
