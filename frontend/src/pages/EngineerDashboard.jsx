import { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { KanbanSquare, CheckCircle, Clock } from 'lucide-react';
import ZoneMap from '../components/ZoneMap';

const EngineerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchTasks = async () => {
        try {
            const [reportsRes, alertsRes] = await Promise.all([
                api.get('/reports/engineer'),
                api.get('/alerts/engineer')
            ]);

            const formattedAlerts = alertsRes.data.map(a => ({
                _id: a._id,
                problemType: `System Alert: ${a.reason}`,
                description: `Automated ${a.severity} level anomaly.`,
                location: a.zone,
                status: a.status,
                createdAt: a.createdAt,
                userId: { name: 'System AI' },
                isAlert: true
            }));

            setTasks([...reportsRes.data, ...formattedAlerts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Failed to load engineer tasks", err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleStatusUpdate = async (task, newStatus, note = '') => {
        try {
            if (task.isAlert) {
                await api.put(`/alerts/${task._id}/status`, { status: newStatus });
            } else {
                await api.put(`/reports/${task._id}/status`, {
                    status: newStatus,
                    completionNote: note
                });
            }
            fetchTasks();
        } catch (error) {
            console.error("Failed to update task status", error);
        }
    };

    const StatusBadge = ({ status }) => {
        const colorClass = status === 'Resolved' ? 'success' : status === 'In Progress' ? 'info' : 'warning';
        return <span className={`badge ${colorClass}`}>{status}</span>;
    };

    const filteredTasks = statusFilter === 'All' ? tasks : tasks.filter(t => t.status === statusFilter);

    return (
        <Layout>
            <Routes>
                {/* Main Dashboard View - No Tasks, No Map */}
                <Route path="/" element={
                    <>
                        <div className="page-header mt-4">
                            <div>
                                <h1 className="page-title">Operative Terminal</h1>
                                <p className="page-subtitle">Assigned Sector: {user?.assignedZone}</p>
                            </div>
                        </div>
                        <div className="glass-panel text-center" style={{ padding: '60px' }}>
                            <h2 style={{ color: 'var(--accent-cyan)', marginBottom: '10px' }}>System Online</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Welcome to your operative terminal. Select an action from the sidebar to continue.</p>
                        </div>
                    </>
                } />

                {/* Tasks Feed View */}
                <Route path="/tasks" element={
                    <>
                        <div className="page-header mt-4">
                            <div>
                                <h1 className="page-title">Active Directives</h1>
                                <p className="page-subtitle">Tracking operational tasks</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', background: 'var(--glass-bg)', padding: '5px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                {['All', 'Assigned', 'In Progress', 'Resolved'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        className="tech-button"
                                        style={{
                                            padding: '8px 12px',
                                            border: 'none',
                                            background: statusFilter === filter ? 'var(--accent-cyan)' : 'transparent',
                                            color: statusFilter === filter ? '#fff' : 'var(--text-secondary)'
                                        }}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            {filteredTasks.length === 0 ? (
                                <div className="glass-panel flex items-center justify-between" style={{ padding: '50px', gridColumn: '1 / -1', flexDirection: 'column' }}>
                                    <CheckCircle size={50} style={{ color: 'var(--accent-green)', opacity: 0.5, marginBottom: '20px' }} />
                                    <h3 className="panel-title">Queue Empty</h3>
                                    <p className="page-subtitle">No operational directives pending.</p>
                                </div>
                            ) : (
                                filteredTasks.map(task => (
                                    <div key={task._id} className="glass-panel task-card">
                                        <div className="task-header">
                                            <StatusBadge status={task.status} />
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Clock size={12} /> {new Date(task.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="task-title" style={{ color: 'var(--accent-cyan)' }}>{task.problemType}</h3>
                                        <p className="task-desc">{task.description}</p>

                                        <div className="task-meta">
                                            <div className="task-meta-row">
                                                <span style={{ color: 'var(--text-secondary)' }}>Log Location:</span>
                                                <span style={{ fontWeight: 500 }}>{task.location}</span>
                                            </div>
                                            <div className="task-meta-row">
                                                <span style={{ color: 'var(--text-secondary)' }}>Initiated By:</span>
                                                <span style={{ fontWeight: 500 }}>{task.userId?.name}</span>
                                            </div>
                                        </div>

                                        <div className="task-actions">
                                            {task.status === 'Assigned' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(task, 'In Progress')}
                                                    className="tech-button w-full"
                                                >
                                                    Execute Directive
                                                </button>
                                            )}
                                            {task.status === 'In Progress' && (
                                                <button
                                                    onClick={() => {
                                                        const note = task.isAlert ? '' : prompt("Enter final operation log:");
                                                        if (note !== null) handleStatusUpdate(task, 'Resolved', note);
                                                    }}
                                                    className="tech-button success w-full"
                                                >
                                                    Seal & Terminate
                                                </button>
                                            )}
                                            {task.status === 'Resolved' && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '100%' }}>
                                                    <span style={{ color: 'var(--text-primary)' }}>Terminal Log: </span>
                                                    {task.completionNote || 'No input provided.'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                } />

                {/* Map View */}
                <Route path="/map" element={
                    <>
                        <div className="page-header mt-4">
                            <div>
                                <h1 className="page-title">Sector Map</h1>
                                <p className="page-subtitle">Visualizing active directives in {user?.assignedZone}</p>
                            </div>
                        </div>
                        <div className="glass-panel">
                            <div className="panel-body" style={{ padding: '0px' }}>
                                <ZoneMap role="engineer" zoneFilter={user?.assignedZone} />
                            </div>
                        </div>
                    </>
                } />
            </Routes>
        </Layout>
    );
};

export default EngineerDashboard;
