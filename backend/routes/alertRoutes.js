import express from 'express';
import { getAlerts, resolveAlert, assignAlert, getEngineerAlerts, updateAlertStatus } from '../controllers/alertController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific routes MUST come before dynamic ID routes
router.get('/engineer', protect, getEngineerAlerts);

// Dynamic routes
router.get('/', protect, admin, getAlerts);
router.put('/:id/resolve', protect, admin, resolveAlert); // Kept for fallback/admin direct resolve
router.put('/:id/assign', protect, admin, assignAlert);
router.put('/:id/status', protect, updateAlertStatus);

export default router;
