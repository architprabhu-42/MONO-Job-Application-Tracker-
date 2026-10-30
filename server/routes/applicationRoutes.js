import { Router } from 'express';
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import { applicationSchema, statusSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

router.get('/', listApplications);
router.post('/', validate(applicationSchema), createApplication);
router.get('/:id', validateObjectId(), getApplication);
router.put('/:id', validateObjectId(), validate(applicationSchema), updateApplication);
router.patch('/:id/status', validateObjectId(), validate(statusSchema), updateApplicationStatus);
router.delete('/:id', validateObjectId(), deleteApplication);

export default router;
