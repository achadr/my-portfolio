import { skillsData } from "./data";
import { CONTACT_EMAIL } from "./contact";
import { SOCIAL } from "./site";

/**
 * Single source of truth for the "who am I" content.
 * Projects, experiences and the flat skills list still live in ./data.ts;
 * this file adds the profile, and groups skills so they can be linked
 * to projects and career steps (see ./relations.ts).
 */

export const profile = {
  name: "Achraf Bougattaya",
  email: CONTACT_EMAIL,
  cv: "/ACHRAF-BOUGATTAYA-CV_EN.pdf",
  linkedin: SOCIAL.linkedin,
  github: SOCIAL.github,
  pitch:
    "From internal management tools to geospatial platforms, I build interactive web apps and map visualisations with React and TypeScript.",
  facts: [
    "React · TypeScript · Next.js",
    "DeckGL · Mapbox · Three.js",
    "Node.js · MongoDB · GraphQL",
    "Geotwin · 2021–2024",
  ],
} as const;

export type SkillName = (typeof skillsData)[number];

export type SkillGroup = {
  id: string;
  name: string;
  /** Short label used inside the skill tree nodes. */
  short: string;
  /** Accent colour of the group (tree + highlights). */
  color: string;
  tagline: string;
  skills: readonly SkillName[];
};

// Every name below must exist in `skillsData` (checked by the type above).
export const skillGroups: readonly SkillGroup[] = [
  {
    id: "frontend",
    name: "Front-end",
    short: "Front-end",
    color: "#4f46e5",
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
    name: "3D, maps & data viz",
    short: "3D & viz",
    color: "#9333ea",
    tagline: "3D scenes, interactive maps and readable charts for dense data.",
    skills: ["Three.js", "React Three Fiber", "DeckGL", "Mapbox", "Recharts", "D3.js", "uPlot"],
  },
  {
    id: "backend",
    name: "Back-end, data & tooling",
    short: "Back-end",
    color: "#059669",
    tagline: "APIs and databases that feed the interface.",
    skills: ["Node.js", "MongoDB", "GraphQL", "Apollo", "Python", "Git", "Vitest"],
  },
];

/**
 * Career path shown on the map, in chronological order. `experience` is the
 * index of the matching entry in `experiencesData` (./data.ts, newest first);
 * `year` is a start date, only used to order the stops and to label the
 * current year. Positions are approximate: this is a schematic map, and
 * `dx`/`dy` (map units) fan out stops that are only a few kilometres apart so
 * their markers and labels do not overlap.
 */
export type CareerStop = {
  label: string;
  lat: number;
  lon: number;
  year: number;
  experience: number;
  /** Which side of the marker the label sits on. */
  labelSide: "left" | "right";
  dx?: number;
  dy?: number;
};

export const careerPath: readonly CareerStop[] = [
  { label: "INPT · Rabat", lat: 34.02, lon: -6.84, year: 2016, experience: 6, labelSide: "right" },
  { label: "Télécom SudParis · Évry", lat: 48.63, lon: 2.44, year: 2018, experience: 5, labelSide: "right", dx: 8, dy: 30 },
  { label: "Orange · Arcueil", lat: 48.81, lon: 2.33, year: 2019.17, experience: 4, labelSide: "left", dx: -14, dy: 15 },
  { label: "IAE Rouen", lat: 49.44, lon: 1.1, year: 2019.75, experience: 3, labelSide: "left" },
  { label: "Datascio · Île-de-France", lat: 48.7, lon: 2.6, year: 2020.17, experience: 2, labelSide: "right", dx: 16, dy: 14 },
  { label: "Geotwin · Paris", lat: 48.85, lon: 2.35, year: 2021, experience: 1, labelSide: "right" },
  { label: "Freelance · France", lat: 45.4, lon: 1.0, year: 2025, experience: 0, labelSide: "right" },
];

/**
 * Real-scale bars of the career timeline (one lane per step, oldest first).
 * `from`/`to` are in years. Steps dated by year only cover the whole calendar
 * years named ("2016 - 2019" runs to 2020.0); the two internships use their months.
 * "Present" ends at the end of the axis.
 */
export type CareerSpan = { experience: number; label: string; from: number; to: number };

export const careerSpans: readonly CareerSpan[] = [
  { experience: 6, label: "INPT", from: 2016, to: 2020 },
  { experience: 5, label: "Erasmus", from: 2018, to: 2020 },
  { experience: 4, label: "Orange", from: 2019.17, to: 2019.67 },
  { experience: 3, label: "IAE Rouen", from: 2019, to: 2021 },
  { experience: 2, label: "Datascio", from: 2020.17, to: 2020.67 },
  { experience: 1, label: "Geotwin", from: 2021, to: 2025 },
  { experience: 0, label: "Freelance", from: 2025, to: 2027 },
];

export const TIMELINE_FROM = 2016;
export const TIMELINE_TO = 2027;
