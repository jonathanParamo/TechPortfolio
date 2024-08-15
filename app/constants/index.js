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
  { href: '/pages/contact', label: 'Contact' },
  { href: '/pages/about', label: 'About' },
  { href: '/pages/experience', label: 'Experience' },
  { href: '/pages/technologies', label: 'Technologies' },
];

export const socialLinks = [
  { href: 'https://linkedin.com', icon: <FaLinkedin /> },
  { href: 'https://twitter.com', icon: <FaXTwitter /> },
  { href: 'https://github.com', icon: <FaGithub /> },
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



