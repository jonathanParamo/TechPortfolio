"use client";

import Head from "next/head";
import Navbar from "@/app/components/Navbar";
import { useState, useEffect } from "react";

const Home = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <Head>
        <title>Welcome to My Portfolio</title>
        <meta name="description" content="Discover my work across various web technologies and projects." />
      </Head>
      <div className="w-full absolute top-0 z-10">
        <Navbar />
      </div>
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#000000] pt-12 px-5 flex justify-center items-start overflow-auto">
        <section className="w-full max-w-6xl h-auto lg:h-[562px] mx-auto bg-violet-300 dark:bg-[#f5f5f515] p-5 md:p-8 rounded-lg shadow-lg flex flex-col mb-4">
          <div className={`animate-container ${isClient ? "animate-slide-from-left" : ""} p-2 md:mt-2`}>
            <h1 className="text-lg md:text-3xl font-bold mb-2 md:mb-4 text-purple-800 dark:text-cyan-500">
              Welcome to My Portfolio
            </h1>
            <p className="text-purple-900 hover:text-purple-950 dark:text-cyan-400 mb-2 md:mb-6 hover:dark:text-cyan-300">
              I’m Jonathan, a versatile developer with extensive experience in working with a range of web technologies. Over the years, I"ve been involved in various projects where I"ve honed my skills in JavaScript, React, and more. My work is driven by a passion for delivering top-tier, innovative solutions that push the boundaries of web development.
            </p>
          </div>

          <div className={`animate-container ${isClient ? "animate-slide-from-right" : ""} p-2 md:mt-2`}>
            <h2 className="text-xl font-semibold text-purple-900 dark:text-cyan-500 mb-3">Project Highlights</h2>
            <p className="text-purple-800 hover:text-purple-700 dark:text-cyan-400 hover:dark:text-cyan-300">
              Throughout my career, I’ve worked on a multitude of projects ranging from simple web applications to complex systems. Each project presented unique challenges that helped me grow and refine my technical abilities. Here’s a glimpse of the technologies I"ve mastered along the way:
            </p>
          </div>

          <div className={`animate-container ${isClient ? "animate-slide-from-left" : ""} p-2 md:mt-2`}>
            <h2 className="text-xl font-semibold text-purple-900 dark:text-cyan-500 mb-3">My Approach</h2>
            <p className="text-purple-800 hover:text-purple-900 dark:text-cyan-400 hover:dark:text-cyan-300">
              My approach to development is deeply rooted in the values of integrity, innovation, and excellence. Whether it’s creating responsive user interfaces or optimizing back-end processes, I always strive to deliver solutions that exceed expectations and provide real value.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
