import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true // 'Zone A', 'Zone B', etc.
    },
    flowRate: {
        type: Number, // L/hr
        required: true
    },
    pressure: {
        type: Number, // PSI or bar
        required: true
    },
    turbidity: {
        type: Number, // NTU
        required: true
    },
    tds: {
        type: Number, // ppm
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);
export default SensorData;
