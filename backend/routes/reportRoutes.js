import express from 'express';
import {
    createReport,
    getReports,
    getMyReports,
    getEngineerReports,
    assignEngineer,
    updateReportStatus
} from '../controllers/reportController.js';
import { protect, admin, engineerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createReport)
    .get(protect, admin, getReports);

router.get('/myreports', protect, getMyReports);
router.get('/engineer', protect, engineerOrAdmin, getEngineerReports);

router.put('/:id/assign', protect, admin, assignEngineer);
router.put('/:id/status', protect, engineerOrAdmin, updateReportStatus);

export default router;
