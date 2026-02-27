import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { ShieldCheck } from 'lucide-react';

const AdminEngineers = () => {
    const [engineers, setEngineers] = useState([]);

    useEffect(() => {
        const fetchEng = async () => {
            try {
                const res = await api.get('/engineers');
                setEngineers(res.data);
            } catch (err) {
                console.error("Failed to load engineers", err);
            }
        };
        fetchEng();
    }, []);

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title"><ShieldCheck size={24} style={{ display: 'inline', marginRight: '10px', color: 'var(--accent-cyan)' }} /> Field Engineers</h1>
                    <p className="page-subtitle">Active engineering personnel</p>
                </div>
            </div>
            <div className="glass-panel">
                <table className="tech-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Assigned Zone</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {engineers.map(e => (
                            <tr key={e._id}>
                                <td>{e.name}</td>
                                <td>{e.email}</td>
                                <td>{e.assignedZone || 'N/A'}</td>
                                <td><span style={{ color: 'var(--accent-green)' }}>Active</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AdminEngineers;
