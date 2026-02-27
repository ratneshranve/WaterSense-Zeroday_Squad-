import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { ShieldCheck } from 'lucide-react';

const AdminResolved = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchResolved = async () => {
            try {
                const [repRes, alertRes] = await Promise.all([
                    api.get('/reports'),
                    api.get('/alerts')
                ]);

                const resolvedReports = repRes.data.filter(r => r.status === 'Resolved');
                const resolvedAlerts = alertRes.data.filter(a => a.status === 'Resolved').map(a => ({
                    _id: a._id,
                    location: a.zone || a.location,
                    problemType: `System Alert: ${a.reason}`,
                    assignedEngineer: a.assignedEngineer,
                    updatedAt: a.updatedAt || a.createdAt
                }));

                // Combine and sort by newest first
                setReports([...resolvedReports, ...resolvedAlerts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            } catch (err) {
                console.error("Failed to load resolved history", err);
            }
        };
        fetchResolved();
    }, []);

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title"><ShieldCheck size={24} style={{ display: 'inline', marginRight: '10px', color: 'var(--accent-green)' }} /> Resolved Operations</h1>
                    <p className="page-subtitle">Historical log of completed dispatch events</p>
                </div>
            </div>
            <div className="glass-panel">
                <table className="tech-table">
                    <thead>
                        <tr>
                            <th>Zone</th>
                            <th>Type</th>
                            <th>Engineer</th>
                            <th>Resolved Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length > 0 ? reports.map(r => (
                            <tr key={r._id}>
                                <td>{r.location}</td>
                                <td>{r.problemType}</td>
                                <td style={{ color: 'var(--accent-green)' }}>{r.assignedEngineer?.name || 'Unknown'}</td>
                                <td>{new Date(r.updatedAt || r.createdAt).toLocaleDateString()}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center text-secondary">No resolved reports.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AdminResolved;
