'use client'

import Navbar from "@/app/components/Navbar";
import { experiences } from "@/app/constants";
import { useEffect, useState } from "react";

const Experiences = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      <div className="w-full absolute top-0 z-10">
        <Navbar />
      </div>

      <main className="h-screen bg-[#f5f5f5] dark:bg-[#000000] pt-12 px-5 flex justify-center items-start overflow-auto">
        <div className=" w-10/12">
          <section className="container w-full md:h-[532px] mx-auto max-w-3xl bg-violet-300 dark:bg-[#f5f5f515]
            p-5 md:p-8 rounded-lg shadow-lg flex flex-col mb-4 md:mb-0">
            <h1
              className={`text-2xl md:text-3xl font-bold text-center text-violet-900 dark:text-cyan-400
                ${isClient ? 'animate-slide-from-right' : ''} p-1 md:p-2`}
            >
              Experiences
            </h1>
            <div className="space-y-4 text-violet-900 dark:text-cyan-400">
              {experiences?.map(({ title, company_name, date, points }) => (
                <section key={title} className="bg-transparent p-4 rounded-lg shadow-sm">
                  <div className={`p-2 ${isClient ? 'animate-slide-from-right' : ''}`}>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="text-lg font-medium">{company_name}</p>
                    <p className="text-lg">{date}</p>
                  </div>
                  <div className={`p-2 ${isClient ? 'animate-slide-from-left' : ''}`}>
                    <ul className="list-disc list-inside space-y-2  text-lg">
                      {points.map((point, index) => (
                        <li key={index} className="">{point}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Experiences;
