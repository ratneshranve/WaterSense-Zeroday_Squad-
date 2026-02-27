# WaterSense - Smart Urban Water Leakage & Quality Monitoring System

A full-stack MERN web application with JWT authentication, role-based access control, real-time sensor monitoring, and geospatial alerting.

## Features
- **3-Tier Role System**: User, Admin, Engineer navigation.
- **Simulated IoT Streaming**: Real-time charts for Flow, Pressure, Turbidity, and TDS.
- **Geospatial Mapping**: Leaflet mapping displaying problem hotspots, zones, and engineer tasks based on location.
- **Automated Alerts**: Email notifications and database triggers when metrics breach thresholds.
- **Beautiful UI**: Built completely on raw Tailwind CSS variables with full Dark/Light mode support.

## Getting Started

### 1. Requirements
Ensure you have Node.js and MongoDB installed and running on your system.

### 2. Setup Database & Backend
Wait for MongoDB to be running at `mongodb://127.0.0.1:27017`
In the terminal, navigate to the `backend` folder:
```bash
cd backend
npm install
# Note: Ensure the .env file is populated based on the implementation
node seed.js
npm run dev
```

The server will start on port 5000. 
The database will be automatically seeded with these demo credentials:
- **Admin**: admin@watersense.com / password123
- **Engineer**: jane@watersense.com / password123

### 3. Setup Frontend
Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Default Flow
1. **User Registration**: Create a normal user account for Zone A. Go to dashboard and notice "Live Status".
2. **Submit Report**: Submit a report about an anomaly.
3. **Admin Login**: Login as Admin. View KPIs, Maps, and assign the report you just created to Jane (who operates in Zone A).
4. **Engineer Login**: Login as Jane to view the assigned request in the Maps and task list. Change the status.
