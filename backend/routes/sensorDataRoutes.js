import express from 'express';
import { getSensorHistory, getZonesStatus } from '../controllers/sensorDataController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get the last N records for Recharts
router.get('/history', protect, getSensorHistory);

// Get the current persistent Zone statuses
router.get('/zones', protect, getZonesStatus);

export default router;
