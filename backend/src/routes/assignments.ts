import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('ta', 'instructor', 'admin'), createAssignment);
router.get('/', authenticate, getAssignments);
router.get('/:assignmentId', authenticate, getAssignmentById);
router.put('/:assignmentId', authenticate, authorize('ta', 'instructor', 'admin'), updateAssignment);
router.delete('/:assignmentId', authenticate, authorize('instructor', 'admin'), deleteAssignment);

export default router;
