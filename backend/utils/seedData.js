import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Engineer from '../models/Engineer.js';
import Report from '../models/Report.js';

dotenv.config();

export const seedMockData = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/watersense');
        }

        const adminExists = await User.findOne({ email: 'admin@watersense.net' });
        if (!adminExists) {
            console.log("[Seed] Seeding default Admin...");
            await User.create({ name: 'Central Admin', email: 'admin@watersense.net', password: 'password123', role: 'admin', location: 'HQ' });
        }

        console.log("[Seed] Injecting Mock Engineers...");
        const engineers = [
            { name: 'John Doe', email: 'engineer@watersense.net', password: 'password123', assignedZone: 'Zone A', availabilityStatus: 'available' },
            { name: 'Alice Smith', email: 'alice@watersense.net', password: 'password123', assignedZone: 'Zone A', availabilityStatus: 'available' },
            { name: 'Bob Richards', email: 'bob@watersense.net', password: 'password123', assignedZone: 'Zone B', availabilityStatus: 'available' },
            { name: 'Charlie Dave', email: 'charlie@watersense.net', password: 'password123', assignedZone: 'Zone C', availabilityStatus: 'available' },
            { name: 'Eve Johnson', email: 'eve@watersense.net', password: 'password123', assignedZone: 'Zone B', availabilityStatus: 'available' }
        ];
        
        // Remove existing to prevent E11000 duplicate key error
        await Engineer.deleteMany({ email: { $in: engineers.map(e => e.email) } });
        await Engineer.insertMany(engineers);

        console.log("[Seed] Injecting Mock Users & Reports...");
        
        const users = [];
        for (let i = 1; i <= 10; i++) {
            const z = i <= 4 ? 'Zone A' : (i <= 7 ? 'Zone B' : 'Zone C');
            users.push({
                name: `Resident ${i}`,
                email: `user${i}@watersense.net`,
                password: 'password123',
                role: 'user',
                location: z
            });
        }
        
        await User.deleteMany({ email: { $in: users.map(u => u.email) } });
        const seededUsers = await User.insertMany(users);

        await Report.deleteMany({}); // clear all old reports for clean demo state

        // Inject 5 Manual Reports
        const reports = [
            { userId: seededUsers[0]._id, problemType: 'Leakage', description: 'Massive geyser near the main avenue.', location: 'Zone A' },
            { userId: seededUsers[1]._id, problemType: 'No Water', description: 'Zero tap pressure since morning.', location: 'Zone A' },
            { userId: seededUsers[4]._id, problemType: 'Contamination', description: 'Water is brownish yellow.', location: 'Zone B' },
            { userId: seededUsers[5]._id, problemType: 'Sensor Not Working', description: 'App reading says 0 flow but taps are working fine.', location: 'Zone B' },
            { userId: seededUsers[8]._id, problemType: 'Leakage', description: 'Small steady drip heard in the basement wall.', location: 'Zone C' }
        ];
        await Report.insertMany(reports);
        // Inject Dummy Alert
        console.log("[Seed] Injecting Mock Alert...");
        const existingAlert = await mongoose.models.Alert.findOne({ reason: 'Demo Pipe Burst Detected.' });
        if (!existingAlert) {
            await mongoose.models.Alert.create({
                zone: 'Zone A',
                location: 'Zone A',
                reason: 'Demo Pipe Burst Detected.',
                severity: 'Danger',
                status: 'Open'
            });
        }

        console.log("[Seed] Mock Demo Data Fully Loaded.");
    } catch (error) {
        console.error("[Seed] Failed to seed mock data", error);
    }
};
