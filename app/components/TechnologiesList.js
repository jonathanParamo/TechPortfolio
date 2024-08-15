import Image from "next/image";

const TechnologyList = ({ technologies }) => {
  return (
    <div className="bg-black rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white w-full text-center">
        Technologies I Work With
      </h2>
      <div className="technology-list w-full flex flex-wrap justify-center gap-6">
        {technologies.map((tech) => (
          <div
            key={tech.name}
            className="w-32 h-32 flex items-center justify-center bg-black p-4 rounded-lg shadow-md hover:bg-gray-800 transition-all duration-300">
            <Image
              src={tech.icon}
              alt={tech.name}
              width={70}
              height={70}
              className="technology-icon hover:scale-105 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnologyList;
