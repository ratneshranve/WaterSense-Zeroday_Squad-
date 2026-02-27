import express from 'express';
import { getEngineers, updateStatus } from '../controllers/engineerController.js';
import { protect, admin, engineerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getEngineers);
router.put('/status', protect, engineerOrAdmin, updateStatus);

export default router;
