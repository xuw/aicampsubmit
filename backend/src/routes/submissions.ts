import { Router } from 'express';
import {
  createOrUpdateSubmission,
  getMySubmissions,
  getSubmissionById,
  getSubmissionsByAssignment,
  downloadAttachment,
} from '../controllers/submissionController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/fileUpload';

const router = Router();

router.post('/', authenticate, upload.array('files', 10), createOrUpdateSubmission);
router.get('/my', authenticate, getMySubmissions);
router.get('/:submissionId', authenticate, getSubmissionById);
router.get('/by-assignment/:assignmentId', authenticate, authorize('ta', 'instructor', 'admin'), getSubmissionsByAssignment);
router.get('/attachments/:attachmentId/download', authenticate, downloadAttachment);

export default router;
