import React from 'react';
import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'theme-mode';
const normalizeTheme = (value) => (value === 'dark' ? 'dark' : 'light');

const HeaderMode = () => {

    const [theme, setTheme] = useState('light'); // default to 'light' theme

    useEffect(() => {
        const resolvedTheme = normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
        setTheme(resolvedTheme);
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(resolvedTheme);
        localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    };


    return (
        <>
            <div className="header-dark" onClick={toggleTheme}>
                <div className={`sun-logo head-icon ${theme === 'dark' ? 'sun' : ''}`}>
                    <i className="ph ph-moon-stars"></i>
                </div>
                <div className={`moon-logo head-icon ${theme === 'dark' ? 'moon' : ''}`}>
                    <i className="ph ph-sun-dim"></i>
                </div>
            </div>
        </>
    );
};

export default HeaderMode;
