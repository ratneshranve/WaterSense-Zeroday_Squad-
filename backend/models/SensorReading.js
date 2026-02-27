import mongoose from "mongoose";

const sensorReadingSchema = new mongoose.Schema(
    {
        zone: {
            type: String,
            required: true,
            index: true,
        },
        sourceFlow: {
            type: Number,
            required: true,
        },
        totalHomeFlow: {
            type: Number,
            required: true,
        },
        lossPercentage: {
            type: Number,
            required: true,
        },
        pressureDifference: {
            type: Number,
            required: false,
            default: 0,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    { timestamps: true }
);

// Optimize collection for time-series queries (e.g., trend charts)
sensorReadingSchema.index({ timestamp: -1, zone: 1 });

const SensorReading = mongoose.model("SensorReading", sensorReadingSchema);
export default SensorReading;
