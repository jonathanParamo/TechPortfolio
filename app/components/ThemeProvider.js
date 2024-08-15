'use client';

import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="flex items-center">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="relative w-14 h-8 md:w-[72px] md:h-12 bg-gray-700
        rounded-full p-1 flex items-center transition-all duration-300 focus:outline-none"
      >
        <FaMoon className={`absolute left-1 w-5 h-5 md:w-8 md:h-8 text-gray-200 ${theme === 'dark' ? 'block' : 'hidden'}`} />
        <span
          className={`${
            theme === 'dark' ? 'translate-x-6 md:translate-x-8' : 'translate-x-0 '
          } inline-block w-6 h-6 bg-[#f5f5f570] dark:bg-blue-200 rounded-full shadow-md transform
          transition-transform duration-300 dark:mr-0`}
        ></span>
          <FaSun className={`absolute right-1 w-5 h-5 ml-1 md:w-8 md:h-8 text-yellow-500 ${theme === 'dark' ? 'hidden' : 'block'}`} />
      </button>
    </div>
  );
};

export default ThemeProvider;
