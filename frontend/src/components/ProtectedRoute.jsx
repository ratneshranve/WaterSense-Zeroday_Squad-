import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard if they try to access unauthorized routes
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'engineer') return <Navigate to="/engineer" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
