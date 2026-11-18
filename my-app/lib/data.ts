import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import mcpHubImg from "../public/mcp-hub.png";
import cvMakerImg from "../public/cv-maker.png";
import cityAnalyzerImg from "../public/city-analyzer.png";
import gitInsightsImg from "../public/git-insights.png";
import ecg3dImg from "../public/ecg-3d.png";

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
    title: "Freelance Full-Stack Developer",
    location: "France",
    description:
      "Working as a freelance full-stack developer, designing and building modern web applications for clients from brief to production. Implementing React/TypeScript frontends with component libraries and responsive design. Developing Node.js APIs and integrations (REST/GraphQL), automating testing and CI/CD. Building interactive maps and dashboards with data visualization libraries.",
    icon: React.createElement(FaReact),
    date: "2025 - Present",
  },
  {
    title: "Front-end developer",
    location: "Paris",
    description:
      "I worked as a front-end developer for Geotwin. My mission was developing and maintaining the Geotwin platform, the landing page project, and managing external developers while reviewing their committed code. My stack includes React, Gatsby, TypeScript, Ant Design, DeckGL, and ArangoDB. I'm also open to full-stack opportunities.",
    icon: React.createElement(FaReact),
    date: "2021 - 2024",
  },
  {
    title: "Full-stack developer internship · Datascio",
    location: "Ile-de-France",
    description:
      "6-month internship as a full-stack developer, building a POC for managing data using a pipeline.",
    icon: React.createElement(CgWorkAlt),
    date: "Mar 2020 - Sep 2020",
  },
  {
    title: "Master's degree · IAE Rouen",
    location: "Rouen",
    description:
      "Dual-competence master's degree.",
    icon: React.createElement(LuGraduationCap),
    date: "2019 - 2020",
  },
  {
    title: "Front-end developer internship · Orange",
    location: "Arcueil",
    description:
      "6-month internship as a front-end developer, building an internal user interface for managers.",
    icon: React.createElement(CgWorkAlt),
    date: "Mar 2019 - Sep 2019",
  },
  {
    title: "Erasmus exchange · Télécom SudParis",
    location: "Évry",
    description:
      "Erasmus exchange at Télécom SudParis, during my engineering studies.",
    icon: React.createElement(LuGraduationCap),
    date: "2018 - 2019",
  },
  {
    title: "Engineering degree · INPT",
    location: "Rabat",
    description:
      "Engineering school. I obtained my engineering degree.",
    icon: React.createElement(LuGraduationCap),
    date: "2016 - 2019",
  },
] as const;

export const projectsData = [
  {
    title: "ECG 3D Visualization",
    description:
      "Medical visualization prototype: a real-time 3D point cloud around a heart, with point selection and pinning, and a 500 Hz ECG monitor. One instanced mesh, tested with Vitest.",
    tags: ["React", "TypeScript", "Three.js", "React Three Fiber", "uPlot", "Vitest"],
    imageUrl: ecg3dImg,
    url: "https://ecg-3d-visualization.vercel.app/",
  },
  {
    title: "GitInsights",
    description:
      "AI-powered repository analysis dashboard providing insights about code quality, security, and performance with intelligent file analysis and detailed reporting.",
    tags: ["React", "Node.js", "Express", "Claude AI", "Recharts", "Tailwind"],
    imageUrl: gitInsightsImg,
    url: "https://git-insights-frontend.vercel.app/",
  },
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
  "D3.js",
  "Three.js",
  "React Three Fiber",
  "uPlot",
  "Vitest"
] as const;