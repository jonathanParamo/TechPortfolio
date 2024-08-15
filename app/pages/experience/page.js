import Navbar from "@/app/components/Navbar";

const Admin = () => {
  return (
    <>
      <div className="w-full absolute top-0">
        <Navbar />
      </div>
      <main className="bg-white dark:bg-[#000000] w-full pt-5 pb-3 md:py-10 px-5">
        <div className="mt-12 flex items center justify-center text-violet-900">
          <h1 className="text-[20px]">Experiences</h1>
        
        </div>
      </main>
    </>
)
}

export default Admin;