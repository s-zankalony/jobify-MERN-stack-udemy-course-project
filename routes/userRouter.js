/** @format */

import { Router } from 'express';
import { validateUpdateUserInput } from '../middleware/validationMiddleware.js';
import {
  getApplicationStats,
  getCurrentUser,
  updateUser,
} from '../controllers/userController.js';
import {
  authorizePermission,
  checkForTestUser,
} from '../middleware/authMiddleware.js';
import upload from '../middleware/multerMiddleware.js';
const router = Router();

router.get('/current-user', getCurrentUser);
router.get('/admin/app-stats', [
  authorizePermission('admin'),
  getApplicationStats,
]);
router.patch(
  '/update-user',
  upload.single('avatar'),
  checkForTestUser,
  validateUpdateUserInput,
  updateUser
);

export default router;
