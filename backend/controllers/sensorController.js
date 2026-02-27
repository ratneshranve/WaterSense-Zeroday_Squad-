import SensorData from '../models/SensorData.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Receive simulated sensor data & trigger alerts if necessary
// @route   POST /api/sensors
// @access  Public (Simulated API)
export const receiveSensorData = async (req, res) => {
    try {
        const { location, flowRate, pressure, turbidity, tds } = req.body;

        const sensorData = await SensorData.create({
            location,
            flowRate,
            pressure,
            turbidity,
            tds
        });

        const thresholds = {
            minFlow: 50,
            minPressure: 20,
            maxTurbidity: 5,
            maxTds: 500
        };

        let alertReason = null;
        let severity = 'Warning';

        if (flowRate < thresholds.minFlow) {
            alertReason = 'Flow drop below threshold (Possible Leakage)';
            severity = 'Danger';
        } else if (pressure < thresholds.minPressure) {
            alertReason = 'Pressure drop abnormal (Pipe Burst or Leak)';
            severity = 'Danger';
        } else if (turbidity > thresholds.maxTurbidity) {
            alertReason = 'Turbidity high (Contamination)';
            severity = 'Danger';
        } else if (tds > thresholds.maxTds) {
            alertReason = 'TDS abnormal (Poor Quality)';
            severity = 'Warning';
        }

        if (alertReason) {
            await Alert.create({
                sensorDataId: sensorData._id,
                location,
                reason: alertReason,
                severity
            });
            
            // Send email to Admins about the new alert
            const admins = await User.find({ role: 'admin' });
            for (let admin of admins) {
                await sendEmail({
                    email: admin.email,
                    subject: `[${severity.toUpperCase()}] WaterSense System Alert: ${location}`,
                    message: `An alert has been triggered for ${location}.\nReason: ${alertReason}. Please login to the dashboard to take action.`
                });
            }
        }

        res.status(201).json({ message: 'Sensor data recorded', data: sensorData, alertTriggered: !!alertReason });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent sensor data by location
// @route   GET /api/sensors/:location
// @access  Private (User/Admin)
export const getSensorDataByLocation = async (req, res) => {
    try {
        // Fetch last 10 readings for chart
        const data = await SensorData.find({ location: req.params.location })
            .sort({ timestamp: -1 })
            .limit(10);
        res.json(data.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
