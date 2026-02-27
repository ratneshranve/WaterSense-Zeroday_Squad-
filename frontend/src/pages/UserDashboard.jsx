import { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Activity, Droplet, CheckCircle } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);

    const [problemType, setProblemType] = useState('Leakage');
    const [description, setDescription] = useState('');
    const [reportMsg, setReportMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.location) {
                    const sensorRes = await api.get(`/sensors/${user.location}`);
                    if (sensorRes.data.length > 0) {
                        setStats(sensorRes.data[0]);
                    }
                }
                const reportsRes = await api.get('/reports/myreports');
                setReports(reportsRes.data);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [user]);

    // Live dummy fluctuations to simulate active sensors between DB polls
    useEffect(() => {
        const liveTick = setInterval(() => {
            setStats(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    flowRate: (prev.flowRate * (1 + (Math.random() * 0.04 - 0.02))).toFixed(1),
                    pressure: (prev.pressure * (1 + (Math.random() * 0.04 - 0.02))).toFixed(1),
                    turbidity: (prev.turbidity * (1 + (Math.random() * 0.06 - 0.03))).toFixed(2),
                    tds: Math.round(prev.tds * (1 + (Math.random() * 0.02 - 0.01)))
                };
            });
        }, 2500);
        return () => clearInterval(liveTick);
    }, []);

    const submitReport = async (e) => {
        e.preventDefault();
        setReportMsg('');
        try {
            await api.post('/reports', {
                problemType,
                description,
                location: user?.location
            });
            setReportMsg('Report submitted successfully.');
            setDescription('');

            const reportsRes = await api.get('/reports/myreports');
            setReports(reportsRes.data);

            // Redirect to history after brief success message
            setTimeout(() => {
                setReportMsg('');
                navigate('/dashboard/history');
            }, 1000);
        } catch (error) {
            setReportMsg('Submission failed.');
        }
    };

    const getStatusType = (val, threshold, isBelowBad = true) => {
        if (!val) return 'info';
        if (isBelowBad) return val < threshold ? 'danger' : 'success';
        return val > threshold ? 'danger' : 'success';
    };

    return (
        <Layout>
            <Routes>
                <Route path="/" element={
                    <>
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">My Dashboard</h1>
                                <p className="page-subtitle">Monitoring Area: {user?.location}</p>
                            </div>
                        </div>

                        <div className="grid-cards">
                            <div className="stat-card glass-panel">
                                <div className="stat-header">
                                    <span>Flow Rate</span> <Activity size={16} />
                                </div>
                                <div>
                                    <span className={`stat-value ${getStatusType(stats?.flowRate, 50, true)}`}>
                                        {stats ? stats.flowRate : '--'}
                                    </span>
                                    <span className="stat-unit">L/hr</span>
                                </div>
                            </div>

                            <div className="stat-card glass-panel">
                                <div className="stat-header">
                                    <span>Pressure</span> <Activity size={16} />
                                </div>
                                <div>
                                    <span className={`stat-value ${getStatusType(stats?.pressure, 20, true)}`}>
                                        {stats ? stats.pressure : '--'}
                                    </span>
                                    <span className="stat-unit">PSI</span>
                                </div>
                            </div>

                            <div className="stat-card glass-panel">
                                <div className="stat-header">
                                    <span>Turbidity</span> <Droplet size={16} />
                                </div>
                                <div>
                                    <span className={`stat-value ${getStatusType(stats?.turbidity, 5, false)}`}>
                                        {stats ? stats.turbidity : '--'}
                                    </span>
                                    <span className="stat-unit">NTU</span>
                                </div>
                            </div>

                            <div className="stat-card glass-panel">
                                <div className="stat-header">
                                    <span>TDS</span> <Droplet size={16} />
                                </div>
                                <div>
                                    <span className={`stat-value ${getStatusType(stats?.tds, 500, false)}`}>
                                        {stats ? stats.tds : '--'}
                                    </span>
                                    <span className="stat-unit">ppm</span>
                                </div>
                            </div>
                        </div>
                    </>
                } />

                <Route path="/report" element={
                    <>
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">Report an Issue</h1>
                                <p className="page-subtitle">Submit problems in your area</p>
                            </div>
                        </div>
                        <div className="glass-panel">
                            <div className="panel-body">
                                {reportMsg && (
                                    <div className={reportMsg.includes('failed') ? "error-msg" : "success-msg"}>
                                        {reportMsg}
                                    </div>
                                )}
                                <form onSubmit={submitReport}>
                                    <div className="grid-2 form-group">
                                        <div>
                                            <label className="form-label">Location/Zone</label>
                                            <input type="text" disabled value={user?.location || ''} className="tech-input" style={{ opacity: 0.6 }} />
                                        </div>
                                        <div>
                                            <label className="form-label">Issue Type</label>
                                            <select className="tech-input tech-select" value={problemType} onChange={(e) => setProblemType(e.target.value)}>
                                                <option value="Leakage">Water Leak / Broken Pipe</option>
                                                <option value="No Water">No Water Supply</option>
                                                <option value="Contamination">Dirty/Contaminated Water</option>
                                                <option value="Sensor Not Working">Sensor Not Working</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            required rows="3" className="tech-input"
                                            style={{ resize: 'none' }}
                                            placeholder="Describe the problem..."
                                            value={description} onChange={(e) => setDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="tech-button w-full">Submit Report</button>
                                </form>
                            </div>
                        </div>
                    </>
                } />

                <Route path="/history" element={
                    <>
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">Report History</h1>
                                <p className="page-subtitle">View your past reports and their statuses</p>
                            </div>
                        </div>
                        <div className="glass-panel">
                            <div className="panel-body" style={{ padding: 0 }}>
                                {reports.length === 0 ? (
                                    <div className="flex" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        <CheckCircle size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                        <p>No reports submitted yet.</p>
                                    </div>
                                ) : (
                                    <table className="tech-table">
                                        <thead>
                                            <tr>
                                                <th>Class</th>
                                                <th>Status</th>
                                                <th>Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map((r) => (
                                                <tr key={r._id}>
                                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.problemType}</td>
                                                    <td>
                                                        <span className={`badge ${r.status === 'Resolved' ? 'success' :
                                                            r.status === 'In Progress' ? 'info' :
                                                                r.status === 'Assigned' ? 'warning' : 'danger'
                                                            }`}>
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                        {new Date(r.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </>
                } />
            </Routes>
        </Layout>
    );
};

export default UserDashboard;
