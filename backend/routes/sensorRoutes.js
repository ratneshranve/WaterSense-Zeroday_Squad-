import express from 'express';
import { receiveSensorData, getSensorDataByLocation } from '../controllers/sensorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', receiveSensorData); // Simulates public IoT ingestion
router.get('/:location', protect, getSensorDataByLocation);

export default router;
