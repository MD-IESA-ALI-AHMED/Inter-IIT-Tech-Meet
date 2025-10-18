import express from 'express';
import * as commentCtrl from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/comments', commentCtrl.list);
router.post('/comments', authMiddleware, commentCtrl.create);
router.post('/comments/:id/vote', authMiddleware, commentCtrl.vote);

// dev-only debug endpoints to inspect raw vs populated documents
if (process.env.NODE_ENV !== 'production') {
	router.get('/debug/raw-comments', commentCtrl.debugRawComments);
	router.get('/debug/populated-comments', commentCtrl.debugPopulatedComments);
}

export default router;
