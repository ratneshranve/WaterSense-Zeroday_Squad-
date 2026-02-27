import Report from '../models/Report.js';
import Engineer from '../models/Engineer.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create a new report (User)
// @route   POST /api/reports
// @access  Private (User only)
export const createReport = async (req, res) => {
    try {
        const { problemType, description, location } = req.body;
        
        const report = new Report({
            userId: req.user._id,
            problemType,
            description,
            location
        });

        const createdReport = await report.save();
        res.status(201).json(createdReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
    try {
        const reports = await Report.find({}).populate('userId', 'name email').populate('assignedEngineer', 'name email');
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's reports
// @route   GET /api/reports/myreports
// @access  Private (User)
export const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user._id }).populate('assignedEngineer', 'name');
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reports assigned to an engineer
// @route   GET /api/reports/engineer
// @access  Private/Engineer
export const getEngineerReports = async (req, res) => {
    try {
        const reports = await Report.find({ assignedEngineer: req.user._id }).populate('userId', 'name location');
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign engineer to report (Admin)
// @route   PUT /api/reports/:id/assign
// @access  Private/Admin
export const assignEngineer = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (report) {
            report.assignedEngineer = req.body.engineerId;
            report.status = 'Assigned';
            const updatedReport = await report.save();
            
            // Trigger email notification to Engineer
            const engineer = await Engineer.findById(req.body.engineerId);
            if (engineer) {
                await sendEmail({
                    email: engineer.email,
                    subject: 'New Report Assigned',
                    message: `You have been assigned a new report (${report.problemType}) at ${report.location}.`
                });
            }

            res.json(updatedReport);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update report status (Engineer)
// @route   PUT /api/reports/:id/status
// @access  Private/Engineer
export const updateReportStatus = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        // Ensure the engineer is the one assigned
        if (report && String(report.assignedEngineer) === String(req.user._id)) {
            report.status = req.body.status || report.status;
            if (req.body.completionNote) {
                report.completionNote = req.body.completionNote;
            }
            const updatedReport = await report.save();
            
            // Trigger email to User if resolved
            if (report.status === 'Resolved') {
                const user = await User.findById(report.userId);
                if (user) {
                    await sendEmail({
                        email: user.email,
                        subject: 'WaterSense Report Resolved',
                        message: `Your reported issue (${report.problemType}) at ${report.location} has been marked as resolved.`
                    });
                }
            }

            res.json(updatedReport);
        } else {
            res.status(404).json({ message: 'Report not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
