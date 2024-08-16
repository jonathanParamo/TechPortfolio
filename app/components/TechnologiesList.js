
import Image from "next/image";



const TechnologyList = ({ technologies }) => {
  return (
    <div className="bg-transparent rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 md:mb-6 text-purple-900 dark:text-cyan-500 w-full text-center">
        Technologies I Work With
      </h2>
      <div className="technology-list w-full flex flex-wrap justify-center gap-6">
        {technologies.map((tech) => (
          <div
            key={tech.name}
            className="w-16 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28  flex items-center justify-center
              bg-purple-950 hover:bg-purple-900 dark:bg-black hover:dark:bg-slate-950 p-4 rounded-lg shadow-md hover:bg-gray-800 transition-all duration-300">
            <Image
              src={tech.icon}
              alt={tech.name}
              width={70}
              height={70}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20  technology-icon hover:scale-105 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnologyList;
