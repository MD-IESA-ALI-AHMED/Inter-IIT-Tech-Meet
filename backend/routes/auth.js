import express from 'express';
import * as auth from '../controllers/authController.js';
import { logout } from '../controllers/logoutController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/logout', authMiddleware, logout);

export default router;
