'use client';

import { useState } from 'react';
import Link from 'next/link';
import { navLinks, socialLinks } from '../constants';
import Image from 'next/image';
import { ThemeProvider } from './ThemeProvider';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="p-4 bg-purple-800 dark:bg-[#000000] text-black dark:text-white">
      <div className="container mx-auto flex justify-between items-center ">
        <div className="text-white text-xl font-bold">
          <Link href="/" className='flex text-lg h-8 text-[22px] hover:dark:text-cyan-500'>
            <Image src="/assets/logo.svg" width={25} height={25} alt="logo" />
            onathan
          </Link>
        </div>
        <div className="block md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
        <ul className="hidden md:flex md:flex-row md:space-x-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-white text-lg hover:text-red-50 dark:text-cyan-300 hover:dark:text-cyan-500"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden md:flex space-x-4">
          {socialLinks.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-cyan-400"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-purple-800 dark:bg-[#000000] z-50">
          <ul className="flex flex-col items-center space-y-2">
            {navLinks.map((link) => (
              <li key={link.href} className="w-full py-2 pr-6 text-right hover:bg-[#f5f5f510]">
                <Link href={link.href} className="text-white hover:text-red-50 hover:dark:text-cyan-500 block">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="fixed mt-52 md:hidden ">
        <div className="flex flex flex-col space-y-3 ">
          {socialLinks.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center w-10 h-10 bg-purple-700 hover:bg-purple-950
              dark:bg-[#f5f5f530] rounded-full text-white hover:dark:bg-cyan-800"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 right-0 m-6">
        <div className="flex flex flex-col space-y-3 ">
          <ThemeProvider />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
