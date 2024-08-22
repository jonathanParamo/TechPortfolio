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
  logo
} from "../../public/assets";

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/pages/contact', label: 'Contact' },
  { href: '/pages/about', label: 'About' },
  { href: '/pages/experience', label: 'Experience' },
  { href: '/pages/technologies', label: 'Technologies' },
  { href: '/pages/projects', label: 'Projects' },
];

export const socialLinks = [
  { href: 'https://www.linkedin.com/in/jonathan-guaydia-paramo/', icon: <FaLinkedin /> },
  // { href: 'https://twitter.com', icon: <FaXTwitter /> },
  { href: 'https://github.com/jonathanParamo', icon: <FaGithub /> },
];

export const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Redux",
    icon: redux,
  },
  {
    name: "Tailwind",
    icon: tailwind,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "Three JS",
    icon: logothreejs,
  },
  {
    name: "git",
    icon: git,
  },
];

export const experiences = [
  {
    title: "React.js Developer",
    company_name: "BuffetShexShop",
    iconBg: "#383E56",
    date: "August 2022 - at the moment",
    points: [
      "Developing and maintaining web applications using React.js and other related technologies.",
      "To collaborate in a work team to create high-quality products.",
      "Implementing responsive design and ensuring cross-browser compatibility.",
      "Participating in code reviews and providing constructive feedback to other developers.",
    ],
  },
];

export const projects = [
  {
    name: "Sex shop",
    description:
      "Web application, users can view and interact with various products that can meet their needs and/or search for what they require, as well as add products to the cart.",
    tags: [
      {
        name: "#Next",
        color: "dark:text-green-400 text-green-700",
      },
      {
        name: "#Mongodb",
        color: "dark:text-cyan-400 text-purple-700",
      },
      {
        name: "#Tailwind",
        color: "dark:text-amber-300 text-pink-500",
      },
    ],
    image: sexshop,
    source_code_link: "https://github.com/bufssexshop/bufs-next-app",
    deployed_app_link: "https://bufssexshop-bufssexshop-gmailcom.vercel.app/",
  },
  {
    name: "Rick and Morty",
    description:
      "Web application that enables users to allows the user to search for characters, explore different dimensions, and learn about the characters that have appeared in the show.",
    tags: [
      {
        name: "#React",
        color: "text-blue-500",
      },
      {
        name: "#Reduxtoolkit",
        color: "dark:text-cyan-400 text-purple-700",
      },
      {
        name: "#MaterialUI",
        color: "dark:text-pink-400 text-red-700",
      },
    ],
    image: rickMorty,
    source_code_link: "https://github.com/jonathanParamo/RickAndMorty",
    deployed_app_link: "https://rick-and-morty-bice.vercel.app/",
  },
  {
    name: "Storage administration",
    description:
      "This web application allows the user to register or log in, as well as edit their profile. Additionally, it enables the creation, editing, and deletion of products and warehouses",
    tags: [
      {
        name: "#Reactjs",
        color: "dark:text-sky-400 text-lime-700",
      },
      {
        name: "#Redux",
        color: "dark:text-indigo-400 text-indigo-950",
      },
      {
        name: "#Css",
        color: "dark:text-violet-500 text-violet-950 ",
      },
    ],
    image: storage,
    source_code_link: "https://github.com/jonathanParamo/storageAdministration",
    deployed_app_link: "https://storage-administration.vercel.app/",
  },
  {
    name: "Booklog",
    description:
      "This book web app enables user registration, login, and browsing of available books. Users can also reserve and manage their bookings, including returns, from their profile.",    tags: [
      {
        name: "#Reactjs",
        color: "dark:text-fuchsia-500 text-fuchsia-950",
      },
      {
        name: "#Reduxtoolkit",
        color: "dark:text-rose-500 text-fuchsia-950",
      },
      {
        name: "#Tailwind",
        color: "dark:text-fuchsia-400 text-fuchsia-900",
      },
    ],
    image: booklog,
    source_code_link: "https://github.com/jonathanParamo/bookLog",
    deployed_app_link: "https://book-log-psi.vercel.app/",
  },
];
