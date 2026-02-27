import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Droplet } from 'lucide-react';

import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminEngineers from './pages/AdminEngineers';
import AdminReports from './pages/AdminReports';
import AdminResolved from './pages/AdminResolved';
import AdminAlerts from './pages/AdminAlerts';
import EngineerDashboard from './pages/EngineerDashboard';
import About from './pages/About';

const LandingWrapper = ({ children }) => {
  return (
    <>
      <div className="landing-bg"></div>
      <div className="landing-overlay"></div>
      <nav className="landing-nav">
        <Link to="/" className="nav-brand">
          <Droplet size={28} color="var(--accent-cyan)" /> WaterSense
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/login" className="tech-button primary" style={{ padding: '8px 20px', borderRadius: '20px' }}>Login</Link>
        </div>
      </nav>
      {children}
    </>
  );
};

// Landing Hero specifically for the root "/" path
const HeroHeader = () => {
  return (
    <div className="auth-wrapper animated-fade-in" style={{ padding: '0 20px' }}>
      <div className="hero-tagline">Smart • Secure • Real-Time</div>
      <h1 className="hero-title">Manage Water Grids</h1>
      <h2 className="hero-subtitle">Like a Pro.</h2>
      <p className="hero-desc">
        WaterSense is a modern Telemetry System where admins monitor zones, users log incidents instantly, and engineers execute directives in real-time — making urban water management smooth, fast, and perfectly organized.
      </p>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <Link to="/login" className="tech-button primary" style={{ fontSize: '16px', padding: '15px 30px' }}>
          Access Login Portal
        </Link>
      </div>
    </div>
  );
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="container-center">Loading Data Core...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/about" element={<LandingWrapper><About /></LandingWrapper>} />
        {/* Landing / Auth Routes wrapped in the new Planora style */}
        <Route path="/" element={
          user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'engineer' ? '/engineer' : '/dashboard'} replace />
            : <LandingWrapper><HeroHeader /></LandingWrapper>
        } />

        <Route path="/login" element={
          user ? <Navigate to="/" replace />
            : <LandingWrapper><Login /></LandingWrapper>
        } />

        {/* Protected Routes (Dashboards have their own backgrounds/layouts now) */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/engineers" element={<ProtectedRoute allowedRoles={['admin']}><AdminEngineers /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/resolved" element={<ProtectedRoute allowedRoles={['admin']}><AdminResolved /></ProtectedRoute>} />
        <Route path="/admin/alerts" element={<ProtectedRoute allowedRoles={['admin']}><AdminAlerts /></ProtectedRoute>} />
        <Route
          path="/engineer/*"
          element={
            <ProtectedRoute allowedRoles={['engineer']}>
              <EngineerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
