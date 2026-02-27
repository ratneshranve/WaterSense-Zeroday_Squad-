import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    Droplet,
    Menu,
    X,
    Users,
    Map,
    FileText,
    AlertTriangle,
    KanbanSquare,
    ShieldCheck
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (!user) return [];
        switch (user.role) {
            case 'admin':
                return [
                    { name: 'Core Overview', path: '/admin', icon: LayoutDashboard },
                    { name: 'Active Users', path: '/admin/users', icon: Users },
                    { name: 'Engineers', path: '/admin/engineers', icon: ShieldCheck },
                    { name: 'Active Reports', path: '/admin/reports', icon: FileText },
                    { name: 'Resolved', path: '/admin/resolved', icon: ShieldCheck },
                    { name: 'System Alerts', path: '/admin/alerts', icon: AlertTriangle },
                ];
            case 'engineer':
                return [
                    { name: 'Dashboard', path: '/engineer', icon: LayoutDashboard },
                    { name: 'My Tasks', path: '/engineer/tasks', icon: KanbanSquare },
                    { name: 'Sector Map', path: '/engineer/map', icon: Map },
                ];
            case 'user':
            default:
                return [
                    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                    { name: 'Report Issue', path: '/dashboard/report', icon: FileText },
                    { name: 'My Reports', path: '/dashboard/history', icon: FileText },
                ];
        }
    };

    const navItems = getNavItems();

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="brand">
                    <Droplet size={24} />
                    <span>WaterSense</span>
                </div>
                <button
                    className="tech-button"
                    style={{ padding: '5px', display: window.innerWidth > 768 ? 'none' : 'block' }}
                    onClick={() => setIsOpen(false)}
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-role">{user?.role}</div>
                </div>
                <button className="tech-button danger w-full" onClick={handleLogout}>
                    <LogOut size={16} /> End Session
                </button>
            </div>
        </aside>
    );
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className={`main-content animated-fade-in ${sidebarOpen ? '' : ''}`}>
                <header className="topbar">
                    <div className="brand">
                        <Droplet size={20} /> SYS_OP
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button className="tech-button" style={{ padding: '6px' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <Menu size={20} />
                        </button>
                    </div>
                </header>

                <div style={{ position: 'absolute', top: '20px', right: '30px', zIndex: 100 }} className="hidden-mobile">
                    <ThemeToggle />
                </div>

                <div style={{ marginTop: '20px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
