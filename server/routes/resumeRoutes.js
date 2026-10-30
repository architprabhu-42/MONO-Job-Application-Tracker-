import { Router } from 'express';
import {
  createResume,
  deleteResume,
  downloadResume,
  getResume,
  listResumes,
  updateResume,
} from '../controllers/resumeController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import { resumeSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

router.get('/', listResumes);
router.post('/', uploadResume, validate(resumeSchema), createResume);
router.get('/:id', validateObjectId(), getResume);
router.put('/:id', validateObjectId(), uploadResume, validate(resumeSchema), updateResume);
router.delete('/:id', validateObjectId(), deleteResume);
router.get('/:id/download', validateObjectId(), downloadResume);

export default router;
