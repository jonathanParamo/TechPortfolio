"use client"

import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div>
      <div className="w-full absolute top-0">
        <Navbar />
      </div>
      <main className="bg-[#000000] pt-5 pb-3 md:py-10 px-5 mt-12">
        Hola mundo
      </main>
    </div>
  );
}
