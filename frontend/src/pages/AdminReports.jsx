import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { FileText } from 'lucide-react';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [engineers, setEngineers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [repRes, engRes] = await Promise.all([
                    api.get('/reports'),
                    api.get('/engineers')
                ]);
                // Filter out resolved
                setReports(repRes.data.filter(r => r.status !== 'Resolved'));
                setEngineers(engRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async (reportId, engineerId) => {
        try {
            await api.put(`/reports/${reportId}/assign`, { engineerId });
            const repRes = await api.get('/reports');
            setReports(repRes.data.filter(r => r.status !== 'Resolved'));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title"><FileText size={24} style={{ display: 'inline', marginRight: '10px', color: 'var(--accent-cyan)' }} /> Active Reports</h1>
                    <p className="page-subtitle">Currently active and pending incidents</p>
                </div>
            </div>
            <div className="glass-panel">
                <table className="tech-table">
                    <thead>
                        <tr>
                            <th>Zone</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Assigned To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length > 0 ? reports.map(r => (
                            <tr key={r._id}>
                                <td>{r.location}</td>
                                <td>{r.problemType}</td>
                                <td>{r.description.substring(0, 30)}...</td>
                                <td>
                                    {r.status === 'Pending' ? (
                                        <select
                                            className="tech-input tech-select"
                                            style={{ padding: '5px', fontSize: '12px' }}
                                            onChange={(e) => handleAssign(r._id, e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value="" disabled style={{ color: '#000' }}>Assign Engineer</option>
                                            {engineers.map(e => <option key={e._id} value={e._id} style={{ color: '#000' }}>{e.name}</option>)}
                                        </select>
                                    ) : (
                                        <span style={{ color: 'var(--accent-yellow)' }}>{r.assignedEngineer?.name} (In Progress)</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center text-secondary">No active reports.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AdminReports;
