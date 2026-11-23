import { experiencesData, projectsData, skillsData } from "./data";
import type { SkillName } from "./content";

// Whole-word, case-insensitive match so "Git" does not match "digital"
// and "Mapbox" still matches the tag "Mapbox GL".
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mentions = (text: string, name: string) =>
  new RegExp(`(^|[^a-z0-9])${escapeRegExp(name)}([^a-z0-9]|$)`, "i").test(text);

export const projectAnchor = (index: number) => `project-${index}`;
export const experienceAnchor = (index: number) => `experience-${index}`;

export function projectsUsing(skill: SkillName) {
  return projectsData
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => project.tags.some((tag) => mentions(tag, skill)));
}

export function experiencesUsing(skill: SkillName) {
  return experiencesData
    .map((experience, index) => ({ experience, index }))
    .filter(({ experience }) =>
      mentions(`${experience.title} ${experience.description}`, skill)
    );
}

/** Skills (from the skills list) that an experience entry mentions. */
export function skillsInExperience(index: number): SkillName[] {
  const experience = experiencesData[index];
  if (!experience) return [];
  const text = `${experience.title} ${experience.description}`;
  return skillsData.filter((skill) => mentions(text, skill));
}
