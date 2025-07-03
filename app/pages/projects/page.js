'use client';

import { projects } from '@/app/constants';
import { useEffect, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import Navbar from '@/app/components/Navbar';
import Image from 'next/image';

const Projects = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <div className="w-full absolute top-0 z-10">
        <Navbar />
      </div>

      <main className="h-auto min-h-screen bg-[#f5f5f5] dark:bg-[#000000] pt-12 px-5 flex justify-center items-start overflow-auto">
        <div className="w-full max-w-6xl">
          <section className="container h-auto mx-auto bg-violet-300 dark:bg-[#f5f5f515] p-5 md:p-8 rounded-lg shadow-lg flex flex-col mb-4 md:mb-0 mt-8">
            <h1
              className={`text-2xl md:text-3xl font-bold text-center text-violet-900 dark:text-cyan-400 p-1 md:p-2 ${isClient ? 'animate-slide-from-right' : ''}`}
            >
              Projects
            </h1>
            <div className="w-full mt-8">
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {projects.map((project, index) => (
                  <li
                    key={index}
                    className={`relative w-full flex flex-col items-center border border-gray-300 dark:border-cyan-400 rounded-lg bg-white dark:bg-[#111] shadow-md hover:shadow-xl transition-transform transform hover:scale-[1.02] p-4`}
                  >
                    <Image
                      src={project.image}
                      alt={project.name}
                      width={500}
                      height={300}
                      className="rounded-md object-cover w-full h-32"
                    />

                    <h2 className="text-lg font-semibold text-center mt-4 text-gray-800 dark:text-cyan-400">
                      {project.name}
                    </h2>

                    <p className="text-sm text-center mt-2 text-gray-700 dark:text-gray-300 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="flex justify-center gap-3 mt-4">
                      <a
                        href={project.deployed_app_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-700 text-white dark:bg-cyan-500 dark:text-black px-3 py-1 rounded hover:bg-purple-900 dark:hover:bg-cyan-700 transition"
                      >
                        Live Demo
                      </a>
                    </div>
                    <div className="w-full flex justify-center gap-2 mt-2">
                      {project.source_code_link && (
                        <a
                          href={project.frontend_repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm border text-white bg-pink-500 dark:bg-black hover:bg-pink-400 dark:border-purple-500 dark:text-purple-500 px-2 py-1 rounded hover:border-purple-400 dark:text-purple-400 transition"
                        >
                          <FaGithub className="mr-1" />
                          Frontend
                        </a>
                      )}

                      {project.backend_repo && (
                        <a
                          href={project.backend_repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center border border-solid text-sm text-black border-gray-500 dark:text-white px-2 py-1 rounded dark:hover:border-[#f5f5f5] hover:border-black hover:bg-black hover:text-white transition"
                        >
                          <FaGithub className="mr-1" />
                          backend
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {project.tags.map((tag, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded-full ${tag.color} bg-opacity-20 border border-transparent`}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Projects;
