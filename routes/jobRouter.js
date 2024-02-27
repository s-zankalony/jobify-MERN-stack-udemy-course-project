import { Router } from 'express';
import {
  createJob,
  deleteJob,
  getAllJobs,
  getJob,
  updateJob,
  showStats,
} from '../controllers/jobController.js';
import {
  validateJobInput,
  validateIdParam,
} from '../middleware/validationMiddleware.js';
import { checkForTestUser } from '../middleware/authMiddleware.js';
const router = Router();

// router.get('/', getAllJobs);
// router.post('/', createJob);

router
  .route('/')
  .get(getAllJobs)
  .post(checkForTestUser, validateJobInput, createJob);

router.route('/stats').get(showStats);

router
  .route('/:id')
  .patch(checkForTestUser, validateJobInput, validateIdParam, updateJob)
  .delete(checkForTestUser, validateIdParam, deleteJob)
  .get(validateIdParam, getJob);

export default router;
