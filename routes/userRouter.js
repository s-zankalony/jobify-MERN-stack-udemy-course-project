/** @format */

import { Router } from 'express';
import { validateUpdateUserInput } from '../middleware/validationMiddleware.js';
import {
  getApplicationStats,
  getCurrentUser,
  updateUser,
} from '../controllers/userController.js';
import { authorizePermission } from '../middleware/authMiddleware.js';
const router = Router();

router.get('/current-user', getCurrentUser);
router.get('/admin/app-stats', [
  authorizePermission('admin'),
  getApplicationStats,
]);
router.patch('/update-user', validateUpdateUserInput, updateUser);

export default router;
