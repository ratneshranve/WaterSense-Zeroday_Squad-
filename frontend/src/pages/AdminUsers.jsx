import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Users } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users');
                setUsers(res.data.filter(u => u.role === 'user'));
            } catch (err) {
                console.error("Failed to load users", err);
            }
        };
        fetchUsers();
    }, []);

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title"><Users size={24} style={{ display: 'inline', marginRight: '10px', color: 'var(--accent-cyan)' }} /> Active Users</h1>
                    <p className="page-subtitle">Registered user accounts on the platform</p>
                </div>
            </div>
            <div className="glass-panel">
                <table className="tech-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Zone</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.location || 'N/A'}</td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AdminUsers;
