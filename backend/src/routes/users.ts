import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), getUsers);
router.patch('/:userId/role', authenticate, authorize('admin'), updateUserRole);

export default router;
