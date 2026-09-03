// Shared type definitions for the portfolio knowledge base.
//
// These files are the single source of truth for everything SibzAI knows about
// Siba. They are imported by BOTH the Supabase edge function (Deno) and the
// React frontend (Vite, via the `@profile` alias), so they must stay free of
// any runtime that only one side has:
//   - no React, no JSX, no `@/` alias imports
//   - no bundler asset imports (use `public/` path strings instead)
//   - relative imports must carry an explicit `.ts` extension (Deno requires it)
//
// Anything added here also ships in the browser bundle, so never put private
// information in the profile.

/** A lucide-react icon name, resolved to a component by the frontend only. */
export type IconName = string;

export interface Link {
  label: string;
  url: string;
}

export interface Identity {
  name: string;
  shortName: string;
  /** Alternate spellings people may type when asking about him. */
  aliases: string[];
  headline: string;
  location: string;
  /** Path under `public/`, e.g. "/profile/siba.jpg". Empty string = use fallback. */
  avatar: string;
  avatarAlt: string;
  tagline: string;
  /** One-paragraph answer to "Who is Siba?". */
  summary: string;
  /** Short punchy version used in cards and the empty state. */
  elevatorPitch: string;
  email: string;
  links: Link[];
  /** Downloadable CV. `path` lives under `public/`; omit the field to hide every download button. */
  cv?: {
    path: string;
    /** Filename the visitor's browser saves it as. */
    filename: string;
    /** Shown next to the button, e.g. "PDF · 132 KB". */
    meta: string;
  };
}

export interface Role {
  title: string;
  org: string;
  location: string;
  period: string;
  current: boolean;
  summary: string;
  highlights: string[];
}

export interface SkillGroup {
  id: string;
  label: string;
  icon: IconName;
  items: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  /** Path under `public/` or an absolute URL. */
  image: string;
  link: string;
  repo?: string;
  featured: boolean;
}

/**
 * A photo or clip attached to a hobby.
 *
 * `src` is either a path under `public/` (e.g. "/hobbies/football/shirt.jpg"),
 * an absolute URL, or — for `kind: "embed"` — a YouTube/Vimeo *embed* URL.
 * Files that fail to load are dropped from the gallery at runtime, so it is safe
 * to list media before the file has actually been added.
 */
export interface MediaItem {
  kind: "image" | "video" | "embed";
  src: string;
  /** Describes the media for screen readers. Required — keep it specific. */
  alt: string;
  /** Optional visible caption, shown under the media in the lightbox. */
  caption?: string;
  /** Poster frame for `video`. Strongly recommended: without it the tile is blank until play. */
  poster?: string;
}

export interface Hobby {
  id: string;
  label: string;
  icon: IconName;
  /** One sentence shown on the card. Keep it under ~140 characters. */
  blurb: string;
  /** Extra detail the AI can draw on when asked to go deeper. */
  details: string[];
  /** Photos and clips shown as a thumbnail strip that opens a lightbox. */
  media: MediaItem[];
}

export interface EducationEntry {
  qualification: string;
  institution: string;
  location: string;
  period: string;
}

export interface CertificationGroup {
  label: string;
  items: string[];
}

export interface Profile {
  identity: Identity;
  roles: Role[];
  skillGroups: SkillGroup[];
  projects: Project[];
  hobbies: Hobby[];
  education: EducationEntry[];
  certifications: CertificationGroup[];
  goals: string[];
  languages: string[];
  /** Topics SibzAI should decline, beyond the general off-topic rule. */
  offLimits: string[];
}
