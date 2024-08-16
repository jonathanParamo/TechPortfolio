"use client"

import Head from 'next/head';
import Navbar from '@/app/components/Navbar';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const About = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <Head>
        <title>Welcome to - MyApp</title>
        <meta name="description" content="Learn more about MyApp and our mission." />
      </Head>
      <div className="w-full absolute top-0 z-10">
        <Navbar />
      </div>
      <main className="md:h-screen bg-[#f5f5f5] dark:bg-[#000000] pt-12 px-5 flex justify-center items-start overflow-auto">
        <section className="container w-10/12 mx-auto max-w-3xl bg-violet-300 dark:bg-[#f5f5f515] p-5 md:p-8 rounded-lg shadow-lg flex flex-col mb-4 md:mb-0">
          <div className={`div1 ${isClient ? 'animate-slide-from-left' : ''} p-2 md:mt-2`}>
            <h1 className="text-lg md:text-3xl font-bold mb-2 md:mb-4 text-purple-800 dark:text-purple-200">
              About Me
            </h1>
            <p className="text-purple-800 hover:text-purple-500 dark:text-purple-100 mb-2 md:mb-6 hover:dark:text-purple-200">
              I’m Jonathan, a passionate developer with expertise in JavaScript, React, and various web technologies.
              My mission is to deliver high-quality products and solutions that exceed your expectations.
              I specialize in creating dynamic and engaging web applications using technologies such &nbsp;
              <Link
                href="/pages/technologies"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:dark:text-blue-200"
              >
                as.
              </Link>
            </p>
          </div>

          <div className={`div1 ${isClient ? 'animate-slide-from-right' : ''} p-2 md:mt-2`}>
            <h2 className="text-xl font-semibold text-blue-950 dark:text-blue-50 mb-3">Our Mission</h2>
            <p className="text-blue-800 hover:text-blue-700 dark:text-blue-100 hover:dark:text-blue-200">
              My mission is to innovate and excel in delivering cutting-edge technology solutions.
              I am dedicated to creating user-friendly applications that are both powerful and intuitive, leveraging my expertise in:
            </p>
          </div>

          <div className={`div1 ${isClient ? 'animate-slide-from-left' : ''} p-2 md:mt-2`}>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-50 mb-3">Our Values</h2>
            <p className="text-green-800 hover:text-green-700 dark:text-green-100 hover:dark:text-green-200">
              Integrity, innovation, and excellence are at the core of everything I do. I am committed to delivering value through:
              Honesty and Transparency, Cutting-edge Technology, User-Centric Design.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
