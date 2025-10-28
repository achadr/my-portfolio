import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import mcpHubImg from "../public/mcp-hub.png";
import cvMakerImg from "../public/cv-maker.png";
import cityAnalyzerImg from "../public/city-analyzer.png";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [
  {
    title: "Graduated INPT, IAE Rouen",
    location: "Rabat, Rouen",
    description:
      "I obtained my engineering degree",
    icon: React.createElement(LuGraduationCap),
    date: "2019",
  },
  {
    title: "Front-End Developer internships",
    location: "Ile-de-france",
    description:
      "I worked as a front-end developer for 1 years, 6 months at Orange, building an internal user interface for managers. And other 6 months as a full stack developer building a POC about managing Data using a pipeline for Datascio.",
    icon: React.createElement(CgWorkAlt),
    date: "2019 - 2020",
  },
  {
    title: "Front-end developer",
    location: "Paris",
    description:
      "I occupied a front-end developer role working for Geotwin.My mission was developing and maintaining the Geotwin platform, the landing page project and also managing external developer and reviewing their commited code. My stack includes React, Gatsby, TypeScript, Ant design, DeckGL and arrangoDB. I'm also open to full-stack opportunities.",
    icon: React.createElement(FaReact),
    date: "2021 - 2024",
  },
] as const;

export const projectsData = [
  {
    title: "MCP Hub",
    description:
      "A platform for discovering musician concerts and performances by location. Features event search, detailed performance information, and location-based filtering.",
    tags: ["TypeScript", "React", "Express", "Vite", "Node.js"],
    imageUrl: mcpHubImg,
    url: "https://mcp-learning-hub.vercel.app/",
  },
  {
    title: "CV Maker",
    description:
      "Professional resume builder with 8 customizable templates, live preview, and PDF export. Features auto-save, template customization, and localStorage persistence.",
    tags: ["React", "Vite", "Tailwind", "Zustand", "PDF Renderer"],
    imageUrl: cvMakerImg,
    url: "https://cv-maker-xi-dun.vercel.app/",
  },
  {
    title: "City Analyzer",
    description:
      "Interactive map visualization tool for analyzing city demographics and population data with drawing tools, geospatial analysis, and detailed charts.",
    tags: ["React", "TypeScript", "Mapbox GL", "Recharts", "Turf.js"],
    imageUrl: cityAnalyzerImg,
    url: "https://city-analyzer.vercel.app/",
  },
] as const;

export const skillsData = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Git",
  "Tailwind",
  "MongoDB",
  "Redux",
  "GraphQL",
  "Apollo",
  "Python",
  "Framer Motion",
  "DeckGL",
  "Mapbox",
  "Recharts",
  "D3.js"
] as const;