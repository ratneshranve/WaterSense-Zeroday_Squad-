import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Droplet } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);

        if (res.success) {
            if (res.role === 'admin') navigate('/admin');
            else if (res.role === 'engineer') navigate('/engineer');
            else navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="auth-wrapper animated-fade-in">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 className="serif-heading" style={{ fontSize: '32px', marginBottom: '10px' }}>Sign in to WaterSense</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Please enter your details.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-msg">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            required
                            className="tech-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            required
                            className="tech-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="tech-button primary w-full" style={{ padding: '15px' }}>
                        Sign In
                    </button>

                    <div className="text-center mt-4">
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
                                Register Now
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
