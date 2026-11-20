/**
 * What the telescope of the 3D room shows: my path through the stack, one celestial object per layer,
 * from the pixel to the cloud, and what comes next.
 * x / y place each star of the constellation, in % of the eyepiece.
 */
export type TelescopeStatus = "done" | "now" | "next";

export type TelescopeStep = {
  x: number;
  y: number;
  status: TelescopeStatus;
  /** Short name under the star. */
  label: string;
  /** The celestial object drawn for this step. */
  object: string;
  title: string;
  text: string;
  chips: string[];
};

export const TELESCOPE_STATUS: Record<TelescopeStatus, string> = {
  done: "Done",
  now: "In progress",
  next: "Next",
};

export const TELESCOPE_INTRO = {
  title: "From the pixel to the cloud",
  text: "I started with the interface. Since then, every time I understood one layer, I looked at the one behind it.",
};

/** What the telescope says before the journey starts: the beginning of the story. */
export const TELESCOPE_LOG = [
  "The first thing I ever built was a screen: a few pixels, a button, a page that answered back.",
  "Then I got curious. What draws the map behind the page? What answers when you press the button? Where does it all go once it leaves my machine?",
  "Every answer opened a new layer. This telescope follows them, stop by stop, from the first pixel to a sky I am still learning to read.",
];

export const TELESCOPE_STEPS: TelescopeStep[] = [
  {
    x: 24,
    y: 68,
    status: "done",
    label: "Front-end",
    object: "A star made of pixels",
    title: "Front-end",
    text: "Every light on a screen is made of tiny points. That is where I started: placing each one with care, so the whole thing shines, and shines for everyone.",
    chips: ["React", "TypeScript", "Next.js", "Tailwind"],
  },
  {
    x: 34,
    y: 48,
    status: "done",
    label: "Maps & 3D",
    object: "The Earth, turning",
    title: "Maps, 3D & data viz",
    text: "Then I wanted to see beyond the screen: the whole planet, its cities, the paths between them. I learned to draw the world, then to give it depth.",
    chips: ["DeckGL", "Mapbox", "Three.js", "D3"],
  },
  {
    x: 50,
    y: 60,
    status: "done",
    label: "Back-end",
    object: "Inside the Earth",
    title: "Back-end",
    text: "A planet only lives because of what happens at its core, where nobody looks. I learned to build that part too: the quiet engine beneath everything you see.",
    chips: ["Node.js", "Express", "MongoDB", "GraphQL"],
  },
  {
    x: 62,
    y: 44,
    status: "done",
    label: "Docker & CI/CD",
    object: "A launch",
    title: "Shipping",
    text: "What is built on the ground only matters once it flies. So I learned to pack it, check it and send it up, again and again, without holding my breath.",
    chips: ["Docker", "GitHub Actions", "Vitest"],
  },
  {
    x: 72,
    y: 30,
    status: "now",
    label: "Cloud",
    object: "A cloud where new stars are born",
    title: "Cloud & architecture",
    text: "Up here, nothing lives on a single machine anymore. Things float, grow, and new ones appear when they are needed. This is the sky I am learning to read now: I am preparing the Google Cloud Associate Cloud Engineer certification.",
    chips: ["GCP", "Associate Cloud Engineer · in progress", "Architecture"],
  },
  {
    x: 50,
    y: 22,
    status: "next",
    label: "Next",
    object: "Not in focus yet",
    title: "Next",
    text: "Some things can’t be seen yet, only sensed. I keep the telescope pointed that way.",
    chips: [],
  },
];

/** The step the telescope opens on: what I am doing now. */
export const TELESCOPE_NOW = TELESCOPE_STEPS.findIndex((s) => s.status === "now");
