'use client'

import Navbar from "@/app/components/Navbar";
import WithTechnologies from "@/app/components/WitchTecnologies";
import TechnologyList from "@/app/components/TechnologiesList";

const Technologies = ({ technologies }) => {
  return (
    <>
      <div className="w-full absolute top-0">
        <Navbar />
      </div>
      <main className="bg-white dark:bg-[#000000] h-[calc(100vh-32px)]
        flex justify-center items-start overflow-auto lg:h-[calc(100vh-48px)]">
        <div className="w-10/12 max-w-4xl bg-violet-300 dark:bg-[#f5f5f515]
          mt-12 p-5 md:p-8 rounded-lg shadow-lg mb-5 md:mb-0">
          <TechnologyList technologies={technologies} />
        </div>
      </main>
    </>
  );
}

export default WithTechnologies(Technologies);
