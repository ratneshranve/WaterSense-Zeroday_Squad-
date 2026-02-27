import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    sensorDataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SensorData',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    zone: {
        type: String, // E.g., 'Zone A'
        required: true,
        default: 'Zone A'
    },
    reason: {
        type: String, // e.g., 'Flow drop below threshold', 'Pressure drop abnormal'
        required: true
    },
    severity: {
        type: String,
        enum: ['Warning', 'Danger'], // Yellow vs Red zone logic
        default: 'Danger'
    },
    status: {
        type: String,
        enum: ['Open', 'Assigned', 'In Progress', 'Resolved'],
        default: 'Open'
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Usually an Admin resolving it
        default: null
    },
    suggestedEngineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Engineer',
        default: null
    },
    assignedEngineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Engineer',
        default: null
    }
}, { timestamps: true });

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
