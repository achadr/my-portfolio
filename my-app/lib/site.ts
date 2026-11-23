/**
 * Everything SEO / sharing related that must stay consistent: the public URL of
 * the site, titles, descriptions and social links. Kept dependency-free so the
 * layout, sitemap, robots and share-image routes can all import it.
 */

// The public address of the site, in order of preference:
//  1. NEXT_PUBLIC_SITE_URL, set in Vercel once the site has its own domain;
//  2. VERCEL_PROJECT_PRODUCTION_URL, the production domain that Vercel exposes
//     (it follows a custom domain automatically);
//  3. the current vercel.app address.
const raw =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://my-portfolio-achraf-bougattaya.vercel.app");

export const SITE_URL = raw.replace(/\/+$/, "");

export const SITE = {
  name: "Achraf Bougattaya",
  role: "Front-end Developer",
  title: "Achraf Bougattaya | Front-end Developer, React & TypeScript",
  description:
    "Front-end developer with 4+ years of experience building React and TypeScript web apps and interactive map platforms (DeckGL, Mapbox). Explore my projects, skills and career.",
  shortDescription:
    "Front-end developer with 4+ years of experience in React, TypeScript, Next.js and interactive maps.",
  keywords: [
    "Achraf Bougattaya",
    "Front-end Developer",
    "React Developer",
    "TypeScript",
    "Next.js",
    "DeckGL",
    "Mapbox",
    "Three.js",
    "Data visualization",
    "Portfolio",
  ],
} as const;

export const SOCIAL = {
  linkedin: "https://www.linkedin.com/in/achraf-bougattaya-747320177/",
  github: "https://github.com/achadr?tab=repositories",
} as const;

/** Skills listed in the structured data (all of them appear on the site). */
export const KNOWS_ABOUT = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "GraphQL",
  "DeckGL",
  "Mapbox",
  "D3.js",
  "Three.js",
  "React Three Fiber",
  "Data visualization",
] as const;
