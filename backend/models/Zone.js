import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
    {
        zoneName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        homeCount: {
            type: Number,
            required: true,
            default: 100,
        },
        assignedEngineer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Engineer",
            default: null,
        },
        status: {
            type: String,
            enum: ["Normal", "Warning", "Critical"],
            default: "Normal",
        },
        anomalyCounter: {
            type: Number,
            default: 0,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Zone = mongoose.model("Zone", zoneSchema);
export default Zone;
