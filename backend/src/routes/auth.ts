import { Router } from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.patch('/profile', authenticate, updateProfile);

export default router;
