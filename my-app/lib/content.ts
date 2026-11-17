import { skillsData } from "./data";

/**
 * Single source of truth for the "who am I" content.
 * Projects, experiences and the flat skills list still live in ./data.ts;
 * this file adds the profile, and groups skills so they can be linked
 * to projects and career steps (see ./relations.ts).
 */

export const profile = {
  name: "Achraf Bougattaya",
  email: "bougattaya.achraf@gmail.com",
  cv: "/ACHRAF-BOUGATTAYA-CV_EN.pdf",
  linkedin: "https://www.linkedin.com/in/achraf-bougattaya-747320177/",
  github: "https://github.com/achadr?tab=repositories",
  pitch:
    "From internal management tools to geospatial platforms, I build interactive web apps and map visualisations with React and TypeScript.",
  facts: [
    "React · TypeScript · Next.js",
    "DeckGL · Mapbox · D3.js",
    "Node.js · MongoDB · GraphQL",
    "Geotwin · 2021–2024",
  ],
} as const;

export type SkillName = (typeof skillsData)[number];

export type SkillGroup = {
  id: string;
  name: string;
  tagline: string;
  skills: readonly SkillName[];
};

// Every name below must exist in `skillsData` (checked by the type above).
export const skillGroups: readonly SkillGroup[] = [
  {
    id: "frontend",
    name: "Front-end",
    tagline: "Typed, animated, responsive interfaces.",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Redux",
      "Tailwind",
      "Framer Motion",
    ],
  },
  {
    id: "maps",
    name: "Maps & data viz",
    tagline: "Interactive maps and readable charts for dense data.",
    skills: ["DeckGL", "Mapbox", "Recharts", "D3.js"],
  },
  {
    id: "backend",
    name: "Back-end, data & tooling",
    tagline: "APIs and databases that feed the interface.",
    skills: ["Node.js", "MongoDB", "GraphQL", "Apollo", "Python", "Git"],
  },
];
