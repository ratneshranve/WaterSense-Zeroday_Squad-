import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { runSimulationCycle } from './services/simulationEngine.js';
import { seedMockData } from './utils/seedData.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import engineerRoutes from './routes/engineerRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import sensorDataRoutes from './routes/sensorDataRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
    // Inject Mock Demo data
    seedMockData();
});

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket server
export const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`[Socket] Client disconnected`);
    });
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
    res.send('WaterSense API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/engineers', engineerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/sensor-data', sensorDataRoutes);

const PORT = process.env.PORT || 5005;

// Fire up the simulation engine every 10 seconds
setInterval(async () => {
    await runSimulationCycle();
}, 10000);

httpServer.listen(PORT, () => {
    console.log(`Server & WebSocket running on port ${PORT}`);
});
