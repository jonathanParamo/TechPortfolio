'use client'

import { projects } from "@/app/constants";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import Navbar from "@/app/components/Navbar";
import Image from "next/image";

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
          <section className="container h-auto lg:h-[562px] mx-auto bg-violet-300 dark:bg-[#f5f5f515] p-5 md:p-8 rounded-lg shadow-lg flex flex-col mb-4 md:mb-0">
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
                    className={`relative w-full h-72 md:h-80 flex flex-col items-center border border-purple-700 dark:border-cyan-400 border-2 py-3 px-2 rounded bg-transparent shadow-lg transform transition-transform duration-300 hover:scale-105 ${isClient ? 'animate-slide-from-left' : ''}`}
                  >
                    <a
                      href={project.deployed_app_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex flex-col items-center"
                    >
                      <div className="relative w-full h-32">
                        <Image
                          src={project.image}
                          alt={project.name}
                          fill
                          className="object-cover rounded"
                        />
                        <a
                          href={project.source_code_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 text-white dark:text-cyan-950 dark:bg-white bg-purple-900 p-1 rounded-full
                          hover:bg-white hover:text-purple-900 transition-colors dark:hover:bg-cyan-950 dark:hover:text-white duration-300"
                        >
                          <FaGithub size={24} />
                        </a>
                      </div>
                      <h2 className="w-full text-center my-3 overflow-hidden text-violet-900 dark:text-cyan-400">
                        {project.name}
                      </h2>
                      <p className="hidden text-center text-sm md:block mb-3 h-10 overflow-hidden px-2 text-violet-900 dark:text-cyan-400">
                        {project.description}
                      </p>
                    </a>
                    <div className="w-full flex justify-around items-center mt-2">
                      <p
                        href={project.deployed_app_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-white px-2 py-1 border bg-purple-800 dark:border-white rounded dark:bg-transparent dark:hover:bg-[#f5f5f525] transition-colors dark:hover:text-white hover:bg-transparent hover:text-purple-800 border-purple-800 dark:hover:border-transparent duration-300"
                      >
                        Live Demo
                      </p>
                    </div>
                    <div className="flex mt-2 flex-wrap justify-center">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 mr-1 rounded ${tag.color}`}
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
}

export default Projects;
