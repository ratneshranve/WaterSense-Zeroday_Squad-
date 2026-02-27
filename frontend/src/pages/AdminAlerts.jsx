import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { AlertTriangle } from 'lucide-react';

const AdminAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [engineers, setEngineers] = useState([]);
    const [selectedEngineers, setSelectedEngineers] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [alertsRes, engRes] = await Promise.all([
                    api.get('/alerts'),
                    api.get('/engineers')
                ]);
                setAlerts(alertsRes.data);
                // Filter specifically for available engineers
                setEngineers(engRes.data.filter(e => e.availabilityStatus === 'available'));
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async (alertId) => {
        // Fallback to the suggested engineer if the user didn't change the dropdown state explicitly
        const alertObj = alerts.find(a => a._id === alertId);

        let engId = selectedEngineers[alertId];
        if (!engId && alertObj?.suggestedEngineer) {
            engId = typeof alertObj.suggestedEngineer === 'object' ? alertObj.suggestedEngineer._id : alertObj.suggestedEngineer;
        }

        if (!engId) return alert("Please select an engineer first.");

        try {
            const res = await api.put(`/alerts/${alertId}/assign`, { engineerId: engId });

            // Update local alerts mapping precisely with server hydration
            setAlerts(alerts.map(a => a._id === alertId ? res.data : a));

            // Remove the newly busy engineer from the dropdown options locally to prevent double assignments
            setEngineers(engineers.filter(e => e._id !== engId));
        } catch (error) {
            console.error(error);
            alert("Failed to assign engineer.");
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title"><AlertTriangle size={24} style={{ display: 'inline', marginRight: '10px', color: 'var(--accent-red)' }} /> System Alerts</h1>
                    <p className="page-subtitle">Detailed view of all system alerts</p>
                </div>
            </div>

            <div className="glass-panel">
                <table className="tech-table">
                    <thead>
                        <tr>
                            <th>Location / Zone</th>
                            <th>Alert Reason</th>
                            <th>Severity</th>
                            <th>Suggested Dispatch</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.length > 0 ? alerts.map(a => (
                            <tr key={a._id}>
                                <td>{a.zone || a.location || 'Unknown'}</td>
                                <td>{a.reason || 'System Sensor Triggered'}</td>
                                <td>
                                    <span className={`badge ${a.severity === 'Danger' ? 'danger' : 'warning'}`}>
                                        {a.severity || 'Danger'}
                                    </span>
                                </td>
                                <td>
                                    {a.suggestedEngineer ? (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <strong style={{ color: 'var(--accent-cyan)' }}>{a.suggestedEngineer.name}</strong>
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{a.suggestedEngineer.email}</span>
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>No Available Engineer</span>
                                    )}
                                </td>
                                <td>
                                    <span style={{ color: a.status === 'Resolved' ? 'var(--accent-green)' : 'var(--accent-info)' }}>
                                        {a.status}
                                    </span>
                                </td>
                                <td>
                                    {a.status === 'Open' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <select
                                                className="tech-input tech-select"
                                                style={{ padding: '6px', fontSize: '12px', borderRadius: '4px' }}
                                                value={selectedEngineers[a._id] || (a.suggestedEngineer ? a.suggestedEngineer._id : '')}
                                                onChange={(e) => setSelectedEngineers({ ...selectedEngineers, [a._id]: e.target.value })}
                                            >
                                                <option value="" style={{ color: '#000' }}>-- Select Engineer --</option>
                                                {engineers.map(eng => (
                                                    <option key={eng._id} value={eng._id} style={{ color: '#000' }}>
                                                        {eng.name} ({eng.assignedZone})
                                                    </option>
                                                ))}
                                                {/* If suggested engineer is populated but they are not in the 'available' filter (maybe busy), we still allow selecting them if we pre-fill it, or at least show text so it doesn't break */}
                                                {a.suggestedEngineer && !engineers.find(e => e._id === a.suggestedEngineer._id) && (
                                                    <option value={a.suggestedEngineer._id} style={{ color: '#000' }}>{a.suggestedEngineer.name} (Suggested)</option>
                                                )}
                                            </select>
                                            <button
                                                className="tech-button success"
                                                style={{ padding: '5px 10px', fontSize: '12px', width: '100%' }}
                                                onClick={() => handleAssign(a._id)}
                                            >
                                                Assign Task
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="tech-button" style={{ padding: '5px 10px', fontSize: '12px', opacity: 0.5, cursor: 'not-allowed' }} disabled>
                                            {a.status}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center text-secondary">No alerts found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AdminAlerts;
