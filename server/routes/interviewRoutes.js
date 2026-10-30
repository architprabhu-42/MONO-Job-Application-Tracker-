import { Router } from 'express';
import {
  createInterview,
  deleteInterview,
  getInterview,
  listInterviews,
  updateInterview,
} from '../controllers/interviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import { interviewSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

router.get('/', listInterviews);
router.post('/', validate(interviewSchema), createInterview);
router.get('/:id', validateObjectId(), getInterview);
router.put('/:id', validateObjectId(), validate(interviewSchema), updateInterview);
router.delete('/:id', validateObjectId(), deleteInterview);

export default router;
