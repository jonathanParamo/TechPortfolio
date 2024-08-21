'use client'

import Navbar from "@/app/components/Navbar";
import WithTechnologies from "@/app/components/WitchTecnologies";
import TechnologyList from "@/app/components/TechnologiesList";
import { useState, useEffect } from "react";

const Technologies = ({ technologies }) => {
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
          <section className="container h-[562px] mx-auto bg-violet-300 dark:bg-[#f5f5f515] p-5 md:p-8 rounded-lg shadow-lg flex flex-col mb-4 md:mb-0">
            <h1
              className={`text-2xl md:text-3xl font-bold text-center text-violet-900 dark:text-cyan-400
                ${isClient ? 'animate-slide-from-right' : ''} p-1 md:p-2 mb-2`}
            >
              Technologies
            </h1>
            <div
              className={`text-2xl md:text-3xl font-bold text-center text-violet-900 dark:text-cyan-400
              ${isClient ? 'animate-slide-from-left' : ''} p-1 mt-2 md:p-2 space-y-4 text-violet-900 dark:text-cyan-400`}
            >
              <TechnologyList technologies={technologies} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default WithTechnologies(Technologies);
