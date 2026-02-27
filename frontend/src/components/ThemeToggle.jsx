import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
    // Default to dark theme for the techy vibe
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.documentElement.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
            document.documentElement.classList.remove('light-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="tech-button"
            style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px' }}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};

export default ThemeToggle;
