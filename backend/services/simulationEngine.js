import Zone from '../models/Zone.js';
import SensorReading from '../models/SensorReading.js';
import Engineer from '../models/Engineer.js';
import Alert from '../models/Alert.js';
import { io } from '../server.js';
import mongoose from 'mongoose';

// Ensure some default zones exist for the engine
const ensureZonesExist = async () => {
    const zones = await Zone.countDocuments();
    if (zones === 0) {
        console.log("[Simulation] No zones found, spawning defaults...");
        await Zone.insertMany([
            { zoneName: "Zone A", homeCount: 150 },
            { zoneName: "Zone B", homeCount: 220 },
            { zoneName: "Zone C", homeCount: 80 }
        ]);
        console.log("[Simulation] Default zones spawned.");
    }
};

const getBaseFlowForTime = () => {
    // Generate realistic usage base metrics depending on hour of day
    const hour = new Date().getHours();
    let baseFlow = 500; // default low night

    if (hour >= 6 && hour <= 9) {
        baseFlow = 3000; // Morning Peak
    } else if (hour > 9 && hour <= 17) {
        baseFlow = 1500; // Afternoon Medium
    } else if (hour > 17 && hour <= 22) {
        baseFlow = 2500; // Evening Peak
    }
    
    // Add random noise variance 
    return baseFlow + (Math.random() * 200 - 100);
};

let tickCounter = 0; // State tracker for forcing 30-second anomalies

export const runSimulationCycle = async () => {
    try {
        await ensureZonesExist();
        const zones = await Zone.find();

        for (const zone of zones) {
            // 1. Calculate realistic flows
            const sourceFlow = getBaseFlowForTime() * (zone.homeCount / 100);
            
            // Generate a natural acceptable loss (3-8%)
            let naturalLoss = sourceFlow * (0.03 + (Math.random() * 0.05));
            
            // Randomly simulate a serious breakage (10% chance) organically
            const isSimulatedLeakTriggered = Math.random() > 0.90 && zone.status !== "Critical";
            if (isSimulatedLeakTriggered) {
                 naturalLoss += sourceFlow * (0.25 + (Math.random() * 0.1)); // Adds 25-35% loss
            }

            // *** DEMONSTRATION MODE OVERRIDE ***
            // Force a guaranteed >20% anomaly every 3rd Engine Tick (30 seconds) on exactly 1 zone
            if (tickCounter % 3 === 0 && zone.zoneName === 'Zone A' && zone.status !== "Critical") {
                console.log(`[Simulation] Forced 30-second Demo Override Fired on ${zone.zoneName}`);
                naturalLoss += sourceFlow * 0.35; // Instant 35% loss injected
            }

            let totalHomeFlow = sourceFlow - naturalLoss;
            if (totalHomeFlow < 0) totalHomeFlow = 0; // clamp
            
            const lossPercentage = ((sourceFlow - totalHomeFlow) / sourceFlow) * 100;

            // 2. Save new Reading Point
            const newReading = new SensorReading({
                zone: zone.zoneName,
                sourceFlow: Math.round(sourceFlow),
                totalHomeFlow: Math.round(totalHomeFlow),
                lossPercentage: Number(lossPercentage.toFixed(2)),
                pressureDifference: Number((lossPercentage / 5).toFixed(2)) // mock correlation
            });
            await newReading.save();

            // Broadcast the reading down the socket for live line-charts
            io.emit('sensor_tick', newReading);

            // 3. Process Anomaly Detection rules
            await processAnomalyRules(zone, lossPercentage, newReading._id);
        }
        tickCounter++;
    } catch (err) {
        console.error("[Simulation Engine] Error running cycle:", err);
    }
};

const processAnomalyRules = async (zone, currentLossObj, sensorDataId) => {
    // Threshold triggers 
    const isCriticalLoss = currentLossObj > 20;

    if (isCriticalLoss) {
        zone.anomalyCounter += 1;
    } else {
        // Recovery logic - if things normalize, dial back the counter
        zone.anomalyCounter = Math.max(0, zone.anomalyCounter - 1);
        if (zone.status === "Critical" && zone.anomalyCounter === 0) {
            zone.status = "Normal";
            // Emit recovery ping
            io.emit("zone_update", { zoneName: zone.zoneName, status: "Normal" });
        }
    }

    // Checking if zone hits 2 consecutive anomalies
    if (zone.anomalyCounter >= 2 && zone.status !== "Critical") {
        zone.status = "Critical";
        
        // Find best engineer for auto-suggestion
        const availableEngineer = await Engineer.findOne({ 
            assignedZone: zone.zoneName, 
            availabilityStatus: 'available' 
        });

        const newAlert = new Alert({
            sensorDataId: sensorDataId,
            location: zone.zoneName,
            zone: zone.zoneName,
            reason: `Catastrophic Flow Loss Detected: ${currentLossObj.toFixed(1)}% variance.`,
            severity: "Danger",
            status: "Open",
            suggestedEngineer: availableEngineer ? availableEngineer._id : null
        });

        await newAlert.save();

        // Emit critical alert out via WebSocket for real-time dashboard updates
        const hydratedAlert = await Alert.findById(newAlert._id).populate('suggestedEngineer', 'name email');
        
        io.emit("critical_alert", hydratedAlert);
        io.emit("zone_update", { zoneName: zone.zoneName, status: "Critical" });
    } else if (currentLossObj > 10 && currentLossObj <= 20 && zone.status === "Normal") {
        // Warning territory
        zone.status = "Warning";
        io.emit("zone_update", { zoneName: zone.zoneName, status: "Warning" });
    }

    zone.lastUpdated = Date.now();
    await zone.save();
};
