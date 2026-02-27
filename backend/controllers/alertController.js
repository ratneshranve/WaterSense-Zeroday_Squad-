import Alert from '../models/Alert.js';
import Engineer from '../models/Engineer.js';

// @desc    Get all alerts (Admin)
// @route   GET /api/alerts
// @access  Private/Admin
export const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({}).populate('sensorDataId').populate('suggestedEngineer', 'name email');
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark alert as resolved (Admin)
// @route   PUT /api/alerts/:id/resolve
// @access  Private/Admin
export const resolveAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (alert) {
            alert.status = 'Resolved';
            alert.resolvedBy = req.user._id;
            const updatedAlert = await alert.save();
            res.json(updatedAlert);
        } else {
            res.status(404).json({ message: 'Alert not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign engineer to alert (Admin)
// @route   PUT /api/alerts/:id/assign
// @access  Private/Admin
export const assignAlert = async (req, res) => {
    try {
        const { engineerId } = req.body;
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        const engineer = await Engineer.findById(engineerId);
        if (!engineer) {
            return res.status(404).json({ message: 'Engineer not found' });
        }

        // Update alert
        alert.assignedEngineer = engineer._id;
        alert.status = 'Assigned';
        const updatedAlert = await alert.save();

        // Update engineer availability
        engineer.availabilityStatus = 'busy';
        await engineer.save();

        res.json(updatedAlert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get alerts assigned to an engineer
// @route   GET /api/alerts/engineer
// @access  Private/Engineer
export const getEngineerAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ assignedEngineer: req.user._id }).populate('sensorDataId');
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update alert status (Engineer)
// @route   PUT /api/alerts/:id/status
// @access  Private/Engineer
export const updateAlertStatus = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        
        if (alert && String(alert.assignedEngineer) === String(req.user._id)) {
            alert.status = req.body.status || alert.status;
            
            const updatedAlert = await alert.save();
            
            // If resolved, free up the engineer
            if (alert.status === 'Resolved') {
                const engineer = await Engineer.findById(req.user._id);
                if (engineer) {
                    engineer.availabilityStatus = 'available';
                    await engineer.save();
                }
            }
            res.json(updatedAlert);
        } else {
            res.status(404).json({ message: 'Alert not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
