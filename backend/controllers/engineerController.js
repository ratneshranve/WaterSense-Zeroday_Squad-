import Engineer from '../models/Engineer.js';

// @desc    Get all engineers
// @route   GET /api/engineers
// @access  Private/Admin
export const getEngineers = async (req, res) => {
    try {
        const engineers = await Engineer.find({}).select('-password');
        res.json(engineers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update engineer status
// @route   PUT /api/engineers/status
// @access  Private/Engineer
export const updateStatus = async (req, res) => {
    try {
        const engineer = await Engineer.findById(req.user._id);
        if (engineer) {
            engineer.availabilityStatus = req.body.status || engineer.availabilityStatus;
            const updatedEngineer = await engineer.save();
            res.json({
                _id: updatedEngineer._id,
                name: updatedEngineer.name,
                status: updatedEngineer.availabilityStatus
            });
        } else {
            res.status(404).json({ message: 'Engineer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
