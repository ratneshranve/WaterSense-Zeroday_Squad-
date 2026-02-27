import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Users, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import ZoneMap from '../components/ZoneMap';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5005'); // Connect to WebSocket backend

// Constants for simulation (matching ZoneMap)
const zoneCoordinates = {
    'Zone A': [28.6139, 77.2090], // Delhi
    'Zone B': [19.0760, 72.8777], // Mumbai
    'Zone C': [12.9716, 77.5946], // Bangalore
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEngineers: 0,
        activeReports: 0,
        resolvedReports: 0,
        liveAlerts: 0
    });
    const [reports, setReports] = useState([]);
    const [engineers, setEngineers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [sensorHistory, setSensorHistory] = useState([]);

    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedEngineer, setSelectedEngineer] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [usersRes, engRes, repRes, alertRes, sensorRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/engineers'),
                    api.get('/reports'),
                    api.get('/alerts'),
                    api.get('/sensor-data/history?limit=10')
                ]);

                const uData = usersRes.data.filter(u => u.role === 'user');
                const eData = engRes.data;
                const rData = repRes.data;
                const aData = alertRes.data;

                setStats({
                    totalUsers: uData.length,
                    totalEngineers: eData.length,
                    activeReports: rData.filter(r => r.status !== 'Resolved').length,
                    resolvedReports: rData.filter(r => r.status === 'Resolved').length,
                    liveAlerts: aData.filter(a => a.status === 'Open').length
                });

                setEngineers(eData);
                setReports(rData);
                setAlerts(aData);

                // Format sensor data for Recharts display
                const formattedSensors = sensorRes.data.map(d => ({
                    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    loss: d.lossPercentage,
                    zone: d.zone
                }));
                setSensorHistory(formattedSensors);
            } catch (err) {
                console.error("Failed to load admin dashboard data", err);
            }
        };
        fetchDashboardData();

        // WebSocket Listeners for real-time engine
        socket.on('critical_alert', (newAlert) => {
            // Add to live alerts stat
            setStats(prev => ({ ...prev, liveAlerts: prev.liveAlerts + 1 }));

            // Add map marker dynamically
            setReports(prev => [
                ...prev,
                {
                    _id: newAlert._id,
                    location: newAlert.zone,
                    problemType: newAlert.reason,
                    status: 'Open'
                }
            ]);
        });

        // Listen for new tick of history line data
        socket.on('sensor_tick', (newTick) => {
            setSensorHistory(prev => {
                const tick = {
                    time: new Date(newTick.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    loss: newTick.lossPercentage,
                    zone: newTick.zone
                };
                const updated = [...prev, tick];
                return updated.slice(-15); // keep chart size bounded to 15 nodes
            });
        });

        return () => {
            socket.off('critical_alert');
            socket.off('sensor_tick');
        };
    }, []);

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Core Overview</h1>
                    <p className="page-subtitle">Global Node Analytics & Dispatch</p>
                </div>
            </div>

            <div className="grid-cards">
                <div className="stat-card glass-panel cursor-pointer" onClick={() => navigate('/admin/users')}>
                    <div className="stat-header"><span>Active Users</span> <Users size={16} /></div>
                    <div className="stat-value info">{stats.totalUsers}</div>
                </div>
                <div className="stat-card glass-panel cursor-pointer" onClick={() => navigate('/admin/engineers')}>
                    <div className="stat-header"><span>Engineers</span> <ShieldCheck size={16} /></div>
                    <div className="stat-value info">{stats.totalEngineers}</div>
                </div>
                <div className="stat-card glass-panel cursor-pointer" onClick={() => navigate('/admin/reports')}>
                    <div className="stat-header"><span>Active Reports</span> <FileText size={16} /></div>
                    <div className="stat-value warning">{stats.activeReports}</div>
                </div>
                <div className="stat-card glass-panel cursor-pointer" onClick={() => navigate('/admin/resolved')}>
                    <div className="stat-header"><span>Resolved</span> <ShieldCheck size={16} /></div>
                    <div className="stat-value success">{stats.resolvedReports}</div>
                </div>
                <div className="stat-card glass-panel cursor-pointer" onClick={() => navigate('/admin/alerts')}>
                    <div className="stat-header"><span>System Alerts</span> <AlertTriangle size={16} /></div>
                    <div className="stat-value danger">{stats.liveAlerts}</div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '20px' }}>
                <div className="glass-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">Real-Time Flow Loss Percentage (%)</h3>
                    </div>
                    <div className="panel-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sensorHistory}>
                                <defs>
                                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#c9d1df" fontSize={11} />
                                <YAxis stroke="#c9d1df" fontSize={11} domain={[0, 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', border: '1px solid rgba(0, 180, 216, 0.3)', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#00f5d4' }}
                                />
                                <Area type="monotone" dataKey="loss" stroke="#00b4d8" fillOpacity={1} fill="url(#colorLoss)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">System Metrics</h3>
                    </div>
                    <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="alert-item warning">
                            <div>
                                <div className="alert-reason">Anomaly Threshold Limit</div>
                                <div className="alert-meta">Triggered if {`>`} 20% loss for 2 consecutive cycles.</div>
                            </div>
                            <span className="badge warning">STRICT</span>
                        </div>
                        <div className="alert-item info">
                            <div>
                                <div className="alert-reason">Engine Sync Interval</div>
                                <div className="alert-meta">Sensors broadcasting live every 10,000ms.</div>
                            </div>
                            <span className="badge info">ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '20px' }}>
                <div className="panel-header">
                    <h3 className="panel-title">Geo-Spatial Threat Map</h3>
                </div>
                <div className="panel-body" style={{ padding: '0px' }}>
                    <ZoneMap role="admin" zoneFilter="All" externalReports={reports} />
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
