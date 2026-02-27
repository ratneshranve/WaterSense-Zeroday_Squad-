import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemType: {
        type: String,
        enum: ['Leakage', 'No Water', 'Contamination', 'Sensor Not Working'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
    assignedEngineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Engineer',
        default: null
    },
    completionNote: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;
