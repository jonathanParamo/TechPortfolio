'use client'

import { createContext, useState, useEffect, useContext } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const preferredTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    setTheme(preferredTheme);
    document.documentElement.classList.toggle('dark', preferredTheme === 'dark');
  }, []);

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div>
        <button
          onClick={toggleTheme}
          className="relative w-14 h-8 md:w-[72px] md:h-12 bg-gray-700 rounded-full p-1 flex items-center transition-all duration-300 focus:outline-none"
        >
          <FaMoon className={`absolute left-1 w-5 h-5 md:w-8 md:h-8 text-gray-200 ${theme === 'dark' ? 'block' : 'hidden'}`} />
          <span
            className={`${
              theme === 'dark' ? 'translate-x-6 md:translate-x-8' : 'translate-x-0'
            } inline-block w-6 h-6 bg-[#f5f5f570] dark:bg-blue-200 rounded-full shadow-md transform transition-transform duration-300 dark:mr-0`}
          ></span>
          <FaSun className={`absolute right-1 w-5 h-5 ml-1 md:w-8 md:h-8 text-yellow-500 ${theme === 'dark' ? 'hidden' : 'block'}`} />
        </button>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
