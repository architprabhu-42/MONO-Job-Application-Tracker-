import mongoose from 'mongoose';

// Only metadata lives here. The PDF itself is stored on disk or in GridFS
// (see services/storage.js) and referenced by fileStorageKey.
const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    version: { type: String, required: true, trim: true, maxlength: 30 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    skillsTargeted: { type: [String], default: [] },
    dateCreated: { type: Date, default: null },
    fileStorageKey: { type: String, required: true },
    storageDriver: { type: String, enum: ['local', 'gridfs'], required: true },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      // The storage key is an internal detail; files are served through the download route.
      transform(doc, ret) {
        delete ret.fileStorageKey;
        delete ret.storageDriver;
        delete ret.__v;
        return ret;
      },
    },
  }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Resume', resumeSchema);
