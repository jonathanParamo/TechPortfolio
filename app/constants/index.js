import { FaLinkedin, FaXTwitter, FaGithub } from 'react-icons/fa6';
import {
  web,
  javascript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  sexshop,
  rickMorty,
  storage,
  booklog,
  logothreejs,
  dev_navigate,
  tech_shop,
  logo,
  backend,
} from '../../public/assets';

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/pages/contact', label: 'Contact' },
  { href: '/pages/about', label: 'About' },
  { href: '/pages/experience', label: 'Experience' },
  { href: '/pages/technologies', label: 'Technologies' },
  { href: '/pages/projects', label: 'Projects' },
];

export const socialLinks = [
  {
    href: 'https://www.linkedin.com/in/jonathan-guaydia-paramo/',
    icon: <FaLinkedin />,
  },
  // { href: 'https://twitter.com', icon: <FaXTwitter /> },
  { href: 'https://github.com/jonathanParamo', icon: <FaGithub /> },
];

export const technologies = [
  {
    name: 'HTML 5',
    icon: html,
  },
  {
    name: 'CSS 3',
    icon: css,
  },
  {
    name: 'JavaScript',
    icon: javascript,
  },
  {
    name: 'React JS',
    icon: reactjs,
  },
  {
    name: 'Redux',
    icon: redux,
  },
  {
    name: 'Tailwind',
    icon: tailwind,
  },
  {
    name: 'Node JS',
    icon: nodejs,
  },
  {
    name: 'MongoDB',
    icon: mongodb,
  },
  {
    name: 'Three JS',
    icon: logothreejs,
  },
  {
    name: 'git',
    icon: git,
  },
];

export const experiences = [
  {
    title: 'React.js Developer',
    company_name: 'DevNavigate (Spain)',
    iconBg: '#383E56',
    date: '01/2024 - 02/2025',
    points: [
      'Developed backend endpoints for Power BI dashboards used by Velzia Group to track housing data (sales, remodeling, construction).',
      'Integrated MongoDB data models and REST APIs into dynamic visual reporting.',
      'Worked with the MERN stack (MongoDB, Express, React, Node.js) to deliver scalable web services.',
      'Collaborated in an international remote team environment with tight delivery timelines.',
    ],
  },
  {
    title: 'React.js Developer',
    company_name: 'Online Catalog',
    iconBg: '#383E56',
    date: '05/2023 - 12/2023',
    points: [
      'Developing and maintaining web applications using React.js and other related technologies.',
      'To collaborate in a work team to create high-quality products.',
      'Implementing responsive design and ensuring cross-browser compatibility.',
      'Participating in code reviews and providing constructive feedback to other developers.',
    ],
  },
  {
    title: 'Full Stack Developer – Virtual Store',
    company_name: 'Talento Tech Project',
    iconBg: '#383E56',
    date: '06/2024 - 09/2024',
    points: [
      'Built a complete e-commerce system with an admin panel (React), storefront (Next.js), and backend API (Express + MongoDB).',
      'Implemented secure authentication, shopping cart, and CRUD functionality.',
      'Designed the RESTful backend and integrated it into both frontends.',
      'Delivered the project under technical requirements and deadlines.',
    ],
  },
];

export const projects = [
  {
    name: 'DevNavigate',
    description:
      'Developed backend endpoints for Power BI dashboards used by Velzia Group to monitor housing sales, remodeling, and construction data.',
    tags: [
      {
        name: '#MongoDB',
        color: 'text-green-600 dark:text-green-400',
      },
      {
        name: '#Express',
        color: 'text-yellow-700 dark:text-yellow-300',
      },
      {
        name: '#React',
        color: 'text-cyan-600 dark:text-cyan-400',
      },
      {
        name: '#Node.js',
        color: 'text-lime-600 dark:text-lime-400',
      },
    ],
    image: dev_navigate,
    source_code_link: '#',
    deployed_app_link: 'https://www.devnavigate.com/',
  },
  {
    name: 'Online Catalog',
    description:
      'Web application, users can view and interact with various products that can meet their needs and/or search for what they require, as well as add products to the cart.',
    tags: [
      {
        name: '#Next',
        color: 'dark:text-green-400 text-green-700',
      },
      {
        name: '#Mongodb',
        color: 'dark:text-cyan-400 text-purple-700',
      },
      {
        name: '#Tailwind',
        color: 'dark:text-amber-300 text-pink-500',
      },
    ],
    image: sexshop,
    source_code_link: 'https://github.com/bufssexshop/bufs-next-app',
    deployed_app_link: 'https://bufssexshop-bufssexshop-gmailcom.vercel.app/',
  },
  {
    name: 'Rick and Morty',
    description:
      'Web application that enables users to allows the user to search for characters, explore different dimensions, and learn about the characters that have appeared in the show.',
    tags: [
      {
        name: '#React',
        color: 'text-blue-500',
      },
      {
        name: '#Reduxtoolkit',
        color: 'dark:text-cyan-400 text-purple-700',
      },
      {
        name: '#MaterialUI',
        color: 'dark:text-pink-400 text-red-700',
      },
    ],
    image: rickMorty,
    source_code_link: 'https://github.com/jonathanParamo/RickAndMorty',
    deployed_app_link: 'https://rick-and-morty-bice.vercel.app/',
  },
  {
    name: 'Storage admi',
    description:
      'This web application allows the user to register or log in, as well as edit their profile. Additionally, it enables the creation, editing, and deletion of products and warehouses',
    tags: [
      {
        name: '#Reactjs',
        color: 'dark:text-sky-400 text-lime-700',
      },
      {
        name: '#Redux',
        color: 'dark:text-indigo-400 text-indigo-950',
      },
      {
        name: '#Css',
        color: 'dark:text-violet-500 text-violet-950 ',
      },
    ],
    image: storage,
    source_code_link: 'https://github.com/jonathanParamo/storageAdministration',
    deployed_app_link: 'https://storage-administration.vercel.app/',
    backend_repo: 'https://github.com/jonathanParamo/sotrages-api',
  },
  {
    name: 'Virtual Store',
    description:
      'Full e-commerce platform with a React admin panel, Next.js storefront, and a backend API with Express and MongoDB. Includes authentication, cart, and product management.',
    tags: [
      {
        name: '#Next.js',
        color: 'text-white dark:text-white',
      },
      {
        name: '#React',
        color: 'text-blue-600 dark:text-cyan-400',
      },
      {
        name: '#MongoDB',
        color: 'text-green-600 dark:text-green-400',
      },
      {
        name: '#Express.js',
        color: 'text-yellow-700 dark:text-yellow-300',
      },
    ],
    image: tech_shop,
    source_code_link:
      'https://github.com/jonathanParamo/Ecommerce-front-client',
    deployed_app_link: 'https://ecommerce-client-self-nine.vercel.app/',
    backend_repo: 'https://github.com/jonathanParamo/Ecommerce-backend',
  },
];
