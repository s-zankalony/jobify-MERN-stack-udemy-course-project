import {
  validateRegisterInput,
  validateLoginInput,
} from '../middleware/validationMiddleware.js';

import { Router } from 'express';
import { register, login, logout } from '../controllers/authControllers.js';
const router = Router();
import rateLimiter from 'express-rate-limit';

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { msg: 'IP rate limit exceeded, try again in 15 minutes' },
});

router.post('/register', apiLimiter, validateRegisterInput, register);
router.post('/login', apiLimiter, validateLoginInput, login);
router.get('/logout', logout);

export default router;
