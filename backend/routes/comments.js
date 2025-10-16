import express from 'express';
import * as commentCtrl from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/comments', commentCtrl.list);
router.post('/comments', authMiddleware, commentCtrl.create);
router.post('/comments/:id/vote', authMiddleware, commentCtrl.vote);

export default router;
