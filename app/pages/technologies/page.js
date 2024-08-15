'use client'

import Navbar from "@/app/components/Navbar";
import WithTechnologies from "@/app/components/WitchTecnologies";
import TechnologyList from "@/app/components/TechnologiesList";

const Technologies = ({ technologies }) => {

  return (
    <>
      <div className="w-full absolute top-0">
        <Navbar className />
      </div>
      <main className="bg-[#000000] h-screen pt-5 pb-3 md:py-10 px-5">
        <div className="w-full mt-12 p-4 md:p-8 rounded-lg shadow-lg">
          <TechnologyList technologies={technologies} />
        </div>
      </main>
    </>
  );
}

export default WithTechnologies(Technologies);
