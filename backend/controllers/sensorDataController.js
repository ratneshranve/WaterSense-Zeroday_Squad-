import SensorReading from '../models/SensorReading.js';
import Zone from '../models/Zone.js';

// @desc    Get the latest sensor readings per zone for the Trend Chart
// @route   GET /api/sensors/history
// @access  Private (Admin/Engineer)
export const getSensorHistory = async (req, res) => {
    try {
        const { zone, limit = 10 } = req.query;

        let query = {};
        if (zone && zone !== 'All') {
            query.zone = zone;
        }

        const readings = await SensorReading.find(query)
            .sort({ timestamp: -1 })
            .limit(Number(limit));

        // Recharts prefers chronological order (oldest to newest left-to-right)
        res.json(readings.reverse());
    } catch (error) {
        console.error("[API] Error fetching sensor history:", error);
        res.status(500).json({ message: "Server Error rendering sensor history." });
    }
};

// @desc    Get live dynamic statuses for all known Zones
// @route   GET /api/zones
// @access  Private
export const getZonesStatus = async (req, res) => {
    try {
        const zones = await Zone.find().populate('assignedEngineer', 'name email');
        res.json(zones);
    } catch (error) {
        console.error("[API] Error fetching zones:", error);
        res.status(500).json({ message: "Server Error fetching zones." });
    }
};
