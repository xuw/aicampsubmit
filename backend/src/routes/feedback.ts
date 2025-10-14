import { Router } from 'express';
import {
  createFeedback,
  updateFeedback,
  getFeedbackBySubmission,
} from '../controllers/feedbackController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('ta', 'instructor', 'admin'), createFeedback);
router.put('/:feedbackId', authenticate, authorize('ta', 'instructor', 'admin'), updateFeedback);
router.get('/by-submission/:submissionId', authenticate, getFeedbackBySubmission);

export default router;
