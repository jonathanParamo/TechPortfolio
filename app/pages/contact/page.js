import Head from 'next/head';
import Navbar from '../../components/Navbar';

const Contact = () => {
  return (
    <>
      <Head>
        <title>Contact - MyApp</title>
        <meta name="description" content="Get in touch with us for inquiries or support." />
      </Head>
      <div className="w-full absolute top-0 z-10">
        <Navbar />
      </div>
      <main className="min-h-screen bg-white dark:bg-[#000000] pt-12 px-5 flex justify-center items-start">
        <section className="w-full max-w-6xl h-auto lg:h-[562px] mx-auto bg-violet-300 dark:bg-[#f5f5f515] p-5 md:p-8 rounded-lg shadow-lg flex flex-col mb-4">
          <h1 className="text-lg md:text-3xl font-bold mb-3 md:mb-4 text-violet-900 dark:text-cyan-300">
            Contact Us
          </h1>
          <p className="dark:text-cyan-400 mb-2 text-sm md:text-lg text-violet-800">
            We would love to hear from you! Please fill out the form below or use the contact
            information provided to get in touch with us.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-violet-300 dark:bg-transparent p-4 md:p-6 rounded-lg shadow-md">
              <h2 className="text-base md:text-lg font-semibold text-purple-800 mb-4 dark:text-cyan-300">Get in Touch</h2>
              <form action="#" method="POST" className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs md:text-sm font-medium text-violet-900 dark:text-cyan-300">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Name"
                    required
                    className="mt-1 block w-full border-none rounded-md shadow-sm p-2 bg-pink-50 text-violet-700 dark:text-cyan-400 outline-none dark:bg-[#f5f5f525]"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs md:text-sm font-medium text-violet-900 dark:text-cyan-300">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 block w-full border-none rounded-md shadow-sm p-2 bg-pink-50 text-violet-700 dark:text-cyan-400 outline-none dark:bg-[#f5f5f525]"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-violet-700 dark:text-cyan-300">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="4"
                    className="mt-1 block w-full rounded-md shadow-sm p-2 dark:bg-[#f5f5f525] text-violet-700 dark:text-cyan-400 border-none bg-pink-50 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 bg-purple-500 text-white mt-3 px-4 rounded-md shadow-md dark:border dark:border-cyan-300 dark:bg-transparent hover:dark:bg-cyan-800 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Send Message
                </button>
              </form>
            </div>

            <div className="bg-violet-300 dark:bg-transparent p-4 md:p-6 rounded-lg shadow-md">
              <h2 className="text-md md:text-xl font-semibold text-violet-900 dark:text-cyan-400 mb-4">My Contact Information</h2>
              <p className="text-violet-900 dark:text-cyan-400 mb-2 text-sm md:text-lg">
                <strong>Email:</strong> jhonathan-and@outlook.com
              </p>
              <p className="text-violet-900 dark:text-cyan-400 text-sm md:text-lg">
                <strong>Phone:</strong> +57 3154220879
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Contact;
