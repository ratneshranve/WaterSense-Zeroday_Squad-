import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';

const About = () => {
    return (
        <div className="auth-wrapper animated-fade-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Droplet size={48} color="var(--accent-cyan)" style={{ marginBottom: '20px' }} />
                <h1 className="serif-heading" style={{ fontSize: '36px', marginBottom: '20px' }}>About WaterSense</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: '1.6', marginBottom: '20px', textAlign: 'left' }}>
                    WaterSense is a state-of-the-art telemetry system designed to streamline urban water management. Our platform connects administrators, field engineers, and end-users into a single cohesive network, ensuring rapid response to incidents, transparent monitoring of water zones, and efficient workflow execution.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: '1.6', marginBottom: '30px', textAlign: 'left' }}>
                    Our mission is to empower cities and communities with smart, secure, and real-time data to protect our most vital resource. We combine modern technology with robust operational tools to make water grid management seamless, intelligent, and highly responsive.
                </p>
                <Link to="/" className="tech-button" style={{ padding: '10px 20px' }}>
                    &larr; Back to Home
                </Link>
            </div>
        </div>
    );
};

export default About;
