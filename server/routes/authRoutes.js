import { Router } from 'express';
import { login, logout, me, register, updateMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, profileSchema, registerSchema } from '../validators/schemas.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, validate(profileSchema), updateMe);

export default router;
