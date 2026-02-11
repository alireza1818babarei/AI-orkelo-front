import React from 'react';
import { useEffect, useState } from 'react';

const HeaderMode = () => {

    const [theme, setTheme] = useState('light'); // default to 'light' theme

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme-mode');
        if (storedTheme) {
            setTheme(storedTheme);
            document.body.classList.add(storedTheme);
        } else {
            document.body.classList.add('light');
            setTheme('light');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(newTheme);
        localStorage.setItem('theme-mode', newTheme);
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