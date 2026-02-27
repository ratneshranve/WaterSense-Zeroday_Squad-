import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Engineer from './models/Engineer.js';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Engineer.deleteMany();

        const adminUser = {
            name: 'Admin User',
            email: 'admin@watersense.com',
            password: 'password123', // Will be hashed by pre-save middleware
            role: 'admin',
            location: 'HQ' // Admins might not need a location, but schema expects it if user. Schema says required if role === 'user', so it's fine.
        };

        const normalUser = {
            name: 'Test User',
            email: 'user@watersense.com',
            password: 'password123',
            role: 'user',
            location: 'Zone A'
        };

        const engineers = [
            {
                name: 'Jane Smith',
                email: 'jane@watersense.com',
                password: 'password123', // Hashed by pre-save
                assignedZone: 'Zone A',
                availabilityStatus: 'available'
            },
            {
                name: 'Mike Johnson',
                email: 'mike@watersense.com',
                password: 'password123', // Hashed by pre-save
                assignedZone: 'Zone B',
                availabilityStatus: 'available'
            }
        ];

        await User.create(adminUser);
        await User.create(normalUser);
        for (const eng of engineers) {
            await Engineer.create(eng);
        }

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Engineer.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
