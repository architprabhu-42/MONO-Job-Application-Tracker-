// Resume file storage with two simple drivers:
//   local  -> files saved in server/uploads (great for development)
//   gridfs -> files saved inside MongoDB using GridFS (persists on hosts like
//             Render whose filesystem is wiped on every deploy/restart)
// Choose with STORAGE_DRIVER in .env. Each resume remembers which driver saved it.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

// Vercel functions have no persistent disk, so GridFS is always used there.
export const activeDriver = () =>
  process.env.STORAGE_DRIVER === 'gridfs' || process.env.VERCEL ? 'gridfs' : 'local';

function uploadDir() {
  return path.resolve(import.meta.dirname, '..', process.env.UPLOAD_DIR || 'uploads');
}

// Only ever use the basename of a stored key so a key can never point
// outside the upload folder (prevents path traversal).
function localPath(key) {
  return path.join(uploadDir(), path.basename(key));
}

function bucket() {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'resumeFiles' });
}

// Saves a PDF buffer and returns { key, driver } to store on the Resume document.
export async function saveFile(buffer) {
  const key = `${randomUUID()}.pdf`;
  const driver = activeDriver();

  if (driver === 'gridfs') {
    await new Promise((resolve, reject) => {
      const stream = bucket().openUploadStream(key, { metadata: { contentType: 'application/pdf' } });
      stream.on('finish', resolve);
      stream.on('error', reject);
      stream.end(buffer);
    });
  } else {
    await fsp.mkdir(uploadDir(), { recursive: true });
    await fsp.writeFile(localPath(key), buffer);
  }

  return { key, driver };
}

// Returns a readable stream for the file, or null if it no longer exists.
export async function openFile(key, driver) {
  if (driver === 'gridfs') {
    const [file] = await bucket().find({ filename: key }).limit(1).toArray();
    return file ? bucket().openDownloadStream(file._id) : null;
  }
  const filePath = localPath(key);
  return fs.existsSync(filePath) ? fs.createReadStream(filePath) : null;
}

export async function deleteFile(key, driver) {
  try {
    if (driver === 'gridfs') {
      const files = await bucket().find({ filename: key }).toArray();
      await Promise.all(files.map((f) => bucket().delete(f._id)));
    } else {
      await fsp.unlink(localPath(key));
    }
  } catch (err) {
    // A missing file should not block deleting the database record.
    if (err.code !== 'ENOENT') console.error('Failed to delete resume file:', err.message);
  }
}
